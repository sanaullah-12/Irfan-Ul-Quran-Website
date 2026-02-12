@echo off
echo ========================================
echo Quran Learning Platform - Setup Script
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Checking MongoDB...
echo Please ensure MongoDB is installed and running
echo Download from: https://www.mongodb.com/try/download/community
echo.
pause

echo.
echo Step 3: Environment Variables
echo Please update .env.local with your credentials:
echo - MongoDB URI
echo - Stripe keys (get from stripe.com)
echo - Gmail credentials for contact form
echo.
pause

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update .env.local file with your credentials
echo 2. Start MongoDB service
echo 3. Run 'npm run server' in one terminal
echo 4. Run 'npm run dev' in another terminal
echo 5. Visit http://localhost:3000
echo.
echo For detailed instructions, see README.md
echo.
pause
