# GitAura - Deployment Guide 🚀

## Vercel'e Deploy Etme Adımları

### 1. Git Repository Hazırlığı

```bash
# Git repository başlat
git init
git add .
git commit -m "Initial commit: GitAura v1.0"
```

### 2. GitHub'a Push (Opsiyonel ama Önerilir)

```bash
# GitHub'da yeni repository oluştur, sonra:
git remote add origin https://github.com/YOUR_USERNAME/GitAura.git
git branch -M main
git push -u origin main
```

### 3. Vercel'e Deploy

#### Yöntem 1: Vercel CLI ile (Önerilen)

```bash
# Vercel CLI kurulumu (eğer yoksa)
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

#### Yöntem 2: Vercel Dashboard ile

1. [Vercel Dashboard](https://vercel.com/dashboard)'a git
2. "Add New Project" butonuna tıkla
3. GitHub repository'ni seç (veya "Import Git Repository" ile manuel ekle)
4. Project Settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
5. "Deploy" butonuna tıkla

### 4. Environment Variables Ayarlama

Vercel Dashboard → Project Settings → Environment Variables bölümüne git ve şunları ekle:

#### Zorunlu Environment Variables:

```env
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your_strong_random_secret_here

GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Opsiyonel Environment Variables:

```env
GITHUB_TOKEN=your_github_personal_access_token
CRON_SECRET=your_cron_secret_here
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

**Önemli:**
- `NEXTAUTH_SECRET` için güçlü bir random string oluştur:
  ```bash
  openssl rand -base64 32
  ```
- Tüm environment variables'ları **Production**, **Preview**, ve **Development** için ekle
- `NEXT_PUBLIC_*` ile başlayanlar client-side'da kullanılabilir, dikkatli ol!

### 5. GitHub OAuth Callback URL Güncelleme

1. [GitHub Developer Settings](https://github.com/settings/developers) → OAuth Apps
2. Mevcut OAuth App'i seç
3. **Authorization callback URL**'i güncelle:
   ```
   https://your-project.vercel.app/api/auth/callback/github
   ```
4. Save

### 6. Cron Jobs Kontrolü

`vercel.json` dosyası otomatik olarak cron job'ı yapılandırır:
- **Path:** `/api/cron/update-leaderboard`
- **Schedule:** Her gün saat 02:00 (UTC)

Vercel Dashboard → Settings → Cron Jobs bölümünden kontrol edebilirsin.

### 7. Post-Deploy Kontrolleri

#### ✅ Build Kontrolü
- Vercel Dashboard → Deployments → Son deployment'ın başarılı olduğunu kontrol et

#### ✅ Environment Variables Kontrolü
- Tüm environment variables'ların doğru eklendiğini kontrol et

#### ✅ OAuth Kontrolü
- Site'ye git ve "GitHub ile Giriş" butonunu test et

#### ✅ API Endpoints Kontrolü
- `/api/test-token` - GitHub token kontrolü
- `/api/leaderboard` - Leaderboard API
- `/api/auth/session` - Session kontrolü

#### ✅ Sitemap & Robots
- `https://your-project.vercel.app/sitemap.xml`
- `https://your-project.vercel.app/robots.txt`

### 8. İlk Veri Toplama

Deploy sonrası ilk veri toplamak için:

```bash
# Production URL'ini kullan
curl -X POST https://your-project.vercel.app/api/init-data
```

Veya tarayıcıdan:
```
https://your-project.vercel.app/api/init-data
```

**Not:** Bu işlem 30-60 dakika sürebilir (rate limit nedeniyle).

### 9. Monitoring

#### Vercel Analytics (Built-in)
- Vercel Dashboard → Analytics bölümünden görüntüle

#### Sentry (Opsiyonel)
1. [Sentry](https://sentry.io) hesabı oluştur
2. Project oluştur ve DSN'i al
3. Vercel Environment Variables'a ekle:
   ```
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
   ```
4. `src/lib/monitoring.ts` dosyasındaki yorumları kaldır ve aktifleştir

#### Google Analytics (Opsiyonel)
1. [Google Analytics](https://analytics.google.com) hesabı oluştur
2. Measurement ID'yi al
3. Vercel Environment Variables'a ekle:
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```
4. `src/lib/monitoring.ts` dosyasındaki yorumları kaldır ve aktifleştir

### 10. Troubleshooting

#### Build Hatası
- Environment variables'ların doğru eklendiğini kontrol et
- Vercel Dashboard → Deployments → Build Logs'u incele

#### OAuth Hatası
- GitHub OAuth callback URL'inin doğru olduğunu kontrol et
- `NEXTAUTH_URL` ve `NEXTAUTH_SECRET`'ın doğru olduğunu kontrol et

#### Database Hatası
- Supabase connection string'lerinin doğru olduğunu kontrol et
- Supabase Dashboard'dan database'in erişilebilir olduğunu kontrol et

#### Rate Limit Hatası
- `GITHUB_TOKEN` environment variable'ının eklendiğini kontrol et
- Token'ın `public_repo` scope'una sahip olduğunu kontrol et

---

## Hızlı Deploy Checklist ✅

- [ ] Git repository hazır
- [ ] Vercel projesi oluşturuldu
- [ ] Tüm environment variables eklendi
- [ ] GitHub OAuth callback URL güncellendi
- [ ] Build başarılı
- [ ] OAuth test edildi
- [ ] API endpoints test edildi
- [ ] İlk veri toplama başlatıldı (opsiyonel)
- [ ] Cron jobs aktif
- [ ] Monitoring kuruldu (opsiyonel)

---

## Destek

Sorun yaşarsan:
1. Vercel Dashboard → Deployments → Build Logs'u kontrol et
2. Browser Console'da hataları kontrol et
3. Network tab'inde API isteklerini kontrol et

