# 🚨 Database Setup Required

## Issue
The backend server cannot start because MongoDB is not configured.

## Quick Setup Options

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create a MongoDB Atlas account** at https://www.mongodb.com/atlas

2. **Create a cluster** and get your connection string.

3. **Update your `.env` file** with your MongoDB connection string:
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster"
   ```

### Option 2: Local MongoDB Installation

1. **Install MongoDB** from https://www.mongodb.com/try/download/community

2. **Start MongoDB service**:
   ```bash
   mongod
   ```

3. **Update `.env` file** with local connection:
   ```env
   DATABASE_URL="mongodb://localhost:27017/school_management"
   ```

## After Database Setup

1. **Push Prisma schema to database**:
   ```bash
   npm run prisma:push
   ```

2. **Start backend**:
   ```bash
   npm run dev
   ```

3. **In another terminal, start frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   npm run dev
   ```

4. **Visit the app**:
   - Frontend: http://localhost:3001
   - First-time setup: http://localhost:3001/register-admin

## Current Status

✅ Backend code complete (40+ files)  
✅ Frontend code complete (50+ files)  
✅ .env files created  
⏳ **Need PostgreSQL database**  
⏳ Need to run migrations  

## Next Steps

1. Choose Option 1 (Docker) or Option 2 (Local PostgreSQL)
2. Run the database setup commands
3. Run `npm run prisma:migrate` in the backend directory
4. Start both servers
5. Create your admin account!
