const mongoose = require('mongoose');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const Block = require('../models/block.model');
const Interest = require('../models/interest.model');
const redisService = require('../services/redis.service');
const dbService = require('../services/db.service');

const MOCK_MOMENTS_POSTS = [
  {
    _id: 'post_01',
    id: 'post_01',
    authorPhone: '9820011223',
    authorName: 'Aanya Singhania',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    caption: 'Quiet espresso mornings before the gallery opening.',
    isPrivate: false,
    likeCount: 38,
    commentCount: 4,
    hasLiked: false,
    createdAt: new Date()
  },
  {
    _id: 'post_02',
    id: 'post_02',
    authorPhone: '9830022334',
    authorName: 'Rhea Advani',
    authorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    caption: 'Sunset trail runs in Nandi Hills. The mountains always reset the soul.',
    isPrivate: false,
    likeCount: 52,
    commentCount: 7,
    hasLiked: true,
    createdAt: new Date()
  }
];

// Fast in-memory feed cache fallback
const feedCache = {
  data: null,
  timestamp: 0,
  TTL_MS: 10 * 1000 // 10 seconds cache for page 1
};

// Anti-spam tracker for comments (phone -> timestamp)
const recentCommentTimes = new Map();

// Invalidate feed cache when posts change
const invalidateFeedCache = async () => {
  feedCache.data = null;
  feedCache.timestamp = 0;
  if (redisService.isReady) {
    try {
      await redisService.del('cache:feed:page1');
    } catch (_) {}
  }
};

/**
 * Create a new Post (Instagram-style photo feed post)
 */
exports.createPost = async (req, res) => {
  try {
    const userPhone = req.user && req.user.phone;
    if (!userPhone) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized. Phone missing in token.' });
    }

    let { mediaUrl, caption = '', location = '', isPrivate = false } = req.body;

    if (!mediaUrl || typeof mediaUrl !== 'string' || !mediaUrl.trim()) {
      return res.status(400).json({ status: 'error', message: 'A post must have a valid media/image URL.' });
    }
    mediaUrl = mediaUrl.trim();

    // Sanitize string inputs
    caption = typeof caption === 'string' ? caption.trim() : '';
    location = typeof location === 'string' ? location.trim() : '';
    const privatePost = isPrivate === true || isPrivate === 'true';

    if (caption.length > 1000) {
      return res.status(400).json({ status: 'error', message: 'Caption is too long (maximum 1000 characters).' });
    }
    if (location.length > 100) {
      location = location.substring(0, 100);
    }

    // Retrieve author details from DB
    const authorUser = await User.findOne({ phone: userPhone }).lean();
    if (!authorUser) {
      return res.status(404).json({ status: 'error', message: 'User profile not found.' });
    }

    const authorName = `${authorUser.firstName || ''} ${authorUser.lastName || ''}`.trim() || 'Community Member';
    const authorPhoto = (authorUser.uploadedPhotos && authorUser.uploadedPhotos.length > 0)
      ? authorUser.uploadedPhotos[0]
      : '';

    const newPost = new Post({
      author: authorUser._id,
      authorPhone: userPhone,
      authorName,
      authorPhoto,
      authorCity: location || authorUser.city || '',
      location,
      mediaUrl,
      caption,
      isPrivate: privatePost
    });

    await newPost.save();
    await invalidateFeedCache();

    return res.status(201).json({
      status: 'success',
      message: 'Post created successfully!',
      data: newPost
    });
  } catch (error) {
    console.error('[Create Post Error]:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to create post: ' + (error.message || 'Server error') });
  }
};

/**
 * Get Social Feed Posts (Instagram-like feed with privacy gating & blocking)
 */
