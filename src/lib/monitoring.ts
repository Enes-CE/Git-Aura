/**
 * Monitoring & Analytics Setup
 * 
 * Bu dosya monitoring ve analytics servislerinin setup'ını içerir.
 * Production'da kullanmak için environment variable'ları ayarlayın.
 */

// Sentry Error Tracking (Opsiyonel)
export function initSentry() {
    if (typeof window === "undefined") return;
    
    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!sentryDsn) {
        console.log("Sentry DSN not configured. Error tracking disabled.");
        return;
    }

    // Sentry setup
    // import * as Sentry from "@sentry/nextjs";
    // Sentry.init({
    //     dsn: sentryDsn,
    //     tracesSampleRate: 1.0,
    //     environment: process.env.NODE_ENV,
    // });
}

// Google Analytics (Opsiyonel)
export function initGoogleAnalytics() {
    if (typeof window === "undefined") return;
    
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (!gaId) {
        console.log("Google Analytics ID not configured. Analytics disabled.");
        return;
    }

    // Google Analytics setup
    // window.gtag = window.gtag || function() { (window.gtag.q = window.gtag.q || []).push(arguments); };
    // window.gtag('js', new Date());
    // window.gtag('config', gaId);
}

// Vercel Analytics (Built-in, otomatik çalışır)
// import { Analytics } from '@vercel/analytics/react';
// <Analytics /> component'ini layout'a ekleyebilirsiniz

