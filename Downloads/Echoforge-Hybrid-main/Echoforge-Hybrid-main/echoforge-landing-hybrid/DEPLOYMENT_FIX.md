# Deployment Fix for Blank Screen Issue

## Problem
The deployed app was showing a blank light navy blue background because all API and app URLs were hardcoded to `localhost`, which doesn't work in production.

## Solution Applied

### 1. Updated `app/page.tsx`
- Replaced all hardcoded `http://localhost:8000` with `process.env.NEXT_PUBLIC_ECHOFORGE_API_URL`
- Replaced all hardcoded `http://localhost:8501` with `process.env.NEXT_PUBLIC_ECHOFORGE_APP_URL`
- Added API key from environment variable

### 2. Updated `components/Pricing.tsx`
- Fixed remaining hardcoded localhost URLs in the pricing component

### 3. Created Environment Configuration
- Added `.env.example` with all required environment variables
- Created `next.config.js` for proper Next.js configuration

## Deployment Steps

### For Vercel:
1. Go to your project settings on Vercel
2. Navigate to Environment Variables
3. Add the following variables:
   ```
   NEXT_PUBLIC_ECHOFORGE_API_URL=https://your-api-domain.com
   NEXT_PUBLIC_ECHOFORGE_APP_URL=https://your-app-domain.com
   NEXT_PUBLIC_ECHOFORGE_API_KEY=your_api_key_here
   ```
4. Redeploy the application

### For Other Platforms:
1. Copy `.env.example` to `.env.local`
2. Fill in your actual values:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual URLs
   ```
3. Build and deploy:
   ```bash
   npm run build
   npm run start
   ```

## Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_ECHOFORGE_API_URL` | Backend API URL | `https://api.echoforge.com` |
| `NEXT_PUBLIC_ECHOFORGE_APP_URL` | Main app URL | `https://app.echoforge.com` |
| `NEXT_PUBLIC_ECHOFORGE_API_KEY` | API key for testing | `demo_key_12345` |

## Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_STRIPE_BASIC_URL` | Stripe payment link for basic plan | `#` |
| `NEXT_PUBLIC_STRIPE_PRO_URL` | Stripe payment link for pro plan | `#` |
| `NEXT_PUBLIC_FLUTTERWAVE_BASIC_URL` | Flutterwave payment link for basic | `#` |
| `NEXT_PUBLIC_FLUTTERWAVE_PRO_URL` | Flutterwave payment link for pro | `#` |

## Testing Locally

1. Create `.env.local`:
   ```bash
   NEXT_PUBLIC_ECHOFORGE_API_URL=http://localhost:8000
   NEXT_PUBLIC_ECHOFORGE_APP_URL=http://localhost:8501
   NEXT_PUBLIC_ECHOFORGE_API_KEY=demo_key_12345
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Visit `http://localhost:3000`

## Verification

After deployment, the app should:
- ✅ Display all content (not just blank background)
- ✅ Show API/App status indicators
- ✅ Have working links to API docs and app
- ✅ Allow testing the API with the "Test API Live" button

## What Was Fixed

Before:
```javascript
const apiResponse = await fetch("http://localhost:8000/health", {...});
```

After:
```javascript
const API_URL = process.env.NEXT_PUBLIC_ECHOFORGE_API_URL || "http://localhost:8000";
const apiResponse = await fetch(`${API_URL}/health`, {...});
```

This ensures the app works both locally (with fallback to localhost) and in production (with environment variables).
