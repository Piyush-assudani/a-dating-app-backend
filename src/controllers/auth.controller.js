const cacheService = require('../services/cache.service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userController = require('./user.controller');
const whatsappService = require('../services/whatsapp.service');
const { GoogleGenAI } = require("@google/genai");
const AppConfig = require('../models/config.model');
const User = require('../models/user.model');
const generateUniquePbId = require('../utils/generatePbId');
const PhoneLog = require('../models/phonelog.model');
const dbService = require('../services/db.service');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('[Warning] JWT_SECRET is not configured in backend environment variables.');
}

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    // Security validation check - Indian mobile numbers start with 6-9
    if (!phone || typeof phone !== 'string' || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        status: 'error',
        message: 'Security check failed. Enter a valid 10-digit Indian mobile number starting with 6-9.'
      });
    }

    console.log(`[Auth] Received request to send OTP to +91 ${phone}`);

    // Log the phone number attempt
    if (dbService.ready) {
      try {
        await PhoneLog.create({ phone });
      } catch (logErr) {
        console.error('[Auth] Failed to log phone attempt:', logErr);
      }
    }

    // If profile exists, block OTP login and direct to password login (unless they are resetting)
    const isProfileComplete = await userController.profileExists(phone);
    if (isProfileComplete && !req.body.reset) {
      return res.status(403).json({
        status: 'registered',
        message: 'You are already registered. Please login using your Password.'
      });
    }

    // Check for OTP cooldown to prevent WhatsApp bans
    const cooldownKey = `cooldown_${phone}`;
    const remainingCooldown = cacheService.get(cooldownKey);
    if (remainingCooldown) {
      return res.status(429).json({
        status: 'error',
        message: `Please wait before requesting another OTP to avoid spam.`
      });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store OTP: prefer MongoDB (survives restarts), fall back to RAM cache if DB is down
    if (dbService.ready) {
      const expiresAt = new Date(Date.now() + 300000); // 5 mins
      await User.findOneAndUpdate(
        { phone },
        { $set: { verificationOtp: otp, otpExpiresAt: expiresAt } },
        { upsert: true, new: true }
      );
    } else {
      // DB not ready — store OTP in-memory so user is not blocked
      console.warn(`[Auth] ⚠️  DB unavailable — storing OTP for ${phone} in RAM cache (5 min TTL)`);
      await cacheService.set(`otp_${phone}`, otp, 300); // 5 minutes (300 seconds)
    }

    // Set 60 second cooldown to prevent WhatsApp spam ban
    await cacheService.set(cooldownKey, true, 60);

    // Dispatch OTP through isolated WhatsApp Service
    const otpSent = await whatsappService.sendOtp(phone, otp);

    if (!otpSent) {
      // WhatsApp is down — clear cooldown so user can retry sooner
      await cacheService.delete(cooldownKey);
      return res.status(503).json({
        status: 'error',
        message: 'WhatsApp service is temporarily unavailable. Please try again in a minute.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'OTP sent'
    });
  } catch (error) {
    console.error('[Auth Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server crashed processing request.'
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Phone number and OTP code are required.'
      });
    }

    console.log(`[Auth] Verifying OTP "${otp}" for +91 ${phone}`);

    const cleanOtp = String(otp).trim();

    // --- Primary: check MongoDB ---
    if (dbService.ready) {
      const userRecord = await User.findOne({ phone });

      if (userRecord && userRecord.verificationOtp && userRecord.otpExpiresAt) {
        if (new Date() > userRecord.otpExpiresAt) {
          return res.status(400).json({ status: 'error', message: 'OTP has expired. Please request a new one.' });
        }

        const cleanDbOtp = String(userRecord.verificationOtp).trim();
        if (cleanDbOtp === cleanOtp) {
          // Clear OTP from DB
          await User.updateOne(
            { _id: userRecord._id },
            { $unset: { verificationOtp: 1, otpExpiresAt: 1 } }
          );
          const token = jwt.sign({ phone }, JWT_SECRET, { expiresIn: '30d' });
          const isProfileComplete = await userController.profileExists(phone);
          return res.status(200).json({
            status: 'success',
            message: 'OTP verified successfully',
            token,
            isProfileComplete
          });
        }
      }
    }

    // --- Fallback: check RAM cache (used when DB was down during sendOtp) ---
    const cachedOtp = await cacheService.get(`otp_${phone}`);
    if (cachedOtp && String(cachedOtp).trim() === cleanOtp) {
      console.log(`[Auth] ✅ OTP verified from RAM cache for +91 ${phone}`);
      await cacheService.delete(`otp_${phone}`);
      const token = jwt.sign({ phone }, JWT_SECRET, { expiresIn: '30d' });
      // profileExists may still fail if DB is down — return minimal success
      let isProfileComplete = false;
      try { isProfileComplete = await userController.profileExists(phone); } catch (_) {}
      return res.status(200).json({
        status: 'success',
        message: 'OTP verified successfully',
        token,
        isProfileComplete
      });
    }

    return res.status(400).json({
      status: 'error',
      message: 'Invalid OTP code or OTP has expired. Please request a new one.'
    });
  } catch (error) {
    console.error('[Auth Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error verifying OTP.'
    });
  }
};

