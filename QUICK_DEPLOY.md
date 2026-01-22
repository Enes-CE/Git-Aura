# 🚀 Hızlı Deploy Rehberi

## Adım 1: Vercel CLI Kurulumu (İlk Kez)

```bash
npm i -g vercel
```

## Adım 2: Vercel'e Login

```bash
vercel login
```

## Adım 3: Deploy

```bash
vercel
```

İlk deploy'da sorular soracak:
- **Set up and deploy?** → `Y`
- **Which scope?** → Hesabını seç
- **Link to existing project?** → `N` (yeni proje)
- **Project name?** → `gitaura` (veya istediğin isim)
- **Directory?** → `.` (mevcut dizin)
- **Override settings?** → `N` (default ayarlar yeterli)

## Adım 4: Environment Variables Ekle

Vercel Dashboard → Project Settings → Environment Variables

**Zorunlu:**
```
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=[openssl rand -base64 32 ile oluştur]
GITHUB_ID=[GitHub OAuth Client ID]
GITHUB_SECRET=[GitHub OAuth Client Secret]
NEXT_PUBLIC_SUPABASE_URL=[Supabase URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Supabase Anon Key]
SUPABASE_SERVICE_ROLE_KEY=[Supabase Service Role Key]
```

**Opsiyonel:**
```
GITHUB_TOKEN=[GitHub Personal Access Token]
CRON_SECRET=[Random secret]
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

## Adım 5: GitHub OAuth Callback URL Güncelle

GitHub → Settings → Developer settings → OAuth Apps → Callback URL:
```
https://your-project.vercel.app/api/auth/callback/github
```

## Adım 6: Production Deploy

```bash
vercel --prod
```

## Adım 7: Test Et

1. Site'yi aç: `https://your-project.vercel.app`
2. GitHub ile giriş yap
3. Bir kullanıcı analiz et
4. Leaderboard'u kontrol et

## Adım 8: İlk Veri Toplama (Opsiyonel)

Tarayıcıdan veya terminalden:
```
https://your-project.vercel.app/api/init-data
```

---

**Detaylı rehber için:** `DEPLOYMENT_GUIDE.md` dosyasına bak.

