require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Interest = require('./models/interest.model');

const seedProfiles = [
  {
    phone: '9820011223',
    profileFor: 'Self',
    gender: 'Female',
    interestedIn: 'Men',
    lookingFor: 'Long-term relationship',
    interests: ['Coffee', 'Travel', 'Art', 'Indie Music'],
    drinking: 'Socially',
    smoking: 'Never',
    workout: 'Active',
    zodiac: 'Leo',
    datingPromptQuestion: 'Together we could...',
    datingPromptAnswer: 'Find the best rooftop cafes and get lost in contemporary art galleries.',
    firstName: 'Kritika',
    lastName: 'Sharma',
    dob: new Date('1998-08-22'),
    height: "5'5\"",
    city: 'Mumbai',
    state: 'Maharashtra',
    maritalStatus: 'Never Married',
    education: 'MBA, NMIMS Mumbai',
    profession: 'Brand Strategist',
    professionSector: 'Corporate Job',
    company: 'Unilever India',
    location: 'Mumbai, Maharashtra',
    bio: 'Brand strategist by day, playlist curator and avid coffee explorer by night. Love spontaneous weekend road trips and sunset walks by the beach. Looking for a genuine connection and great laughs.',
    compatibilityScore: 95,
    initials: 'KS',
    gradientColors: ['#FF9A9E', '#FECFEF'],
    uploadedPhotos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80']
  },
  {
    phone: '9833055441',
    profileFor: 'Self',
    gender: 'Male',
    interestedIn: 'Women',
    lookingFor: 'Long-term, open to short',
    interests: ['Fitness', 'Tech', 'Hiking', 'Cooking'],
    drinking: 'Socially',
    smoking: 'Never',
    workout: 'Everyday',
    zodiac: 'Scorpio',
    datingPromptQuestion: 'My ideal first date...',
    datingPromptAnswer: 'Cooking tacos together followed by an evening walk and good wine.',
    firstName: 'Rahul',
    lastName: 'Mehta',
    dob: new Date('1995-11-14'),
    height: "5'11\"",
    city: 'Pune',
    state: 'Maharashtra',
    maritalStatus: 'Never Married',
    education: 'B.Tech CS, VJTI',
    profession: 'Software Architect',
    professionSector: 'Corporate Job',
    company: 'Amazon',
    location: 'Pune, Maharashtra',
    bio: 'Tech architect by profession, amateur chef and outdoor enthusiast by heart. Always planning the next mountain trek. Seeking someone ambitious, humorous, and open-minded.',
    compatibilityScore: 92,
    initials: 'RM',
    gradientColors: ['#84FAB0', '#8FD3F4'],
    uploadedPhotos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80']
  },
  {
    phone: '9811223344',
    profileFor: 'Self',
    gender: 'Female',
    interestedIn: 'Men',
    lookingFor: 'Long-term relationship',
    interests: ['Photography', 'Travel', 'Dogs', 'Foodie'],
    drinking: 'Never',
    smoking: 'Never',
    workout: 'Sometimes',
    zodiac: 'Aquarius',
    datingPromptQuestion: 'A non-negotiable for me is...',
    datingPromptAnswer: 'Kindness to animals, good sense of humor, and emotional maturity.',
    firstName: 'Simran',
    lastName: 'Kapoor',
    dob: new Date('2000-02-10'),
    height: "5'4\"",
    city: 'Jaipur',
    state: 'Rajasthan',
    maritalStatus: 'Never Married',
    education: 'Fashion Design & Communication',
    profession: 'Visual Merchandiser',
    professionSector: 'Creative',
    company: 'Studio Design Co.',
    location: 'Jaipur, Rajasthan',
    bio: 'Creative soul with an eye for aesthetics and design. Big foodie who believes dessert should come first. Golden retriever energy looking for a genuine partner in crime.',
    compatibilityScore: 88,
    initials: 'SK',
    gradientColors: ['#F6D365', '#FDA085'],
    uploadedPhotos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80']
  },
  {
    phone: '9899001122',
    profileFor: 'Self',
    gender: 'Male',
    interestedIn: 'Women',
    lookingFor: 'Long-term relationship',
    interests: ['Live Music', 'Coffee', 'Startups', 'Cycling'],
    drinking: 'Socially',
    smoking: 'Socially',
    workout: 'Active',
    zodiac: 'Aries',
    datingPromptQuestion: 'I geek out on...',
    datingPromptAnswer: 'Vinyl records, coffee brewing methods, and building cool tech products.',
    firstName: 'Kabir',
    lastName: 'Sengupta',
    dob: new Date('1994-04-18'),
    height: "6'0\"",
    city: 'Delhi',
    state: 'Delhi',
    maritalStatus: 'Never Married',
    education: 'Masters in Economics, DU',
    profession: 'Fintech Founder',
    professionSector: 'Business',
    company: 'FinLabs India',
    location: 'Delhi, Delhi',
    bio: 'Building things on weekdays, hunting vintage vinyl and cycling on weekends. I value loyalty, passion, and having someone to share late night conversations and travel stories with.',
    compatibilityScore: 94,
    initials: 'KS',
    gradientColors: ['#A18CD1', '#FBC2EB'],
    uploadedPhotos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80']
  },
  {
    phone: '9845012345',
    profileFor: 'Self',
    gender: 'Female',
    interestedIn: 'Men',
    lookingFor: 'Casual dating, open to more',
    interests: ['Yoga', 'Reading', 'Scuba Diving', 'Baking'],
    drinking: 'Socially',
    smoking: 'Never',
    workout: 'Everyday',
    zodiac: 'Cancer',
    datingPromptQuestion: 'Together we could...',
    datingPromptAnswer: 'Adopt another dog and travel to the Mediterranean coast.',
    firstName: 'Ananya',
    lastName: 'Iyer',
    dob: new Date('1997-09-05'),
    height: "5'6\"",
    city: 'Bengaluru',
    state: 'Karnataka',
    maritalStatus: 'Never Married',
    education: 'MS Data Science',
    profession: 'AI Research Scientist',
    professionSector: 'Technology',
    company: 'Google Bangalore',
    location: 'Bengaluru, Karnataka',
    bio: 'Data scientist who loves teaching AI to understand human emotions. Certified yoga instructor on Sundays. Let’s grab craft coffee and debate sci-fi movies.',
    compatibilityScore: 91,
    initials: 'AI',
    gradientColors: ['#FF9A9E', '#FECFEF'],
    uploadedPhotos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80']
  }
];

async function seedDB() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.log('[Seed] No MONGO_URI provided in .env, skipping seed execution.');
      return;
    }
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB Atlas successfully.');

    for (const p of seedProfiles) {
      await User.findOneAndUpdate(
        { phone: p.phone },
        { ...p, email: `${p.phone}@knot.app` },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[Seed] Upserted profile: ${p.firstName} ${p.lastName}`);
    }

    console.log('[Seed] Finished seeding modern Knot dating profiles.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDB();
}

module.exports = seedProfiles;