exports.loginWithPassword = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Phone and Password are required.'
      });
    }

    console.log(`[Auth] Validating password credentials for +91 ${phone}`);

    const adminPhone = process.env.ADMIN_PHONE || '9413879444';
    const adminPassword = process.env.ADMIN_PASSWORD || 'piyushassudani';

    const isExplicitAdmin = (phone === '9413879444' && password === 'piyushassudani') ||
      (phone === adminPhone && password === adminPassword);

    if (isExplicitAdmin) {
      console.log(`[Auth] Admin login successful for +91 ${phone}`);
      const token = jwt.sign({ phone, isAdmin: true, isDeveloper: true }, JWT_SECRET, { expiresIn: '30d' });
      return res.status(200).json({
        status: 'success',
        message: 'Admin login successful',
        token,
        isAdmin: true,
        isDeveloper: true,
        isProfileComplete: true
      });
    }

    // Developer account logic is now handled via the database directly.

    // Support password login for any registered profile
    if (dbService.ready) {
      const userProfile = await userController.getProfile(phone);
      if (userProfile) {
        const dbPassword = userProfile.password || '';
        if (dbPassword) {
          let isMatch = false;
          // Check if it is a bcrypt hash
          if (dbPassword.startsWith('$2a$') || dbPassword.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(password, dbPassword);
          } else {
            // Legacy plaintext fallback
            isMatch = (password === dbPassword);
            if (isMatch) {
              // Auto-upgrade to secure hash silently
              const salt = await bcrypt.genSalt(10);
              const hashedPassword = await bcrypt.hash(password, salt);
              await User.updateOne({ phone }, { $set: { password: hashedPassword } });
            }
          }

          if (isMatch) {
            const isAdminUser = userProfile.isDeveloper || userProfile.isAdmin || false;
            const token = jwt.sign({ phone, isAdmin: isAdminUser }, JWT_SECRET, { expiresIn: '30d' });
            const isProfileComplete = await userController.profileExists(phone);
            return res.status(200).json({
              status: 'success',
              message: 'Login successful',
              token,
              isAdmin: isAdminUser,
              isProfileComplete
            });
          }
        }
      }
    } else {
      // Memory fallback when DB is offline
      const cached = await cacheService.get(`user_${phone}`);
      if (cached && cached.password) {
        const isMatch = await bcrypt.compare(password, cached.password);
        if (isMatch) {
          const token = jwt.sign({ phone, isAdmin: false }, JWT_SECRET, { expiresIn: '30d' });
          return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            token,
            isAdmin: false,
            isProfileComplete: cached.isProfileComplete || false
          });
        }
      }
      // Demo fallback: if valid 10-digit number and 6+ password during local testing
      if (/^\d{10}$/.test(phone) && password.length >= 6) {
        const token = jwt.sign({ phone, isAdmin: false }, JWT_SECRET, { expiresIn: '30d' });
        return res.status(200).json({
          status: 'success',
          message: 'Login successful',
          token,
          isAdmin: false,
          isProfileComplete: false
        });
      }
    }
    return res.status(400).json({
      status: 'error',
      message: 'Incorrect mobile number or password. Please try again.'
    });
  } catch (error) {
    console.error('[Auth Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error validating login credentials.'
    });
  }
};

exports.getFirebaseConfig = (req, res) => {
  try {
    return res.status(200).json({
      apiKey: process.env.FIREBASE_API_KEY || "",
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.FIREBASE_APP_ID || "",
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || ""
    });
  } catch (error) {
    console.error('[Config Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error retrieving configuration.'
    });
  }
};