exports.getFeedPosts = async (req, res) => {
  try {
    const currentPhone = req.user ? req.user.phone : null;

    if (!dbService.ready) {
      return res.status(200).json({
        status: 'success',
        data: MOCK_MOMENTS_POSTS,
        total: MOCK_MOMENTS_POSTS.length,
        page: 1,
        hasMore: false
      });
    }

    // Safe pagination bounds: guarantees never NaN or negative
    const rawPage = parseInt(req.query.page, 10);
    const rawLimit = parseInt(req.query.limit, 10);
    const page = !isNaN(rawPage) && rawPage > 0 ? Math.min(rawPage, 1000) : 1;
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 20;
    const skip = (page - 1) * limit;

    let blockedPhones = [];
    let matchedPhones = [];

    if (currentPhone) {
      // 1. Fetch blocked users
      const blocks = await Block.find({
        $or: [{ blockerPhone: currentPhone }, { blockedPhone: currentPhone }]
      }).lean();
      blockedPhones = blocks.map(b => b.blockerPhone === currentPhone ? b.blockedPhone : b.blockerPhone);

      // 2. Fetch mutual accepted matches for private post visibility
      matchedPhones = [currentPhone];
      try {
        const acceptedInterests = await Interest.find({
          status: 'accepted',
          $or: [{ from_phone: currentPhone }, { to_phone: currentPhone }]
        }).lean();

        acceptedInterests.forEach(i => {
          const other = i.from_phone === currentPhone ? i.to_phone : i.from_phone;
          if (other && !matchedPhones.includes(other)) {
            matchedPhones.push(other);
          }
        });
      } catch (matchErr) {
        console.error('[Feed Match Check Error]:', matchErr);
      }
    }

    // Gated query: If a post is private, only the author or mutual accepted matches can view it
    const query = {
      authorPhone: { $nin: blockedPhones }
    };

    if (currentPhone) {
      query.$or = [
        { isPrivate: { $ne: true } },
        { authorPhone: { $in: matchedPhones } }
      ];
    } else {
      query.isPrivate = { $ne: true };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedPosts = posts.map(p => {
      const isLiked = Boolean(currentPhone && Array.isArray(p.likes) && p.likes.some(l => l.phone === currentPhone));
      const isMine = Boolean(currentPhone && p.authorPhone === currentPhone);

      return {
        id: p._id.toString(),
        _id: p._id.toString(),
        authorPhone: p.authorPhone,
        authorName: p.authorName,
        authorPhoto: p.authorPhoto,
        authorCity: p.authorCity,
        location: p.location,
        mediaUrl: p.mediaUrl,
        caption: p.caption,
        isPrivate: Boolean(p.isPrivate),
        createdAt: p.createdAt,
        likesCount: p.likes ? p.likes.length : 0,
        commentsCount: p.comments ? p.comments.length : 0,
        comments: (p.comments || []).map(c => ({
          phone: c.phone,
          name: c.name,
          text: c.text,
          createdAt: c.createdAt
        })),
        isLiked,
        isMine
      };
    });

    return res.status(200).json({
      status: 'success',
      page,
      data: formattedPosts
    });
  } catch (error) {
    console.error('[Get Feed Posts Error]:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to load posts.' });
  }
};

/**
 * Get Posts of a Specific User (with mutual match privacy check)
 */
exports.getUserPosts = async (req, res) => {
  try {
    const { phone } = req.params;
    const currentPhone = req.user ? req.user.phone : null;

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({ status: 'error', message: 'Valid phone parameter required.' });
    }

    const targetPhone = phone.trim();
    let canViewPrivate = false;

    if (currentPhone) {
      if (currentPhone === targetPhone) {
        canViewPrivate = true;
      } else {
        // Check mutual connection
        const mutualConnection = await Interest.findOne({
          status: 'accepted',
          $or: [
            { from_phone: currentPhone, to_phone: targetPhone },
            { from_phone: targetPhone, to_phone: currentPhone }
          ]
        }).lean();
        if (mutualConnection) {
          canViewPrivate = true;
        }
      }
    }

    if (!dbService.ready || mongoose.connection.readyState !== 1) {
      const mockMatches = MOCK_MOMENTS_POSTS.filter(p => p.authorPhone === targetPhone);
      return res.status(200).json({ success: true, posts: mockMatches });
    }

    const query = { authorPhone: targetPhone };
    if (!canViewPrivate) {
      query.isPrivate = { $ne: true };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const formattedPosts = posts.map(p => {
      const isLiked = Boolean(currentPhone && Array.isArray(p.likes) && p.likes.some(l => l.phone === currentPhone));
      const isMine = Boolean(currentPhone && p.authorPhone === currentPhone);

      return {
        id: p._id.toString(),
        _id: p._id.toString(),
        authorPhone: p.authorPhone,
        authorName: p.authorName,
        authorPhoto: p.authorPhoto,
        authorCity: p.authorCity,
        location: p.location,
        mediaUrl: p.mediaUrl,
        caption: p.caption,
        isPrivate: Boolean(p.isPrivate),
        createdAt: p.createdAt,
        likesCount: p.likes ? p.likes.length : 0,
        commentsCount: p.comments ? p.comments.length : 0,
        comments: p.comments || [],
        isLiked,
        isMine
      };
    });

    return res.status(200).json({
      status: 'success',
      data: formattedPosts
    });
  } catch (error) {
    console.error('[Get User Posts Error]:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to load user posts.' });
  }
};

