# 🚀 Quick Deployment Guide - BLANK SCREEN FIX

## ✅ What Was Fixed

The blank light navy blue screen was caused by **hardcoded localhost URLs** that don't work in production. All URLs have now been converted to use environment variables.

## 📋 Immediate Action Required

### Step 1: Set Environment Variables

**For Vercel:**
1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add these 3 required variables:

```env
NEXT_PUBLIC_ECHOFORGE_API_URL=https://your-api-domain.com
NEXT_PUBLIC_ECHOFORGE_APP_URL=https://your-app-domain.com
NEXT_PUBLIC_ECHOFORGE_API_KEY=your_api_key_here
```

**For Netlify:**
1. Go to **Site settings** → **Environment variables**
2. Add the same 3 variables above

**For Railway/Render/Other:**
1. Find the environment variables section
2. Add the same 3 variables above

### Step 2: Redeploy

After adding the environment variables:
- **Vercel**: Redeploy automatically or trigger a new deployment
- **Netlify**: Clear cache and redeploy
- **Others**: Trigger a new build

### Step 3: Verify

Visit your deployed URL - you should now see:
- ✅ Full landing page content (not blank)
- ✅ Hero section with EchoForge title
- ✅ Capabilities cards
- ✅ Pricing section
- ✅ Working buttons and links

## 🔧 Files Changed

1. **app/page.tsx** - Replaced all hardcoded URLs with env variables
2. **components/Pricing.tsx** - Fixed localhost URLs in pricing buttons
3. **next.config.js** - Created proper Next.js configuration
4. **.env.example** - Template for environment variables

## 🧪 Test Locally First

```bash
# 1. Create local environment file
cp .env.example .env.local

# 2. Edit .env.local with your URLs (or use localhost for testing)
NEXT_PUBLIC_ECHOFORGE_API_URL=http://localhost:8000
NEXT_PUBLIC_ECHOFORGE_APP_URL=http://localhost:8501
NEXT_PUBLIC_ECHOFORGE_API_KEY=demo_key_12345

# 3. Install and run
npm install
npm run dev

# 4. Visit http://localhost:3000
# You should see the full landing page!
```

## ⚠️ Common Issues

### Still seeing blank screen?
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for errors (F12)
- Verify environment variables are set correctly
- Make sure to redeploy after setting env vars

### Links not working?
- Double-check your API and App URLs are correct
- Ensure URLs start with `https://` (or `http://` for local)
- Don't include trailing slashes

### Build fails?
```bash
npm install
npm run build
```
If this succeeds locally, your deployment should work too.

## 📞 Support

If you still see issues:
1. Check browser console (F12) for error messages
2. Verify all 3 environment variables are set
3. Try a hard refresh (Ctrl+Shift+R)
4. Clear deployment cache and redeploy

## ✨ Expected Result

After deployment with correct env vars, your site will show:
- 🌌 EchoForge hero section
- 💰 Detection capabilities cards (Financial, Cybersecurity, etc.)
- 🏢 Technology section
- 💳 Pricing plans (Basic, Pro, Enterprise)
- 🧪 Live API test functionality

No more blank blue screen!
