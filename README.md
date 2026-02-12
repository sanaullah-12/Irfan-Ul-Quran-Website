# 🕌 Quran Learning Platform

A complete, production-ready Quran Learning Website with live classes, real-time video calling, Stripe payments, and comprehensive Islamic resources.

## ✨ Features

### 🔐 Authentication System

- Secure JWT-based authentication
- Password hashing with bcrypt
- Protected routes
- Session management

### 🏠 Main Pages

1. **Home Page** - Beautiful landing page with Quranic verse and animated illustrations
2. **About Page** - Teacher profile, qualifications, and teaching methodology
3. **Pricing/Plans** - Three tier plans with Stripe integration (EUR currency)
4. **Resources** - Comprehensive Islamic learning materials
5. **Live Classes** - WebRTC video calling with screen sharing
6. **Contact** - Functional contact form with email notifications

### 📚 Resources Page Features

- **Nazra Qaida** - Arabic alphabet learning for beginners
- **Tajweed Section** - All 114 Surahs with audio recitation
- **Multiple Qaris** - Choose from 6+ famous reciters
- **Full Quran** - All 30 Juz (Paras)
- **Hadith Collection** - Authentic Hadith from major books
- **Daily Duas** - Categorized supplications with translations

### 💳 Payment Integration

- **Stripe Payment** (EUR currency)
- Three plans:
  - Basic: €20/hour
  - Standard: €40/hour (Most Popular)
  - Premium: €60/hour
- Payment verification and plan activation
- Payment history tracking

### 🎥 Live Classes Features

- **WebRTC Video Calling** - Real-time video communication
- **Screen Sharing** - Teachers can share teaching materials
- **Multiple Participants** - Group learning sessions
- **Class Scheduling** - Teachers can schedule classes
- **Enrollment System** - Students can enroll in classes
- **HD Video Quality** - Crystal clear video and audio

### 🎨 UI/UX Design

- Modern Islamic aesthetic with respectful design
- Clean typography and color scheme
- Smooth animations with Framer Motion
- Fully responsive (mobile, tablet, desktop)
- Accessible and user-friendly interface
- Fast loading times

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Icons** - Icon library

### Backend

- **Node.js** - Runtime
- **Express** - Server framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Real-time Communication

- **Socket.io** - WebSocket server
- **SimplePeer** - WebRTC wrapper

### Payment

- **Stripe** - Payment processing

### APIs Used

- **AlQuran Cloud API** - Quran text and audio
- **Quran.com API** - Additional Quran resources

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Stripe Account (for payments)
- Gmail Account (for email notifications)

## 🚀 Installation & Setup

### 1. Clone or Extract the Project

```bash
cd "Quran Website"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. MongoDB Setup

**Option A: Local MongoDB**

```bash
# Install MongoDB on Windows
# Download from: https://www.mongodb.com/try/download/community
# Install and start MongoDB service
```

**Option B: MongoDB Atlas (Cloud)**

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string

### 4. Environment Variables

Update `.env.local` file:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/quran-learning
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quran-learning

# JWT Secret (Change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Stripe Keys
# Get from: https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api
PORT=3001
```

### 5. Stripe Setup

1. Create account at [Stripe](https://stripe.com)
2. Go to Dashboard → Developers → API Keys
3. Copy Publishable Key and Secret Key
4. Update `.env.local` file
5. Use test mode for development

### 6. Gmail Setup (For Contact Form)

1. Enable 2-factor authentication on Gmail
2. Generate App Password:
   - Google Account → Security → 2-Step Verification
   - Scroll down → App Passwords
   - Generate new password
3. Use this password in `EMAIL_PASS`

### 7. Start Development Servers

**Terminal 1 - Backend Server:**

```bash
node server/index.js
```

**Terminal 2 - Frontend (Next.js):**

```bash
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📱 Usage Guide

### First Time Setup

1. **Create Account**
   - Navigate to http://localhost:3000
   - Click "Sign Up"
   - Fill in details (name, email, password)
   - You'll be automatically logged in

2. **Explore Resources**
   - Go to Resources page
   - Try different sections (Nazra, Tajweed, Quran, Hadith, Duas)
   - Click on Surahs to play audio
   - Change Qari from dropdown

3. **Purchase Plan**
   - Go to Plans page
   - Select a plan
   - Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits

4. **Join Live Classes**
   - Go to Classes page
   - View scheduled classes
   - Enroll in a class
   - Join when class is ongoing

### Creating a Teacher Account

Teachers can create classes. To make your account a teacher:

1. Connect to MongoDB
2. Find your user in the `users` collection
3. Update `role` field to `"teacher"`

Or use mongosh:

```bash
mongosh
use quran-learning
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "teacher" } }
)
```

### Creating a Live Class (Teachers Only)

Use API endpoint or create a simple form:

```bash
POST http://localhost:3001/api/classes/create
Authorization: Bearer YOUR_JWT_TOKEN

