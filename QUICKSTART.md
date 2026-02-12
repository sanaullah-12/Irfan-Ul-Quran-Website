# Quick Start Guide

## Installation

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Setup Environment Variables**
   - Update `.env.local` with your credentials
   - Get Stripe keys from: https://dashboard.stripe.com/test/apikeys
   - Setup Gmail app password for contact form

3. **Start MongoDB**
   - Local: Start MongoDB service
   - Cloud: Use MongoDB Atlas connection string

4. **Run Development Servers**

   Terminal 1 (Backend):

   ```bash
   node server/index.js
   ```

   Terminal 2 (Frontend):

   ```bash
   npm run dev
   ```

5. **Access Application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## Test Accounts

**Stripe Test Card:**

- Card: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits

## First Steps

1. Create an account (Sign Up)
2. Explore Resources page
3. Try Plans page with Stripe test card
4. Check Live Classes

## Need Help?

See full documentation in README.md

---

**May Allah bless your learning journey! 🤲**