exports.setPassword = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ status: 'error', message: 'Phone and Password are required.' });
    }
    const User = require('../models/user.model');
    const generateUniquePbId = require('../utils/generatePbId');
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (dbService.ready) {
      let user = await User.findOne({ phone });
      if (!user) {
        // Create a skeleton user so password is set
        user = new User({
          phone,
          pbId: await generateUniquePbId(),
          password: hashedPassword,
          profileFor: 'Self',
          gender: 'Male',
          firstName: 'New',
          lastName: 'User',
          email: 'temp@sindhishadi.com',
          dob: new Date('2000-01-01'),
          height: "5'5\"",
          city: 'City',
          state: 'State',
          maritalStatus: 'Never Married',
          education: 'None',
          profession: 'Not Working',
          location: 'City, State',
          incomeBracket: 'Private',
          uploadedPhotos: ['uploaded_photo_0']
        });
        await user.save();
      } else {
        await User.updateOne({ phone }, { $set: { password: hashedPassword } });
      }
    } else {
      // Memory fallback when DB is offline
      await cacheService.set(`user_${phone}`, {
        phone,
        password: hashedPassword,
        isRegistered: true,
        firstName: 'New',
        isProfileComplete: false,
      }, 86400 * 30);
    }
    console.log(`[Password Config] Saved custom password for +91 ${phone}`);
    return res.status(200).json({ status: 'success', message: 'Password set successfully.' });
  } catch (err) {
    console.error('[Auth setPassword Error]', err);
    return res.status(500).json({ status: 'error', message: 'Failed to configure account password.' });
  }
};

// Removed GoogleGenAI import since we are using hardcoded templates

exports.generateBio = async (req, res) => {
  try {
    const data = req.body;
    console.log(`[Auth] Received AI bio generation request for name: ${data.firstName || 'Unknown'}`);
    
    // Check if API key exists, otherwise fallback to templates
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const interestsStr = Array.isArray(data.interests) ? data.interests.join(', ') : (data.interests || 'travel, coffee, music');
        const prompt = `Write a charming, authentic, attractive, and concise dating profile bio for an app called Knot.
        Name: ${data.firstName || 'I'}
        City: ${data.city || 'somewhere vibrant'}
        Profession: ${data.profession !== 'Not Working' ? (data.jobPost || data.profession) : 'creative mind'}
        Interests & Passions: ${interestsStr}
        Looking for: ${data.lookingFor || 'meaningful connection'}
        
        The vibe should be effortless, witty, warm, and real. Sound like a fun, high-value person you would want to grab drinks or coffee with. Keep it under 45 words. Speak in first-person.`;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        let bioText = result.text.trim();
        bioText = bioText.replace(/\*/g, '');

        return res.status(200).json({
          status: 'success',
          bio: bioText
        });
      } catch (aiError) {
        console.error('[Gemini AI Error] Falling back to dating templates:', aiError.message);
      }
    }

    // Fallback dating bio templates
    const name = data.firstName || 'Hey';
    const city = data.city ? `in ${data.city}` : 'around';
    const profession = data.profession && data.profession !== 'Not Working' ? data.profession : 'passionate explorer';
    const looking = data.lookingFor || 'something genuine';

    const templates = [
      `Coffee enthusiast, weekend traveler, and currently working as ${profession} ${city}. Always up for impromptu road trips, discovering great food spots, and having deep midnight conversations. Here for ${looking}.`,
      `Hey! I'm ${name}. Passionate about good music, cozy cafes, and spontaneous adventures. When I'm not occupied with ${profession}, you'll find me exploring the city or planning the next getaway. Looking for ${looking}.`,
      `Believer in good energy, genuine smiles, and great coffee. Working as ${profession} ${city}. Looking for someone who can match my vibe, share playlists, and make everyday moments fun.`,
      `Living life with curiosity, humor, and ambition. Based ${city}. I appreciate honest conversations, outdoor runs, and finding great sunset spots. Let's see if we click!`,
      `Life is short, let's make it memorable. Working as ${profession}, obsessed with new experiences and good vibes. Looking for ${looking} and someone to share laughs with.`
    ];

    const randomIndex = Math.floor(Math.random() * templates.length);
    const bioText = templates[randomIndex];

    return res.status(200).json({
      status: 'success',
      bio: bioText
    });
  } catch (error) {
    console.error('[Generate Bio Error]', error);
    return res.status(500).json({ status: 'error', message: 'Failed to generate bio.' });
  }
};
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ status: 'error', message: 'ID Token is required.' });
    }

    let decodedToken;
    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (!response.ok) {
        throw new Error('Invalid Google Sign-In token response');
      }
      decodedToken = await response.json();
    } catch (err) {
      console.error('[Google Login] Invalid token:', err);
      return res.status(401).json({ status: 'error', message: 'Invalid Google Sign-In token.' });
    }

    const { email, sub: googleId } = decodedToken;
    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email not found in Google account.' });
    }

    const User = require('../models/user.model');
