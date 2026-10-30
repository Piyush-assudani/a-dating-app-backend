/**
 * Knot Dating App - Comprehensive Legal & Policies Controller
 * Serves quiet luxury styled HTML and JSON endpoints for mobile & web compliance.
 */

const POLICIES = {
  'terms': {
    key: 'terms',
    title: 'Terms of Service',
    subtitle: 'The legal agreement governing your membership and use of Knot.',
    badge: 'Legal Agreement',
    lastUpdated: 'October 29, 2026',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        content: `By downloading, accessing, or registering on Knot (the "Platform"), you enter into a legally binding contract with Knot Technologies. If you do not agree to all terms, you must discontinue using the application immediately.`
      },
      {
        heading: '2. Strict Age Eligibility (18+ Only)',
        content: `Knot is exclusively created for adults aged 18 years and older. By creating an account, you represent and warrant that you are at least 18 years old, possess the legal capacity to form a binding contract, and have never been convicted of a violent or sexual offense.`
      },
      {
        heading: '3. Account Security & Verification',
        content: `You are responsible for maintaining the confidentiality of your login credentials and password. You agree not to share your account with anyone else. Knot reserves the right to employ selfie verification, phone OTP verification, and device fingerprinting to prevent bot and fraudulent activity.`
      },
      {
        heading: '4. Member Conduct & Prohibited Activities',
        content: `You agree to interact respectfully with all members on Knot. You must not:
        <ul>
          <li>Upload explicit pornography, non-consensual imagery, graphic violence, or hate speech.</li>
          <li>Impersonate another individual, forge photos, or misrepresent your identity or age.</li>
          <li>Stalk, harass, intimidate, defame, or send unwanted persistent messages after disinterest.</li>
          <li>Solicit money, loans, gifts, cryptocurrency investments, or commercial services.</li>
          <li>Scrape, reverse-engineer, decompile, or deploy automated bots against Knot servers.</li>
        </ul>`
      },
      {
        heading: '5. User Content License',
        content: `You retain ownership of the photos, prompts, and text you post on Knot. However, by uploading content, you grant Knot a worldwide, non-exclusive, royalty-free license to host, store, display, and adapt your content solely for operating and promoting the matchmaking service.`
      },
      {
        heading: '6. Limitation of Liability',
        content: `Knot provides matchmaking algorithms and discovery on an "as-is" and "as-available" basis. While we enforce strict verification standards, you are solely responsible for your interactions and meetings with other members both online and offline.`
      },
      {
        heading: '7. Termination',
        content: `Knot reserves the right to suspend or permanently ban any account that violates these Terms or our Community Guidelines without prior warning or refund.`
      }
    ]
  },

  'privacy': {
    key: 'privacy',
    title: 'Privacy & Data Protection Policy',
    subtitle: 'DPDP Act 2023 & GDPR compliant overview of how your data is protected.',
    badge: 'Data Protection & Privacy',
    lastUpdated: 'October 29, 2026',
    sections: [
      {
        heading: '1. Information We Collect',
        content: `When you build your Knot dating profile, we collect:
        <ul>
          <li><strong>Identity Data:</strong> First name, phone number, date of birth (for age calculation), gender identity, and who you are looking to meet.</li>
          <li><strong>Profile Content:</strong> Photos, bio, prompt responses, passions, height, lifestyle habits (workout, drinks, smoking), and profession.</li>
          <li><strong>Interaction Data:</strong> Matches, likes, text chats (encrypted in transit and rest), and time spent browsing.</li>
          <li><strong>Device & City Location:</strong> Device model, OS version, IP address, and general city-level location (precise GPS coordinates are never broadcast publicly).</li>
        </ul>`
      },
      {
        heading: '2. How Your Information Is Used',
        content: `Your data is used solely to power an authentic, secure dating platform:
        <ul>
          <li>Delivering curated match suggestions based on location, age, intentions, and passions.</li>
          <li>Authenticating user sessions and securing accounts.</li>
          <li>Preventing fraud, bot creation, impersonation, and harassment via AI moderation.</li>
          <li>Providing in-app customer support and resolving account queries.</li>
        </ul>`
      },
      {
        heading: '3. Zero Data Selling Guarantee',
        content: `Knot maintains an uncompromising privacy standard. We <strong>never sell, rent, monetize, or trade</strong> your personal information, dating preferences, or chats to third-party data brokers, commercial advertisers, or marketing aggregators.`
      },
      {
        heading: '4. Contact Number & Chat Privacy',
        content: `Your phone number is strictly private and never shown publicly on your profile card. Only you decide whether to share your personal phone number or external social handles with your match.`
      },
      {
        heading: '5. Data Retention & Right to Erasure',
        content: `In compliance with the Digital Personal Data Protection Act 2023 and GDPR, you have the right to access, export, or permanently delete your data at any time under <em>Settings &rarr; Delete Account</em> or by emailing <a href="mailto:privacy@knot.app">privacy@knot.app</a>.`
      }
    ]
  },

  'child-safety': {
    key: 'child-safety',
    title: 'Child Safety & Minor Protection Standards',
    subtitle: 'Zero-tolerance policy against child exploitation, abuse, and underage usage.',
    badge: 'Child Safety Standards',
    lastUpdated: 'October 29, 2026',
    sections: [
      {
        heading: '1. Strict Age Eligibility (18+ Mandatory)',
        content: `Knot is exclusively designed and operated for adults aged 18 years and older. Individuals under the age of 18 are strictly prohibited from downloading, registering, creating an account, or interacting on the platform. We employ automated age-gate checks, identity screening, and cross-verification mechanisms during onboarding.`
      },
      {
        heading: '2. Absolute Zero-Tolerance for CSAM / CSAE',
        content: `Knot enforces an uncompromising, absolute zero-tolerance policy against Child Sexual Abuse Material (CSAM), Child Sexual Exploitation and Abuse (CSAE), grooming, solicitation, or any representation of minors. Any attempt to upload, share, solicit, or transmit content involving minors results in:
        <ul>
          <li>Immediate and permanent account termination without appeal.</li>
          <li>Permanent device fingerprint and phone number ban.</li>
          <li>Immediate reporting and evidence referral to the National Center for Missing & Exploited Children (NCMEC) and relevant law enforcement authorities.</li>
        </ul>`
      },
      {
        heading: '3. Proactive Moderation & AI Safeguards',
        content: `All media uploaded to Knot undergoes automated perceptual hashing and visual moderation before appearing publicly. In addition, real-time sentiment analysis flags conversations containing predatory or suspicious grooming behaviors.`
      },
      {
        heading: '4. Immediate Reporting Mechanisms',
        content: `Users can report any suspicious profile or message with one tap via the in-app "Block & Report" menu. Reports involving child safety are prioritized as critical severity and inspected by our dedicated trust and safety team within 1 hour.`
      },
      {
        heading: '5. Direct Law Enforcement & Child Protection Contact',
        content: `For inquiries, urgent child protection escalations, or law enforcement requests, our 24/7 dedicated Trust & Safety officer can be contacted directly at <a href="mailto:safety@knot.app">safety@knot.app</a>.`
      }
    ]
  },

  'community-guidelines': {
    key: 'community-guidelines',
    title: 'Community Guidelines & Anti-Harassment',
    subtitle: 'Our code of consent, respectful communication, and authentic dating.',
    badge: 'Community Standards',
    lastUpdated: 'October 29, 2026',
    sections: [
      {
        heading: '1. Authenticity & Honesty',
        content: `Be genuinely you. Upload clear, recent photos of yourself where your face is visible. Do not use cartoon avatars, heavily deceptive filters, fake profiles, or photos of other people.`
      },
      {
        heading: '2. Enthusiastic Mutual Consent',
        content: `Every meaningful connection requires mutual enthusiasm. A "no" or a lack of response always means no. Persistence after disinterest, aggressive questioning, and sending unsolicited sexual messages are grounds for an immediate ban.`
      },
      {
        heading: '3. Zero Tolerance for Hate Speech & Bullying',
        content: `Knot is a welcoming ecosystem for all singles. We do not tolerate body shaming, racism, misogyny, homophobia, religious intolerance, or derogatory slurs. Violating profiles are expunged permanently.`
      },
      {
        heading: '4. No Financial Solicitations or Scams',
        content: `Knot is for genuine romance and dating only. Do not solicit funds, promote commercial services, advertise escorting, share investment schemes, or link commercial payment handles.`
      }
    ]
  },

  'safety-tips': {
    key: 'safety-tips',
    title: 'Dating Safety Tips & In-Person Guide',
    subtitle: 'Practical advice for staying safe while connecting online and meeting in public.',
    badge: 'Safety First',
    lastUpdated: 'October 29, 2026',
    sections: [
      {
        heading: '1. Keep Conversations on Knot First',
        content: `Get to know your match through Knot's messaging and voice notes before sharing your personal WhatsApp number, Instagram handle, or home address. Scammers often attempt to push conversations off-platform immediately.`
      },
      {
        heading: '2. Always Meet in Populated Public Places',
        content: `For your initial dates, always choose a well-lit, busy public venue — such as a popular cafe, restaurant, art gallery, or public park. Never agree to meet at a private residence, secluded area, or hotel room for a first meeting.`
      },
      {
        heading: '3. Inform a Trusted Friend or Family Member',
        content: `Before heading out on a date, tell a friend or family member where you are going, who you are meeting, and what time you expect to return. Keep your phone charged and enable location sharing with a trusted contact.`
      },
      {
        heading: '4. Control Your Own Transportation',
        content: `Arrange your own transportation to and from the date. Drive yourself, take a registered ride-share (Uber/Ola), or use public transit so you have the freedom to leave at any moment you choose.`
      },
      {
        heading: '5. Guard Your Drink and Personal Belongings',
        content: `Never leave your beverage or food unattended. Only accept drinks poured directly by the bartender or server. If you feel uncomfortable, pressured, or unwell, ask venue staff for assistance or leave immediately.`
      },
      {
        heading: '6. Red Flags & Financial Scam Warnings',
        content: `Never wire money, buy cryptocurrency, purchase gift cards, or share OTPs with anyone you met online, regardless of their claimed emergency. Report any user who asks for financial help to Knot Trust & Safety.`
      }
    ]
  },

  'payment-refund': {
    key: 'payment-refund',
    title: 'Payment, Subscription & Refund Policy',
    subtitle: 'Transparent terms on Knot VIP, Spotlight Boosts, billing, and cancellations.',
    badge: 'Billing & Purchases',
    lastUpdated: 'October 29, 2026',
    sections: [
      {
        heading: '1. Premium Membership & Boosts',
        content: `Knot offers optional premium features, including Knot VIP Membership (unlimited daily likes, direct notes before matching, profile spotlight, travel passport) and on-demand Spotlight Boosts. Pricing is clearly presented in-app prior to confirmation.`
      },
      {
        heading: '2. App Store & In-App Purchases',
        content: `In-app subscriptions purchased on iOS devices are billed through your Apple ID account; purchases on Android devices are processed through your Google Play Store account. Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current billing cycle.`
      },
      {
        heading: '3. Cancellation Policy',
        content: `You can cancel your subscription at any time directly through your Apple App Store or Google Play account settings. Upon cancellation, you will continue to enjoy VIP benefits until the conclusion of your current prepaid billing cycle.`
      },
      {
        heading: '4. Refund Policy',
        content: `Generally, virtual items, boosts, and active subscription periods are non-refundable once activated. Refund requests for purchases made via Apple App Store or Google Play Store must be submitted directly to Apple Support or Google Play Support in accordance with their consumer terms.`
      },
      {
        heading: '5. Billing Inquiries',
        content: `For any transaction discrepancy or assistance with premium features, contact our support desk at <a href="mailto:billing@knot.app">billing@knot.app</a> with your digital purchase receipt.`
      }
    ]
  },

  'cookies': {
    key: 'cookies',
    title: 'Cookie & Local Storage Policy',
    subtitle: 'Clear overview of session authentication, caching, and privacy tokens.',
    badge: 'Storage & Tokens',
    lastUpdated: 'October 29, 2026',
    sections: [
      {
        heading: '1. Purpose of Local Storage',
        content: `Knot uses encrypted local device storage and secure session tokens strictly to:
        <ul>
          <li>Keep you securely logged in across app launches without repeated credentials input.</li>
          <li>Cache profile photos and matching preferences locally for snappy offline-first performance.</li>
          <li>Protect against session hijacking and unauthorized API access.</li>
        </ul>`
      },
      {
        heading: '2. No Invasive Ad Network Trackers',
        content: `We do not deploy invasive third-party cross-app tracking cookies or sell your browsing history to advertising networks. All storage mechanisms are strictly essential to the operation of the Knot service.`
      }
    ]
  },

  'data-deletion': {
    key: 'data-deletion',
    title: 'Account Deletion & Right to Erasure',
    subtitle: 'Step-by-step procedure to permanently remove your profile and personal data.',
    badge: 'Right to be Forgotten',
    lastUpdated: 'October 29, 2026',
    sections: [
      {
        heading: '1. Your Right to be Forgotten',
        content: `Every Knot member retains complete ownership over their account data. You can permanently close your account and initiate complete data deletion at any moment.`
      },
      {
        heading: '2. How to Delete Your Account In-App',
        content: `To delete your profile directly within Knot:
        <ol style="margin-left: 20px; line-height: 1.8;">
          <li>Open the Knot application and tap your <strong>Profile Tab</strong>.</li>
          <li>Tap the <strong>Settings (Gear)</strong> icon in the top right corner.</li>
          <li>Scroll to the bottom and select <strong>Delete Account</strong>.</li>
          <li>Confirm your choice. Your account will immediately be deactivated and removed from discovery.</li>
        </ol>`
      },
      {
        heading: '3. Data Purging Timeline',
        content: `Upon confirming account deletion:
        <ul>
          <li>Your profile, photos, prompts, and matches are immediately hidden from all members.</li>
          <li>All active database records and chat archives are permanently expunged within <strong>48 hours</strong>.</li>
          <li>Encrypted database backup snapshots expire and purge automatically within <strong>30 days</strong>.</li>
        </ul>`
      },
      {
        heading: '4. Manual Data Deletion Requests',
        content: `If you have uninstalled the application or cannot access your phone number, you may email our Data Protection Officer at <a href="mailto:privacy@knot.app">privacy@knot.app</a> with the subject "Data Erasure Request" along with your registered phone number.`
      }
    ]
  }
};

