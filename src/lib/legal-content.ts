function p(text: string) {
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        mode: 'normal',
        text: text,
        type: 'text',
        style: '',
        detail: 0,
        format: 0,
        version: 1,
      },
    ],
  }
}

function h2(text: string) {
  return {
    type: 'heading',
    tag: 'h2',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        mode: 'normal',
        text: text,
        type: 'text',
        style: '',
        detail: 0,
        format: 0,
        version: 1,
      },
    ],
  }
}

function h3(text: string) {
  return {
    type: 'heading',
    tag: 'h3',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        mode: 'normal',
        text: text,
        type: 'text',
        style: '',
        detail: 0,
        format: 0,
        version: 1,
      },
    ],
  }
}

export const privacyContent = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      p('Last Updated: September 13, 2026'),
      p(
        'Link ("we", "our", or "us") is dedicated to protecting your personal information and respecting your privacy. This Privacy Policy explains how our link shortening platform collects, uses, stores, and safeguards your data when you visit our website, register an account, or create and share shortened links.'
      ),
      h2('1. Information We Collect'),
      p(
        'We collect information to provide fast, secure, and reliable link shortening and analytics services:'
      ),
      h3('A. Account and Profile Information'),
      p(
        'When you create an account on Link, we collect your name, email address, password hash, and user preferences. If you authenticate via third-party OAuth providers, we receive your name and verified email address.'
      ),
      h3('B. Link Metadata and Configuration'),
      p(
        'When you shorten a URL, we store the original destination URL, your custom domain slug, link description, optional tags, UTM campaign parameters, expiration timestamp, maximum-click ceiling, and whether password protection is enabled.'
      ),
      h3('C. Password-Protected Links'),
      p(
        'If you choose to protect a short link with a password, the password is cryptographically hashed using bcrypt with multiple salt rounds before storage. We never store or transmit plaintext link passwords.'
      ),
      h3('D. Click Analytics & Visitor Data'),
      p(
        'When visitors access a short link, our edge servers record high-level metrics including click timestamps, referring domains, user agent strings, and anonymized geographical metrics to display aggregate analytics in your dashboard.'
      ),
      h2('2. How We Use Your Information'),
      p(
        'We utilize collected information for the following operational and technical purposes:'
      ),
      p(
        '• Resolving short links into destination URLs with sub-millisecond latency using Redis caching.'
      ),
      p(
        '• Enforcing link expiration dates, maximum-click limits, and returning HTTP 410 Gone for deactivated links.'
      ),
      p(
        '• Providing real-time dashboard analytics, click counters, and campaign tracking.'
      ),
      p(
        '• Preventing abuse, phishing, malware distribution, and automated bots.'
      ),
      p(
        '• Managing your account and delivering important service notifications.'
      ),
      h2('3. Data Security and Caching'),
      p(
        'Security is integral to our architecture. All web traffic is encrypted using modern TLS (HTTPS). Redirect data is cached in high-speed, secure Redis memory clusters to protect against database overload and DDoS attacks.'
      ),
      h2('4. Cookies and Session Storage'),
      p(
        'We utilize essential session cookies to keep you authenticated across sessions and remember your dark/light theme preferences. We do not use invasive third-party tracking cookies or sell your personal data to ad brokers.'
      ),
      h2('5. Link Expiration & Automatic Removal'),
      p(
        'Links configured with expiration timestamps or click limits automatically cease redirection when their rules are fulfilled. Visitors will immediately receive an HTTP 410 Gone status code, and target URLs are purged from Redis.'
      ),
      h2('6. Your Rights and Choices'),
      p(
        'You maintain complete control over your content. At any time, you can edit destination URLs, clear or change passwords, adjust click limits, or permanently delete links through your dashboard or Payload CMS.'
      ),
      h2('7. Contact Us'),
      p(
        'If you have questions or concerns about this Privacy Policy, please contact our privacy team at privacy@raju.app or via GitHub at github.com/rajuapp/link.'
      ),
    ],
  },
}

export const termsContent = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      p('Last Updated: September 13, 2026'),
      p(
        'Welcome to Link! These Terms of Service ("Terms") govern your access to and use of Link\'s URL shortening platform, websites, and APIs. By accessing our services or creating an account, you agree to be bound by these Terms.'
      ),
      h2('1. Acceptance of Terms'),
      p(
        'By using Link, you confirm that you are at least 13 years of age and legally capable of entering into a binding agreement. If you represent an organization, you certify that you are authorized to bind that entity to these Terms.'
      ),
      h2('2. User Accounts and Security'),
      p(
        'You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use or security breach.'
      ),
      h2('3. Acceptable Use Policy & Prohibited Conduct'),
      p(
        'Link was built for productive, ethical link shortening. You agree NOT to use Link to create, share, or promote links that:'
      ),
      p(
        '• Distribute malware, spyware, viruses, ransomware, or malicious executables.'
      ),
      p(
        '• Facilitate phishing schemes, deceptive scams, credential theft, or fraud.'
      ),
      p(
        '• Infringe on copyrights, trademarks, privacy rights, or intellectual property of third parties.'
      ),
      p(
        '• Distribute spam, unsolicited bulk messages, or engage in artificial traffic generation.'
      ),
      p(
        '• Promote hate speech, violence, harassment, exploitation, or illegal acts.'
      ),
      p(
        'Any link violating this Acceptable Use Policy will be deactivated immediately without prior notice.'
      ),
      h2('4. Link Lifecycle, Expiration & Click Ceilings'),
      p(
        'Link allows creators to configure custom link rules, including expiration dates and maximum click caps. Once a link expires, reaches its click ceiling, or is deactivated by the creator or admin, it will return an HTTP 410 Gone status code. Link does not guarantee indefinite retention of redirect history for deactivated links.'
      ),
      h2('5. Password-Protected Links'),
      p(
        'Creators may protect links with a password screen. Link provides password hashing as an access gate, but users must not use password-protected links to bypass security controls or distribute confidential data without appropriate authorization.'
      ),
      h2('6. Intellectual Property & Domain Slugs'),
      p(
        'We reserve the right to reclaim, reassign, or rename any vanity URL slug or domain handle that infringes on registered trademarks or misleads visitors.'
      ),
      h2('7. Disclaimer of Warranties'),
      p(
        'Link is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. While we aim for 99.9% uptime and sub-millisecond response times, we do not warrant uninterrupted, error-free operation.'
      ),
      h2('8. Limitation of Liability'),
      p(
        'To the maximum extent permitted by law, Link and its maintainers shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.'
      ),
      h2('9. Changes to Terms'),
      p(
        'We may revise these Terms from time to time. Your continued use of Link following the posting of revised Terms signifies your acceptance.'
      ),
      h2('10. Contact Information'),
      p(
        'For legal inquiries, terms enforcement, or abuse reports, please reach out to legal@raju.app or open an issue on our GitHub repository.'
      ),
    ],
  },
}
