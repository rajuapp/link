<h1 align="center">Link</h1>

<p align="center">
  <i>Experience the magic of instantly generated ready-to-use short links 🚀</i>
</p>

<h4 align="center">
  <a href="https://github.com/rajuapp/link/graphs/contributors">
    <img src="https://img.shields.io/github/contributors-anon/rajuapp/link?color=yellow&style=flat-square" alt="contributors">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="license">
  </a>
  <a href="https://link.raju.app">
    <img src="https://img.shields.io/badge/Website-link.raju.app-blue.svg" alt="website">
  </a>
  <br>
</h4>

<p align="center">
  <img src="public/mockup.jpg" alt="Link Dashboard Mockup" width="800" />
</p>

## Introduction

Welcome to **Link** — a modern, high-performance URL shortener built with Next.js 15, React 19, and Payload CMS. Designed with simplicity, speed, and real-time analytics at its core, Link empowers individuals and teams to effortlessly shorten URLs, generate instant QR codes, track click statistics, and manage content seamlessly through an integrated headless CMS.

## Key Features

- ⚡ **Instant URL Shortening**: Create clean short links with custom aliases, optional password protection, and automated expiration dates.
- 📊 **Real-time Analytics**: Track total visits, referrer sources, browser/OS statistics, and geographic locations.
- 📱 **QR Code Generator**: Generate and download ready-to-use QR codes for your short links with instant download options.
- 🏷️ **UTM Campaign Builder**: Built-in UTM parameter generator to tag marketing campaigns effortlessly.
- 🔐 **Comprehensive Authentication**:
  - OAuth 2.0 with **Google** and **GitHub**.
  - Email & Password credentials authentication secured by **Bcrypt** (cost factor 12).
- ✉️ **AgentMail Email Verification & Password Reset**:
  - Dual-verification: Users receive **both** a 1-click action link and a prominent 6-digit numeric OTP code in their email.
  - Branded, mobile-optimized email templates matching the Link minimalist aesthetic.
  - Rate-limited token issuance with automated expiration (24h for email verification, 1h for password resets).
- 📰 **Integrated Payload CMS 3**:
  - Full headless CMS accessible at `/admin`.
  - Rich-text Blog Posts, Custom Pages, Legal Documents (Terms & Privacy), and Media management.
  - Granular Site Settings to enable/disable user registration, public URL shortening, and authentication methods directly from the admin panel.
- ⚡ **Sub-millisecond Performance**: Redis-backed caching and redirects with rate limiting to protect endpoints against abuse.

## Tech Stack & Tools

- **Framework**: [<img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />](https://nextjs.org/) [<img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />](https://react.dev/)
- **CMS**: [<img src="https://img.shields.io/badge/Payload_CMS_3-000000?style=for-the-badge&logo=payloadcms&logoColor=white" />](https://payloadcms.com/)
- **Language**: [<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />](https://www.typescriptlang.org/)
- **Database & ORM**: [<img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />](https://www.postgresql.org/) & [<img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />](https://www.prisma.io/)
- **Caching & Redirects**: [<img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />](https://redis.io/)
- **Email Delivery**: [<img src="https://img.shields.io/badge/AgentMail-2563EB?style=for-the-badge&logo=mail.ru&logoColor=white" />](https://agentmail.to/)
- **Authentication**: [<img src="https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=next.js&logoColor=white" />](https://next-auth.js.org/)
- **Styling**: [<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />](https://tailwindcss.com/)
- **UI Components**: [<img src="https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radix-ui&logoColor=white" />](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Validation**: [<img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" />](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)

## Hosted Version

To use the live platform, visit **[link.raju.app](https://link.raju.app)**.

## Getting Started (Local Development)

### Prerequisites

Ensure you have the following installed locally:

- **Node.js**: v18.17.0 or higher
- **npm**, **yarn**, or **pnpm**
- **PostgreSQL**: PostgreSQL 14+ database instance
- **Redis**: Redis 6+ instance (for caching and rate limiting)
- **Git**

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/rajuapp/link.git
   cd link
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your configuration:

   ```bash
   cp .env.example .env
   ```

   | Variable                                    | Description                                                                      |
   | ------------------------------------------- | -------------------------------------------------------------------------------- |
   | `DATABASE_URL`                              | PostgreSQL connection string (`postgresql://user:pass@host:port/db`)             |
   | `REDIS_URL`                                 | Redis connection URL (`redis://...` or `rediss://...`)                           |
   | `NEXTAUTH_SECRET`                           | 32+ character random string for JWT encryption                                   |
   | `NEXTAUTH_URL`                              | Base canonical app URL (e.g. `http://localhost:3000` or `https://link.raju.app`) |
   | `NEXT_PUBLIC_URL`                           | Public-facing app URL used in links and emails                                   |
   | `GITHUB_ID` / `GITHUB_SECRET`               | GitHub OAuth app credentials                                                     |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth credentials                                                   |
   | `AGENTMAIL_INBOX`                           | AgentMail inbox ID (e.g. `rajuapp@agentmail.to`)                                 |
   | `AGENTMAIL_API_KEY`                         | AgentMail API key (`am_us_inbox_...`)                                            |

4. **Initialize Database & Prisma Client**:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
   The Payload CMS Admin is accessible at [http://localhost:3000/admin](http://localhost:3000/admin).

### Scripts

- `npm run dev` — Start the Next.js development server
- `npm run build` — Generate Prisma Client and build the Next.js production bundle
- `npm run start` — Start the production server
- `npm run lint` — Run ESLint and Prettier checks
- `npm run lint:prettier` — Check formatting with Prettier
- `npx prettier --write .` — Auto-format files with Prettier

## Contributing

Contributions are warmly welcomed! Please follow these steps:

1. Fork the project.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit your changes: `git commit -m 'feat: add amazing feature'`.
4. Push to your branch: `git push origin feature/amazing-feature`.
5. Open a Pull Request.

## Contributors

<a href="https://github.com/rajuapp/link/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=rajuapp/link" />
</a>

## License

Distributed under the [MIT License](https://github.com/rajuapp/link/blob/main/LICENSE.md).