const POLICY_LINKS = [
  { key: 'terms', label: 'Terms of Service' },
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'child-safety', label: 'Child Safety' },
  { key: 'community-guidelines', label: 'Community Guidelines' },
  { key: 'safety-tips', label: 'Dating Safety Tips' },
  { key: 'payment-refund', label: 'Billing & Refunds' },
  { key: 'cookies', label: 'Cookie Policy' },
  { key: 'data-deletion', label: 'Account Deletion' },
];

/**
 * Render Apple-editorial quiet luxury responsive HTML
 */
function renderPolicyPage(activeKey) {
  const policy = POLICIES[activeKey] || POLICIES['terms'];

  const navLinksHtml = POLICY_LINKS.map(item => {
    const isActive = item.key === activeKey;
    return `
      <a href="/policies/${item.key}" class="nav-tab ${isActive ? 'active' : ''}">
        ${item.label}
      </a>
    `;
  }).join('');

  const sectionsHtml = policy.sections.map(sec => `
    <article class="policy-card">
      <h2>${sec.heading}</h2>
      <div class="content">${sec.content}</div>
    </article>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${policy.title} — Knot Dating</title>
  <meta name="description" content="${policy.subtitle}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-canvas: #FAFAFC;
      --bg-card: #FFFFFF;
      --text-main: #18181B;
      --text-sub: #71717A;
      --border-subtle: #E4E4E7;
      --accent-black: #18181B;
      --radius-card: 20px;
      --radius-pill: 9999px;
      --shadow-subtle: 0 4px 24px rgba(0, 0, 0, 0.04);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background-color: var(--bg-canvas);
      color: var(--text-main);
      line-height: 1.65;
      padding: 0 16px 80px 16px;
    }

    .top-header {
      max-width: 860px;
      margin: 0 auto;
      padding: 32px 0 20px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle);
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--text-main);
    }

    .brand-title {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .brand-badge {
      font-size: 11px;
      font-weight: 700;
      color: #FFFFFF;
      background: var(--accent-black);
      padding: 4px 12px;
      border-radius: var(--radius-pill);
      letter-spacing: 0.6px;
      text-transform: uppercase;
    }

    .hero {
      max-width: 860px;
      margin: 40px auto 28px auto;
    }

    .category-tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-sub);
      text-transform: uppercase;
      letter-spacing: 1.2px;
      margin-bottom: 8px;
    }

    .hero-title {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 38px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.8px;
      line-height: 1.2;
      margin-bottom: 12px;
    }

    .hero-subtitle {
      font-size: 16px;
      color: var(--text-sub);
      max-width: 640px;
      line-height: 1.5;
    }

    .meta-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 18px;
      font-size: 13px;
      color: var(--text-sub);
    }

    .nav-container {
      max-width: 860px;
      margin: 0 auto 36px auto;
      overflow-x: auto;
      white-space: nowrap;
      padding-bottom: 8px;
      scrollbar-width: none;
    }

    .nav-container::-webkit-scrollbar {
      display: none;
    }

    .nav-pills {
      display: inline-flex;
      gap: 8px;
      background: rgba(0, 0, 0, 0.04);
      padding: 6px;
      border-radius: var(--radius-pill);
    }

    .nav-tab {
      display: inline-block;
      padding: 8px 18px;
      border-radius: var(--radius-pill);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-sub);
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .nav-tab:hover {
      color: var(--text-main);
    }

    .nav-tab.active {
      background: var(--accent-black);
      color: #FFFFFF;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .policy-wrapper {
      max-width: 860px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .policy-card {
      background: var(--bg-card);
      border-radius: var(--radius-card);
      border: 1px solid var(--border-subtle);
      padding: 28px 32px;
      box-shadow: var(--shadow-subtle);
    }

    .policy-card h2 {
      font-family: 'Fraunces', Georgia, serif;
      font-size: 20px;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 14px;
      letter-spacing: -0.3px;
    }

    .policy-card .content {
      font-size: 15px;
      color: #3F3F46;
      line-height: 1.7;
    }

    .policy-card .content p {
      margin-bottom: 12px;
    }

    .policy-card .content ul, .policy-card .content ol {
      margin: 12px 0 12px 24px;
    }

    .policy-card .content li {
      margin-bottom: 8px;
    }

    .policy-card .content a {
      color: var(--text-main);
      font-weight: 600;
      text-decoration: underline;
    }

    .footer {
      max-width: 860px;
      margin: 60px auto 0 auto;
      padding-top: 24px;
      border-top: 1px solid var(--border-subtle);
      text-align: center;
      font-size: 13px;
      color: var(--text-sub);
    }
  </style>
</head>
<body>

  <header class="top-header">
    <a href="/policies" class="brand-link">
      <span class="brand-title">Knot</span>
    </a>
    <span class="brand-badge">${policy.badge}</span>
  </header>

  <section class="hero">
    <span class="category-tag">Official Compliance Document</span>
    <h1 class="hero-title">${policy.title}</h1>
    <p class="hero-subtitle">${policy.subtitle}</p>
    <div class="meta-bar">
      <span>Effective: ${policy.lastUpdated}</span>
      <span>•</span>
      <span>Applies to iOS, Android & Web</span>
    </div>
  </section>

  <nav class="nav-container">
    <div class="nav-pills">
      ${navLinksHtml}
    </div>
  </nav>

  <main class="policy-wrapper">
    ${sectionsHtml}
  </main>

  <footer class="footer">
    <p>&copy; 2026 Knot Technologies. All rights reserved.</p>
    <p style="margin-top: 6px;">Questions? Email us at <a href="mailto:legal@knot.app" style="color: var(--text-main); font-weight: 600;">legal@knot.app</a></p>
  </footer>

</body>
</html>`;
}

// Controller Actions
exports.getPolicyIndex = (req, res) => {
  res.redirect('/policies/terms');
};

exports.getPolicy = (req, res) => {
  const type = req.params.type;
  if (!POLICIES[type]) {
    return res.redirect('/policies/terms');
  }
  res.send(renderPolicyPage(type));
};

// JSON API Endpoints for Flutter app & external consumers
exports.getAllPoliciesJson = (req, res) => {
  res.json({
    status: 'success',
    count: Object.keys(POLICIES).length,
    policies: POLICIES,
    links: POLICY_LINKS
  });
};

exports.getPolicyJson = (req, res) => {
  const type = req.params.type;
  const policy = POLICIES[type];
  if (!policy) {
    return res.status(404).json({
      status: 'error',
      message: `Policy '${type}' not found.`
    });
  }
  res.json({
    status: 'success',
    policy: policy
  });
};

module.exports = exports;