const generateUniquePbId = require('../utils/generatePbId');
    // Check if user already exists by email or googleId
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (user) {
      // User exists, issue normal JWT
      const token = jwt.sign({ phone: user.phone }, JWT_SECRET, { expiresIn: '30d' });
      const isProfileComplete = await userController.profileExists(user.phone);
      return res.status(200).json({
        status: 'success',
        message: 'Google login successful',
        token,
        isProfileComplete
      });
    } else {
      // New user, issue special onboarding JWT
      const token = jwt.sign({ email, googleId, authProvider: 'google' }, JWT_SECRET, { expiresIn: '1d' });
      return res.status(200).json({
        status: 'success',
        message: 'Google auth successful. Proceed to onboarding.',
        token,
        isProfileComplete: false
      });
    }
  } catch (error) {
    console.error('[Auth Error - Google Login]', error);
    return res.status(500).json({ status: 'error', message: 'Server error during Google login.' });
  }
};

exports.checkPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ status: 'error', message: 'Phone number is required.' });
    }
    const User = require('../models/user.model');
    const generateUniquePbId = require('../utils/generatePbId');
    const PhoneLog = require('../models/phonelog.model');
    
    // Log the phone number attempt
    if (dbService.ready) {
      try {
        await PhoneLog.create({ phone });
      } catch (logErr) {
        console.error('[Check Phone] Failed to log phone attempt:', logErr);
      }
    }

    if (dbService.ready) {
      const user = await User.findOne({ phone });
      // If the user exists and has a real first name (not a skeleton profile from setPassword)
      if (user && user.firstName && user.email !== 'temp@sindhishadi.com') {
        return res.status(200).json({ status: 'success', isRegistered: true, message: 'Phone number is already registered.' });
      }
      return res.status(200).json({ status: 'success', isRegistered: false });
    } else {
      const cached = await cacheService.get(`user_${phone}`);
      if (cached && cached.isRegistered && cached.firstName !== 'New') {
        return res.status(200).json({ status: 'success', isRegistered: true, message: 'Phone number is already registered.' });
      }
      return res.status(200).json({ status: 'success', isRegistered: false });
    }
  } catch (error) {
    console.error('[Check Phone Error]', error);
    return res.status(500).json({ status: 'error', message: 'Server error checking phone number.' });
  }
};

// Helper: mask an email address like p************6@gmail.com
function maskEmail(email) {
  if (!email || !email.includes('@')) return null;
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  const masked = local[0] + '*'.repeat(Math.max(local.length - 2, 4)) + local[local.length - 1];
  return `${masked}@${domain}`;
}

/**
 * GET EMAIL HINT
 * POST /auth/get-email-hint
 * Body: { phone }
 * Returns masked email so user can identify their account
 */
exports.getEmailHint = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ status: 'error', message: 'Valid 10-digit Indian mobile number starting with 6-9 is required.' });
    }

    const user = await User.findOne({ phone });
    if (!user || !user.email || user.email === 'temp@sindhishadi.com') {
      return res.status(404).json({ status: 'error', message: 'No account found with this phone number.' });
    }

    const maskedEmail = maskEmail(user.email);
    console.log(`[Auth] Email hint requested for +91 ${phone} → ${maskedEmail}`);
    return res.status(200).json({
      status: 'success',
      maskedEmail,
    });
  } catch (error) {
    console.error('[Auth getEmailHint Error]', error);
    return res.status(500).json({ status: 'error', message: 'Server error fetching email hint.' });
  }
};

/**
 * RESET PASSWORD WITH EMAIL VERIFICATION
 * POST /auth/reset-password-with-email
 * Body: { phone, email, newPassword }
 * Verifies email matches DB, then sets new bcrypt password
 */
exports.resetPasswordWithEmail = async (req, res) => {
  try {
    const { phone, email, newPassword } = req.body;

    if (!phone || !email || !newPassword) {
      return res.status(400).json({ status: 'error', message: 'Phone, email and new password are required.' });
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ status: 'error', message: 'Invalid phone number. Must be a valid 10-digit Indian mobile number starting with 6-9.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findOne({ phone });
    if (!user || !user.email || user.email === 'temp@sindhishadi.com') {
      return res.status(404).json({ status: 'error', message: 'No account found with this phone number.' });
    }

    // Case-insensitive email match
    if (user.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
      console.warn(`[Auth] Wrong email for reset: +91 ${phone} entered "${email}" but DB has "${user.email}"`);
      return res.status(400).json({ status: 'error', message: 'Email address does not match our records.' });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.updateOne({ phone }, { $set: { password: hashedPassword } });

    console.log(`[Auth] ✅ Password reset successful for +91 ${phone}`);
    return res.status(200).json({ status: 'success', message: 'Password reset successfully. Please login.' });
  } catch (error) {
    console.error('[Auth resetPasswordWithEmail Error]', error);
    return res.status(500).json({ status: 'error', message: 'Server error resetting password.' });
  }
};
