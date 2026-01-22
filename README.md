<div align="center">

# <img src="https://img.shields.io/badge/GitAura-06b6d4?style=for-the-badge&logo=github&logoColor=white" alt="GitAura" />

### ✨ Ultimate GitHub Profiler - Unlock Your Code Aura ✨

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**A cinematic, high-end web application that transforms your GitHub profile into a visual masterpiece.**

[🚀 Live Demo](https://git-aura-jade.vercel.app) • [📖 Documentation](#getting-started) • [🐛 Report Bug](https://github.com/Enes-CE/GitAura/issues) • [💡 Request Feature](https://github.com/Enes-CE/GitAura/issues)

[![GitHub Stars](https://img.shields.io/github/stars/Enes-CE/GitAura?style=social)](https://github.com/Enes-CE/GitAura)
[![GitHub Forks](https://img.shields.io/github/forks/Enes-CE/GitAura?style=social)](https://github.com/Enes-CE/GitAura)

</div>

---

## 🌟 Overview

**GitAura** is not just another GitHub profile analyzer. It's a **cinematic experience** that reveals the hidden aesthetics of your code journey. With stunning visualizations, AI-powered insights, and a global ranking system, GitAura transforms raw GitHub data into an immersive storytelling experience.

### 🎯 What Makes GitAura Special?

- 🎨 **Cinematic UI/UX** - Dark mode, glassmorphism, and ambient animations
- 📊 **Deep Analytics** - Comprehensive GitHub profile analysis with visual storytelling
- 🤖 **AI-Powered Insights** - Discover your developer persona and improvement suggestions
- 🏆 **Global Leaderboard** - See how you rank among developers worldwide
- ⚡ **Real-Time Data** - Live GitHub API integration with intelligent caching
- 🎭 **Developer Persona** - Get your unique coding character and tech zodiac
- 📈 **Impact Metrics** - Aura Index, Impact Magnitude, and more

---

## 🎬 Features

### Core Features

- **🔐 GitHub OAuth Integration** - Seamless authentication with NextAuth.js
- **📊 Interactive Dashboards** - Bento box style layout with rich visualizations
- **📈 Advanced Charts** - Language radar, activity timeline, commit patterns
- **🏅 Ranking System** - Global leaderboard with tier badges (Platinum, Gold, Silver, Bronze, Iron)
- **🎨 Aura Avatar Generator** - Unique visual representation of your coding style
- **⚔️ Duel Arena** - Compare your stats with other developers
- **⏰ Time Machine** - Track your coding journey milestones
- **🔍 Code Archeology** - Discover your coding achievements and patterns
- **📱 Responsive Design** - Perfect experience on all devices
- **🌙 Dark Mode** - Beautiful dark theme optimized for extended use

### Technical Features

- **⚡ Next.js 16** - Latest React framework with App Router
- **🎨 Tailwind CSS v4** - Modern utility-first CSS framework
- **🎭 Framer Motion** - Smooth animations and transitions
- **📊 Recharts** - Beautiful, responsive charts
- **🗄️ Supabase** - PostgreSQL database with real-time capabilities
- **🔒 TypeScript** - Full type safety throughout the application
- **🚀 Vercel Optimized** - Built for edge deployment

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **GitHub Account** (for OAuth)
- **Supabase Account** (free tier works)
- **GitHub Personal Access Token** (optional, for higher rate limits)

### Installation

```bash
# Clone the repository
git clone https://github.com/Enes-CE/GitAura.git

# Navigate to project directory
cd gitaura

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure your environment variables (see below)
# Then run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# GitHub OAuth
GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: GitHub API Token (for higher rate limits)
GITHUB_TOKEN=your_github_personal_access_token

# Optional: GitHub Repo Info (for stars badge)
NEXT_PUBLIC_GITHUB_OWNER=Enes-CE
NEXT_PUBLIC_GITHUB_REPO=GitAura
```

### Database Setup

#### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API** and copy your keys
3. Run the SQL scripts below in **SQL Editor**

#### 2. NextAuth Tables

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE,
  email_verified TIMESTAMPTZ,
  image TEXT
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id BIGSERIAL PRIMARY KEY,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE ("provider", "providerAccountId")
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

-- Verification tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);
```

#### 3. Leaderboard Table

```sql
-- Leaderboard table
CREATE TABLE IF NOT EXISTS public.user_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  github_username TEXT NOT NULL UNIQUE,
  github_avatar_url TEXT,
  impact_index NUMERIC NOT NULL DEFAULT 0,
  total_stars INTEGER DEFAULT 0,
  total_forks INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0,
  public_repos INTEGER DEFAULT 0,
  dominant_language TEXT,
  last_analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_impact 
  ON public.user_leaderboard(impact_index DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_language 
  ON public.user_leaderboard(dominant_language, impact_index DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_updated 
  ON public.user_leaderboard(last_analyzed_at DESC);
```

### GitHub OAuth Setup

1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: GitAura
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy **Client ID** and **Client Secret** to `.env.local`

### Initial Data Collection

For accurate global rankings, initialize the leaderboard:

```bash
# One-time initialization (comprehensive data collection)
curl -X POST http://localhost:3000/api/init-data

# Check status
curl http://localhost:3000/api/init-data
```

**Note:** Initial data collection may take 30-60 minutes due to GitHub API rate limits. After initialization, the system automatically updates daily via Vercel Cron Jobs.

---

## 📁 Project Structure

```
gitaura/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── leaderboard/       # Leaderboard page
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── charts/           # Chart components
│   │   ├── leaderboard/      # Leaderboard components
│   │   └── ui/               # UI components
│   ├── lib/                   # Utilities and helpers
│   │   ├── github.ts         # GitHub API client
│   │   ├── leaderboard.ts    # Leaderboard logic
│   │   └── analyzer.ts       # Profile analysis
│   └── components/           # Shared components
├── public/                    # Static assets
├── .env.local                 # Environment variables (not in git)
└── package.json
```

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Recharts](https://recharts.org/)** - Chart library
- **[Lucide React](https://lucide.dev/)** - Icon library

### Backend
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication
- **[Supabase](https://supabase.com/)** - Database & Auth adapter
- **[Octokit](https://github.com/octokit)** - GitHub API client

### Deployment
- **[Vercel](https://vercel.com/)** - Hosting & Edge Functions
- **Vercel Cron Jobs** - Scheduled tasks

---

## 📊 API Endpoints

### Public Endpoints

- `GET /api/leaderboard` - Get leaderboard with filters
- `GET /api/test-token` - Check GitHub token status
- `GET /api/auth/session` - Get current session

### Admin Endpoints

- `POST /api/init-data` - Initialize leaderboard data
- `POST /api/collect-data` - Collect comprehensive user data
- `GET /api/cron/update-leaderboard` - Update leaderboard (cron)

---

## 🎨 Screenshots

<div align="center">

### Landing Page
![Landing Page](https://via.placeholder.com/800x400/030014/06b6d4?text=GitAura+Landing+Page)

### Dashboard
![Dashboard](https://via.placeholder.com/800x400/030014/8b5cf6?text=GitAura+Dashboard)

### Leaderboard
![Leaderboard](https://via.placeholder.com/800x400/030014/ec4899?text=Global+Leaderboard)

</div>

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add comments for complex logic
- Test your changes locally
- Update documentation if needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **GitHub** - For the amazing API
- **Vercel** - For seamless deployment
- **Supabase** - For the database infrastructure
- **Next.js Team** - For the incredible framework
- **All Contributors** - Thank you for making GitAura better!

---

## 📧 Contact

**GitAura Team**

- GitHub: [@Enes-CE](https://github.com/Enes-CE)
- Project Link: [https://github.com/Enes-CE/GitAura](https://github.com/Enes-CE/GitAura)

---

<div align="center">

### ⭐ Star this repo if you find it helpful! ⭐

**Made with ❤️ by the GitAura Team**

[⬆ Back to Top](#-gitaura---ultimate-github-profiler)

</div>
