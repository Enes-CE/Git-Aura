# GitAura - Ultimate GitHub Profiler

GitAura is a high-end, cinematic web application that analyzes GitHub profiles with a focus on visual storytelling and data insights.

## Features

- **Cinematic Experience:** Immersive dark mode, ambient animations, and glassmorphism UI.
- **Deep Analysis:** Fetches comprehensive data using the GitHub Public API.
- **AI-Powered Insights:** Generates a "Developer Persona" and specific improvement suggestions.
- **Data Visualization:** Interactive charts and "Bento box" style dashboard.
- **Tech Stack:** Next.js 15, Tailwind CSS v4, Framer Motion, Recharts, Lucide React.

## Getting Started

1.  **Clone the repository**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create `.env.local`** (see **Auth & Database Setup** below)
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
5.  **Open [http://localhost:3000](http://localhost:3000)** with your browser.

## Customization

- **GitHub Token (Optional):** To increase API rate limits, create a `.env.local` file and add your token:
  ```env
  GITHUB_TOKEN=your_token_here
  ```

## Auth & Database Setup (NextAuth + GitHub + Supabase)

GitAura uses **NextAuth.js** with **GitHub OAuth** and the **Supabase Adapter** to persist users.

### 1. Supabase Project & Keys

1. Go to `https://supabase.com` and create a new project.
2. In **Project Settings → API**, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this **secret**, never expose on client).

### 2. Database Schema for NextAuth

In Supabase, open **SQL Editor** and run the official NextAuth Supabase Adapter schema (adapt as needed):

```sql
-- Basic NextAuth tables for Supabase Adapter
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  email_verified timestamptz,
  image text
);

create table if not exists accounts (
  id bigserial primary key,
  "userId" uuid references users(id) on delete cascade,
  type text not null,
  provider text not null,
  "providerAccountId" text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  unique ("provider","providerAccountId")
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  "sessionToken" text unique not null,
  "userId" uuid references users(id) on delete cascade,
  expires timestamptz not null
);

create table if not exists verification_tokens (
  identifier text not null,
  token text not null,
  expires timestamptz not null,
  primary key (identifier, token)
);
```

### 3. Leaderboard Table (Required - for ranking system)

If you want to enable the leaderboard feature, run this SQL in Supabase SQL Editor:

```sql
create table if not exists public.user_leaderboard (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references next_auth.users(id) on delete cascade, -- Nullable: popüler kullanıcılar için null olabilir
  github_username text not null unique, -- Unique constraint: github_username üzerinden conflict çözülür
  github_avatar_url text,
  impact_index numeric not null default 0,
  total_stars integer default 0,
  total_forks integer default 0,
  followers integer default 0,
  public_repos integer default 0,
  dominant_language text,
  last_analyzed_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for fast queries
create index if not exists idx_leaderboard_impact on public.user_leaderboard(impact_index desc);
create index if not exists idx_leaderboard_language on public.user_leaderboard(dominant_language, impact_index desc);
create index if not exists idx_leaderboard_updated on public.user_leaderboard(last_analyzed_at desc);
create index if not exists idx_leaderboard_user_id on public.user_leaderboard(user_id) where user_id is not null;
```

**Important:** If you already created the table, run this migration to make `user_id` nullable:

```sql
-- Migration: Make user_id nullable and remove unique constraint
alter table public.user_leaderboard 
  alter column user_id drop not null,
  drop constraint if exists user_leaderboard_user_id_key;
```

### 4. Data Collection (For Accurate Rankings)

**🎯 Otomatik Sistem:** Artık her defasında veri toplamana gerek yok! Sistem otomatik çalışıyor:

1. **Kullanıcılar otomatik ekleniyor**: Her giriş yapan kullanıcı otomatik olarak leaderboard'a eklenir
2. **Periyodik güncelleme**: Her gün saat 02:00'de popüler kullanıcılar otomatik güncellenir (Vercel Cron Jobs)
3. **İlk kurulum (sadece bir kez)**: İlk kurulumda kapsamlı veri toplamak için:

```bash
# İlk kurulum - sadece bir kez çalıştır
curl -X POST http://localhost:3000/api/init-data

# Durum kontrolü
curl http://localhost:3000/api/init-data
```

**Manuel Güncelleme (Opsiyonel):**
```bash
# Popüler kullanıcıları manuel güncelle
curl http://localhost:3000/api/cron/update-leaderboard

# Kapsamlı veri toplama (sadece gerekirse)
curl -X POST http://localhost:3000/api/collect-data
```

**Dağılım Analizi:**
```bash
# View real data distribution statistics
curl http://localhost:3000/api/collect-data
```

**Not:** 
- İlk kurulum 30-60 dakika sürebilir (rate limit nedeniyle)
- Sonrasında sistem otomatik çalışır, manuel müdahale gerekmez
- Her giriş yapan kullanıcı otomatik olarak leaderboard'a eklenir

### 5. GitHub OAuth App

1. Go to `https://github.com/settings/developers` → **OAuth Apps** → **New OAuth App**.
2. Set:
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
3. After creating, copy:
   - **Client ID** → `GITHUB_ID`
   - **Client Secret** → `GITHUB_SECRET`

### 6. `.env.local` Example

Create a file named `.env.local` in the project root:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace_with_strong_random_string

GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: GitHub API token for higher rate limits
GITHUB_TOKEN=your_personal_access_token
```

With these variables set, the existing `src/app/api/auth/[...nextauth]/route.ts`, `AuthProvider`, and `UserMenu` components will handle **GitHub login, session management, and Supabase persistence** automatically.
