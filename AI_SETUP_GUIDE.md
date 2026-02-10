# 🤖 AI Assistant Setup Guide

## 📋 Overview
Your DoneTogether app now has a fully functional AI Assistant powered by Groq's ultra-fast LLM API! This guide will help you set it up.

---

## 🔑 Part 1: Get Your Groq API Key (FREE!)

### Step 1: Create Groq Account
1. Go to [console.groq.com](https://console.groq.com)
2. Click **Sign Up** (it's completely FREE!)
3. Verify your email

### Step 2: Generate API Key
1. Once logged in, go to **API Keys** in the sidebar
2. Click **Create API Key**
3. Give it a name like "DoneTogether"
4. Click **Submit**
5. **COPY THE KEY** - it starts with `gsk_...`
   - ⚠️ **IMPORTANT**: You can only view this once! Save it somewhere safe.

---

## 🔒 Part 2: Add API Key to Supabase (NOT .env!)

### Why NOT in .env?
❌ **NEVER** put `GROQ_API_KEY` in your `.env` file!
- Your `.env` is for **frontend** environment variables
- Frontend code runs in the browser (visible to users)
- API keys in frontend = **SECURITY RISK** 🚨

✅ **CORRECT**: Store in Supabase Edge Function Secrets
- Edge functions run on **backend** (secure)
- API key stays hidden from users

### Step-by-Step:
1. Go to [supabase.com](https://supabase.com) and open your project
2. Click **Project Settings** (⚙️ gear icon in bottom left)
3. In the sidebar, click **Edge Functions**
4. Find the **Secrets** section
5. Click **Add new secret**
6. Enter:
   - **Name**: `GROQ_API_KEY`
   - **Value**: `gsk_your_actual_key_here`
7. Click **Save**

---

## 🗄️ Part 3: Create Database Table

### Step 1: Copy SQL
Open the file: `database/ai_logs_table.sql` (I already created it for you!)

### Step 2: Run in Supabase
1. Go to your Supabase project
2. Click **SQL Editor** in the sidebar
3. Click **New Query**
4. Paste the contents of `ai_logs_table.sql`
5. Click **Run** or press `Ctrl+Enter`

### What This Does:
✅ Creates `ai_logs` table to track all AI interactions
✅ Sets up Row Level Security (users can only see their own logs)
✅ Creates indexes for fast queries
✅ Enables privacy controls (users can delete their history)

---

## 🚀 Part 4: Deploy Edge Function

### Option A: Deploy via Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   cd Front-end
   supabase link --project-ref rpfztwbqlgoxeefthexa
   ```

4. **Deploy the function**:
   ```bash
   supabase functions deploy ai-assistant
   ```

### Option B: Manual Upload via Dashboard

1. Go to **Edge Functions** in Supabase Dashboard
2. Click **New Function**
3. Name it `ai-assistant`
4. Copy the contents of `supabase/functions/ai-assistant/index.ts`
5. Paste and save

---

## 🧪 Part 5: Test It Out!

### 1. Run Your App
```bash
cd Front-end
npm run dev
```

### 2. Open Dashboard
- Navigate to any project
- Click the **AI Assistant** button
- Try asking:
  - "Break down my project into tasks"
  - "Analyze my project progress"
  - "Check my team's workload"

### 3. Check History
- Click the **History** button (clock icon) in the AI Assistant header
- You'll see all your past AI interactions!

---

## 📊 AI Features You Now Have

### 🎯 Task Assistant
- Breaks down projects into actionable tasks
- Suggests priorities and timelines
- Considers dependencies

### 📈 Progress Analyst
- Evaluates project health
- Identifies risks and bottlenecks
- Provides data-driven recommendations

### 👥 Team Mentor
- Analyzes workload distribution
- Suggests task reassignments
- Promotes balanced team work

### 💡 Reflection Coach
- Guides weekly retrospectives
- Asks insightful questions
- Fosters continuous improvement

---

## 🔧 Troubleshooting

### "AI temporarily unavailable"
- ✅ Check if `GROQ_API_KEY` is set in Supabase Edge Function Secrets
- ✅ Verify the edge function is deployed
- ✅ Check browser console for errors

### "Missing authorization header"
- ✅ Make sure you're logged in
- ✅ Check if Supabase auth is working

### History is empty
- ✅ Make sure `ai_logs` table is created
- ✅ Check if RLS policies are enabled
- ✅ Try making an AI request first

### Database errors
- ✅ Run the `ai_logs_table.sql` in SQL Editor
- ✅ Check table permissions in Supabase Dashboard

---

## 💰 Cost & Limits

### Groq Free Tier (Current Plan)
- **Requests**: 14,400 requests/day
- **Tokens**: 7M tokens/day
- **Speed**: Ultra-fast (70+ tokens/sec)
- **Model**: Llama 3.3 70B

### Your Usage (Estimated)
- ~300-500 tokens per AI request
- ~15,000 requests/day capacity
- Should be **MORE than enough** for your app! 🎉

---

## 📝 Security Checklist

✅ GROQ_API_KEY is in Supabase Secrets (NOT .env)
✅ .env only has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
✅ ai_logs table has RLS enabled
✅ Edge function uses service role key (secure)
✅ Frontend uses anon key (limited permissions)

---

## 🎉 You're All Set!

Your AI Assistant is now ready to help your users with:
- Smart task planning
- Progress insights
- Team optimization
- Reflection coaching

Need help? Check the logs in Supabase Dashboard > Logs > Edge Functions

Happy building! 🚀