{
  "title": "Tajweed Basics",
  "description": "Learn basic Tajweed rules",
  "scheduledTime": "2026-02-15T10:00:00Z",
  "duration": 60
}
```

## 🗂️ Project Structure

```
Quran Website/
├── components/          # React components
│   ├── Navbar.tsx      # Navigation bar
│   ├── Footer.tsx      # Footer
│   ├── Layout.tsx      # Page layout wrapper
│   └── ProtectedRoute.tsx  # Auth protection
├── context/            # React context
│   └── AuthContext.tsx # Authentication state
├── pages/              # Next.js pages
│   ├── index.tsx       # Home page
│   ├── login.tsx       # Login page
│   ├── signup.tsx      # Signup page
│   ├── about.tsx       # About page
│   ├── plans.tsx       # Pricing page
│   ├── resources.tsx   # Resources page
│   ├── classes.tsx     # Live classes list
│   ├── contact.tsx     # Contact page
│   └── class-room/     # Video call room
├── server/             # Backend server
│   ├── index.js        # Server entry point
│   ├── models/         # MongoDB models
│   │   ├── User.js
│   │   └── Class.js
│   └── routes/         # API routes
│       ├── auth.js
│       ├── payment.js
│       ├── contact.js
│       └── classes.js
├── styles/             # CSS styles
│   └── globals.css     # Global styles
├── utils/              # Utility functions
│   ├── api.ts          # API client
│   └── quranService.ts # Quran API services
├── .env.local          # Environment variables
├── package.json        # Dependencies
├── next.config.js      # Next.js config
├── tailwind.config.js  # Tailwind config
└── tsconfig.json       # TypeScript config
```

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile

### Payments

- `POST /api/payment/create-payment-intent` - Create payment
- `POST /api/payment/confirm-payment` - Confirm payment

### Classes

- `GET /api/classes/all` - Get all classes
- `POST /api/classes/create` - Create class (teacher)
- `POST /api/classes/enroll/:id` - Enroll in class
- `GET /api/classes/room/:roomId` - Get class details

### Contact

- `POST /api/contact/send` - Send contact message

## 🎯 Features Checklist

- ✅ Modern responsive navbar with authentication
- ✅ Home page with Quranic verse and animation
- ✅ Complete authentication system (signup/login)
- ✅ Protected routes
- ✅ About page with teacher profile
- ✅ Pricing page with 3 plans
- ✅ Stripe payment integration (EUR)
- ✅ Resources page with real Quran APIs
- ✅ All 114 Surahs with audio
- ✅ Multiple Qari selection
- ✅ 30 Juz (Paras) access
- ✅ Hadith collection
- ✅ Daily Duas
- ✅ Live classes system
- ✅ WebRTC video calling
- ✅ Screen sharing capability
- ✅ Contact form with email
- ✅ Clean Islamic footer
- ✅ Fully responsive design
- ✅ Smooth animations
- ✅ MongoDB integration
- ✅ JWT authentication
- ✅ Password hashing

## 🐛 Troubleshooting

### MongoDB Connection Error

```bash
# Check if MongoDB is running
# Windows: Services → MongoDB Server → Start
# Or install MongoDB and start service
```

### Port Already in Use

```bash
# Kill process on port 3000 or 3001
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Stripe Payment Fails

- Ensure you're using test mode keys
- Use test card: 4242 4242 4242 4242
- Check Stripe dashboard for logs

### Video Call Not Working

- Allow camera/microphone permissions
- Check firewall settings
- Ensure HTTPS in production

### Email Not Sending

- Verify Gmail app password
- Enable less secure apps (not recommended)
- Use app-specific password instead

## 🌐 Deployment

### Frontend (Vercel)

```bash
npm run build
# Deploy to Vercel
```

### Backend (Heroku/Railway)

```bash
# Add Procfile
web: node server/index.js
```

### Database (MongoDB Atlas)

- Use MongoDB Atlas for production
- Update connection string

### Environment Variables

- Set all environment variables in hosting platform
- Use production Stripe keys
- Update CORS settings

## 📄 License

This is a complete educational project for Quran learning purposes.

## 🤝 Support

For issues or questions:

- Email: info@quranlearning.com
- Create an issue in the repository

## 🙏 Acknowledgments

- AlQuran Cloud API for Quran data
- Quran.com for additional resources
- All the amazing open-source libraries used

---

**Made with ❤️ for the Ummah**

May Allah accept this effort and make it beneficial for everyone seeking Islamic knowledge.