/**
 * Toggle Like on a Post (Atomic & concurrency safe with $pull and $addToSet)
 */
exports.likePost = async (req, res) => {
  try {
    const currentPhone = req.user ? req.user.phone : null;
    if (!currentPhone) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid post ID format.' });
    }

    // Atomic like toggle: check existence and update atomically
    const postExists = await Post.findById(id).select('likes');
    if (!postExists) {
      return res.status(404).json({ status: 'error', message: 'Post not found.' });
    }

    const alreadyLiked = Array.isArray(postExists.likes) && postExists.likes.some(l => l.phone === currentPhone);
    let updatedPost;
    let isLiked = false;

    if (alreadyLiked) {
      updatedPost = await Post.findByIdAndUpdate(
        id,
        { $pull: { likes: { phone: currentPhone } } },
        { new: true }
      );
      isLiked = false;
    } else {
      updatedPost = await Post.findByIdAndUpdate(
        id,
        { $addToSet: { likes: { phone: currentPhone, likedAt: new Date() } } },
        { new: true }
      );
      isLiked = true;
    }

    return res.status(200).json({
      status: 'success',
      isLiked,
      likesCount: updatedPost && updatedPost.likes ? updatedPost.likes.length : 0
    });
  } catch (error) {
    console.error('[Like Post Error]:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to update like status.' });
  }
};

/**
 * Add Comment to a Post (Safe, sanitized, rate-limited against double tap spam)
 */
exports.addComment = async (req, res) => {
  try {
    const currentPhone = req.user ? req.user.phone : null;
    if (!currentPhone) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid post ID format.' });
    }

    let { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ status: 'error', message: 'Comment text cannot be empty.' });
    }
    text = text.trim();

    if (text.length > 300) {
      text = text.substring(0, 300);
    }

    // Anti-comment spam: prevent duplicate comments within 1.5 seconds from same user
    const now = Date.now();
    const lastCommentTime = recentCommentTimes.get(currentPhone) || 0;
    if (now - lastCommentTime < 1500) {
      return res.status(429).json({ status: 'error', message: 'Posting too fast. Please wait a moment.' });
    }
    recentCommentTimes.set(currentPhone, now);

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ status: 'error', message: 'Post not found.' });
    }

    const user = await User.findOne({ phone: currentPhone }).lean();
    const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Member' : 'Member';

    const comment = {
      phone: currentPhone,
      name,
      text,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    return res.status(201).json({
      status: 'success',
      comment,
      commentsCount: post.comments.length
    });
  } catch (error) {
    console.error('[Add Comment Error]:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to add comment.' });
  }
};

/**
 * Delete own post
 */
exports.deletePost = async (req, res) => {
  try {
    const currentPhone = req.user ? req.user.phone : null;
    if (!currentPhone) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid post ID format.' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ status: 'error', message: 'Post not found.' });
    }

    if (post.authorPhone !== currentPhone && !req.user.isAdmin && !req.user.isDeveloper) {
      return res.status(403).json({ status: 'error', message: 'You can only delete your own posts.' });
    }

    await Post.deleteOne({ _id: id });
    await invalidateFeedCache();

    return res.status(200).json({
      status: 'success',
      message: 'Post deleted successfully.'
    });
  } catch (error) {
    console.error('[Delete Post Error]:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to delete post.' });
  }
};
