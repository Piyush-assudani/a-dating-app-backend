const cron = require('node-cron');
const User = require('../models/user.model');
const fcmService = require('./fcm.service');
const dbService = require('./db.service');
const cacheService = require('./cache.service');
const path = require('path');
const fs = require('fs');

let notificationsPlan = [];
try {
  const jsonPath = path.join(__dirname, '../data/retention_notifications.json');
  if (fs.existsSync(jsonPath)) {
    notificationsPlan = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`[Cron Service] Loaded ${notificationsPlan.length} chatpate dating notifications.`);
  }
} catch (e) {
  console.error('[Cron Service] Failed to load retention notifications JSON:', e.message);
}

const CRUSH_NAMES = ['Aarav', 'Riya', 'Kabir', 'Ananya', 'Aditya', 'Tara', 'Samar', 'Pooja', 'Rohan', 'Meera'];

class CronService {
  start() {
    // 1. Morning Hook (10:30 AM IST) - Coffee, Witty Wakeup & Curiosity Sparks
    cron.schedule('30 10 * * *', async () => {
      console.log('[Cron Service] Running Morning 10:30 AM IST Chatpata Dating Hook');
      await this.dispatchSlotNotification('morning');
    }, { scheduled: true, timezone: 'Asia/Kolkata' });

    // 2. Afternoon Hook (3:30 PM IST) - Tea-time FOMO, Profile Heat & Polls
    cron.schedule('30 15 * * *', async () => {
      console.log('[Cron Service] Running Afternoon 3:30 PM IST Chatpata Dating Hook');
      await this.dispatchSlotNotification('afternoon');
    }, { scheduled: true, timezone: 'Asia/Kolkata' });

    // 3. Night Hook (9:30 PM IST) - Late-night banter, Date plans & Match Sparks
    cron.schedule('30 21 * * *', async () => {
      console.log('[Cron Service] Running Night 9:30 PM IST Chatpata Dating Hook');
      await this.dispatchSlotNotification('night');
    }, { scheduled: true, timezone: 'Asia/Kolkata' });

    console.log('[Cron Service] 40-Day Dating Cron jobs initialized (10:30 AM, 3:30 PM, 9:30 PM IST).');
  }

  async dispatchSlotNotification(slot) {
    try {
      let users = [];
      if (dbService.ready) {
        users = await User.find({ fcmToken: { $exists: true, $ne: '' } }).lean();
      } else {
        users = cacheService.get('active_users') || [];
      }

      const now = new Date();

      for (const user of users) {
        if (!user.fcmToken) continue;

        const createdAt = user.createdAt ? new Date(user.createdAt) : now;
        const diffDays = Math.max(0, Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)));
        const rawDay = diffDays + 1;
        // Infinite 40-day loop
        const effectiveDay = ((rawDay - 1) % 40) + 1;

        const notifTemplate = notificationsPlan.find(
          n => n.day === effectiveDay && n.slot === slot
        ) || notificationsPlan[0];

        if (!notifTemplate) continue;

        const randomCrush = CRUSH_NAMES[Math.floor(Math.random() * CRUSH_NAMES.length)];
        const views = String(Math.floor(Math.random() * 6) + 3);
        const matches = String(Math.floor(Math.random() * 4) + 2);
        const userName = user.firstName || user.name || 'Hey';
        const userCity = user.city || 'your city';

        const title = notifTemplate.title
          .replace(/{name}/g, userName)
          .replace(/{city}/g, userCity)
          .replace(/{views}/g, views)
          .replace(/{matches}/g, matches)
          .replace(/{crush_name}/g, randomCrush);

        const body = notifTemplate.body
          .replace(/{name}/g, userName)
          .replace(/{city}/g, userCity)
          .replace(/{views}/g, views)
          .replace(/{matches}/g, matches)
          .replace(/{crush_name}/g, randomCrush);

        await fcmService.sendPushNotification(
          user.fcmToken,
          title,
          body,
          {
            type: notifTemplate.type || 'dating_spark',
            day: String(effectiveDay),
            slot: slot
          }
        );
      }
      console.log(`[Cron Service] Dispatched ${slot} dating hooks to ${users.length} registered members.`);
    } catch (err) {
      console.error(`[Cron Service Error] Failed in ${slot} notification dispatch:`, err.message);
    }
  }
}

module.exports = new CronService();
