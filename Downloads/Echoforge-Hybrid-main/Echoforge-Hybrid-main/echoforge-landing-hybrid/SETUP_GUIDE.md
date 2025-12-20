# 🚀 ECHOFORGE NEXT.JS - COMPLETE SETUP GUIDE

## ✅ WHAT'S BUILT:

### **Full Backend System:**
- ✅ PostgreSQL database with Prisma ORM
- ✅ User authentication (NextAuth.js)
- ✅ API routes (10+ endpoints)
- ✅ Plan management (FREE, STARTER, PRO, ENTERPRISE)
- ✅ Usage tracking & limits
- ✅ **USDT crypto payment system**
- ✅ Stripe payment integration
- ✅ File upload system
- ✅ Analysis processing
- ✅ Admin panel

### **Frontend:**
- ✅ 31 beautiful pages
- ✅ Login/signup pages
- ✅ Dashboard with real data
- ✅ Crypto payment UI with QR codes
- ✅ File upload component
- ✅ Admin panel for payment approval
- ✅ Billing page
- ✅ Analytics, Crypto, Forensics pages

---

## 📋 STEP-BY-STEP SETUP:

### **1. Install Dependencies (2 minutes)**
```bash
cd echoforge-landing-hybrid
npm install
```

### **2. Set Up Database (5 minutes)**

**Option A: Vercel Postgres (Recommended)**
```bash
# In Vercel dashboard:
# 1. Go to Storage → Create Database → Postgres
# 2. Copy the connection string
# 3. Paste in .env.local as DATABASE_URL
```

**Option B: Supabase (Free)**
```bash
# 1. Go to supabase.com
# 2. Create new project
# 3. Get connection string from Settings → Database
# 4. Paste in .env.local
```

**Option C: Railway**
```bash
# 1. Go to railway.app
# 2. Create PostgreSQL database
# 3. Copy connection string
# 4. Paste in .env.local
```

### **3. Create .env.local File**
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# NextAuth
NEXTAUTH_SECRET="run this command: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (optional - can use crypto only)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Crypto Wallets (GET THESE FIRST!)
USDT_TRC20_WALLET="TYourWalletAddressHere"
USDT_ERC20_WALLET="0xYourWalletAddressHere"
USDT_BEP20_WALLET="0xYourWalletAddressHere"
```

### **4. Initialize Database (1 minute)**
```bash
npx prisma generate
npx prisma db push
```

### **5. Create Demo User (Optional)**
```bash
# Run this to create admin user:
npx prisma studio
# Then manually add a user through the UI
```

Or use the signup page after starting the app!

### **6. Start Development Server**
```bash
npm run dev
```

Open http://localhost:3000

---

## 🎯 HOW TO GET USDT WALLET (5 minutes):

### **Option 1: Trust Wallet (Easiest)**
1. Download Trust Wallet app
2. Create new wallet
3. Go to "Receive" → "USDT" → "TRC20"
4. Copy address (starts with "T...")
5. Paste in .env.local as USDT_TRC20_WALLET

### **Option 2: MetaMask**
1. Install MetaMask extension
2. Create wallet
3. Copy your address (0x...)
4. Use for ERC20 and BEP20

### **Option 3: Exchange (Binance, Coinbase)**
1. Go to Deposit → USDT
2. Select network (TRC20/ERC20/BEP20)
3. Copy deposit address
4. Use in .env.local

---

## 💳 PAYMENT FLOW:

### **Customer Journey:**
1. Signs up (free account)
2. Clicks "Upgrade Plan"
3. Selects payment method (USDT or Card)
4. **If USDT:**
   - Scans QR code
   - Sends USDT to your wallet
   - Submits transaction hash
   - You verify & approve
   - Customer gets upgraded!
5. **If Card:**
   - Redirects to Stripe
   - Pays with card
   - Automatically upgraded

### **Your Role (Admin):**
1. Check `/dashboard/admin/crypto-payments`
2. See pending payments
3. Verify in your wallet
4. Click "Approve" in admin panel
5. Customer gets upgraded automatically!

---

## 🎯 TEST CHECKLIST:

### **1. Authentication:**
- [ ] Visit http://localhost:3000
- [ ] Click "Sign Up"
- [ ] Create account
- [ ] Get redirected to dashboard
- [ ] See your name in sidebar

### **2. Dashboard:**
- [ ] See real stats (0 initially)
- [ ] Click "Upload Data"
- [ ] Upload a CSV file
- [ ] See analyses count increase
- [ ] Check "Recent Analyses" section

### **3. Billing & Crypto Payment:**
- [ ] Go to /dashboard/billing
- [ ] Click upgrade on "Starter Pro"
- [ ] Select "Cryptocurrency"
- [ ] Choose TRC20 network
- [ ] See QR code with YOUR wallet
- [ ] Copy address (it's your real wallet!)

### **4. File Upload:**
- [ ] Go to dashboard
- [ ] Click "Upload Data"
- [ ] Drag & drop a CSV file
- [ ] See upload progress
- [ ] Analysis starts processing
- [ ] After 5 seconds, shows as completed

### **5. Admin Panel:**
- [ ] Change your user role to ADMIN in database
- [ ] Go to /dashboard/admin/crypto-payments
- [ ] See list of pending payments
- [ ] (If you have test payment) Click Approve
- [ ] User gets upgraded

---

## 🔧 TROUBLESHOOTING:

### **Database Connection Error:**
```bash
# Check your DATABASE_URL is correct
# Make sure database is accessible
# Run: npx prisma db push again
```

### **NextAuth Error:**
```bash
# Make sure NEXTAUTH_SECRET is set
# Run: openssl rand -base64 32
# Add to .env.local
```

### **Build Errors:**
```bash
# Delete .next folder
rm -rf .next
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
# Try again
npm run build
```

### **Can't Login:**
```bash
# Check if user exists in database
npx prisma studio
# Go to User model
# Verify email and password
```

---

## 🚀 DEPLOYMENT:

### **To Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Deploy again
vercel --prod
```

### **Environment Variables on Vercel:**
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL (your vercel URL)
- USDT_TRC20_WALLET
- USDT_ERC20_WALLET
- USDT_BEP20_WALLET

---

## 💰 START EARNING:

### **Day 1:**
1. ✅ Deploy to Vercel
2. ✅ Add your USDT wallet
3. ✅ Share your URL
4. ✅ Get first payment!

### **How Payments Work:**
- Customer pays with USDT
- Money goes directly to YOUR wallet
- You verify payment
- Approve in admin panel
- Customer gets upgraded
- **YOU KEEP 100% OF THE MONEY!**

### **Fees:**
- Stripe: 2.9% + $0.30 per transaction
- USDT (TRC20): ~$1 network fee (paid by customer)
- **You save 2-3% by accepting crypto!**

---

## 🎯 WHAT TO DO NEXT:

1. **Test locally** - Make sure everything works
2. **Get USDT wallet** - Set up Trust Wallet
3. **Deploy to Vercel** - Push to production
4. **Add wallet addresses** - Update env variables
5. **Test payment flow** - Send yourself $1 USDT
6. **Launch!** - Share with first customers

---

## 🏆 YOU NOW HAVE:

✅ Full working SaaS app
✅ Authentication system
✅ Payment processing (crypto + Stripe)
✅ User management
✅ Admin panel
✅ Usage tracking
✅ Beautiful UI
✅ **READY TO MAKE MONEY!**

---

## 📞 SUPPORT:

If something doesn't work:
1. Check this guide first
2. Check .env.local variables
3. Check database connection
4. Check browser console for errors
5. Check terminal for API errors

**YOU'RE READY TO LAUNCH! 🚀💰**
