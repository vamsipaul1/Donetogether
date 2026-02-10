# 🎯 YOUR PERSONAL DEPLOYMENT GUIDE
## For: DoneTogether Project
## GitHub Repo: https://github.com/vaibhavpaul1/Donetogether

---

## ✅ GOOD NEWS!

Your code is already on GitHub, so deployment is **SUPER EASY** - just use the Supabase Dashboard!

---

## 📋 STEP-BY-STEP (5 Minutes Total)

### 🔑 PART 1: Add API Key (2 minutes)

1. Open: **https://supabase.com/dashboard**
2. Click: Your **DoneTogether** project
3. Left sidebar → Click: **⚙️ Settings** (bottom)
4. Click: **Edge Functions**
5. Click: **Secrets** tab
6. Click: **Add new secret** button
7. Enter:
   - **Name:** `GROQ_API_KEY`
   - **Value:** `YOUR_GROQ_API_KEY_HERE`
8. Click: **Save**

✅ API Key saved!

---

### 🚀 PART 2: Deploy Function (3 minutes)

#### First, make sure your code is pushed to GitHub:

```powershell
# Open PowerShell in your project folder
cd "c:\Users\rangu\Downloads\DoneTogether\Front-end"

# Check status
git status

# If you have changes, commit and push them:
git add .
git commit -m "Add AI assistant function"
git push origin main
```

#### Now deploy from Supabase Dashboard:

1. Left sidebar → Click: **Edge Functions**
2. Click: **Create a new function** (or **Deploy function**)
3. Choose: **Deploy from GitHub**
4. If prompted, connect your GitHub account
5. Select repository: **vaibhavpaul1/Donetogether**
6. Select branch: **main** (or your default branch)
7. Enter function details:
   ```
   Function name: ai-assistant
   Entry point:   Front-end/supabase/functions/ai-assistant/index_v2.ts
   ```
8. Click: **Deploy**

✅ Function deploying! (Takes ~30 seconds)

---

### ✅ PART 3: Verify (1 minute)

1. Left sidebar → **Edge Functions**
2. You should see: **ai-assistant** with green ✅
3. Click on it to see:
   - Status: **Deployed**
   - URL: `https://[your-ref].supabase.co/functions/v1/ai-assistant`

✅ **DONE! Your AI Assistant is LIVE!** 🎉

---

## 🔗 Your Function URL

After deployment, your function will be at:
```
https://[your-project-ref].supabase.co/functions/v1/ai-assistant
```

You can find your exact URL in the Edge Functions dashboard.

---

## 💻 How to Use in Your Frontend

Since you're using Supabase in your React app, add this:

```typescript
// src/services/aiAssistant.ts (create this file)
import { supabase } from './supabaseClient';

export async function callAI(
  mode: 'task_assistant' | 'progress_analyst' | 'team_mentor' | 'reflection_coach',
  projectContext: any,
  userPrompt: string
) {
  try {
    const { data, error } = await supabase.functions.invoke('ai-assistant', {
      body: {
        mode,
        context: projectContext,
        prompt: userPrompt
      }
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('AI Assistant Error:', err);
    throw err;
  }
}
```

### Example Usage:

```typescript
import { callAI } from './services/aiAssistant';

// In your component:
const getTaskSuggestions = async () => {
  const result = await callAI(
    'task_assistant',
    {
      project: {
        name: 'DoneTogether',
        goal: 'Team collaboration platform',
        team_size: 5
      },
      tasks: {
        total: 20,
        done: 8,
        in_progress: 5
      }
    },
    'Suggest next steps for our project'
  );
  
  console.log(result.insights);
  console.log(result.recommendations);
};
```

---

## 🎯 Quick Checklist

- [ ] Step 1: Add GROQ_API_KEY secret to Supabase
- [ ] Step 2: Push latest code to GitHub
- [ ] Step 3: Deploy from GitHub in Supabase Dashboard
- [ ] Step 4: Verify function shows as "Deployed"
- [ ] Step 5: Copy function URL
- [ ] Step 6: Add AI helper to frontend
- [ ] Step 7: Test it works!

---

## 🆘 Need Help?

**If deployment fails:**
1. Check the **Logs** tab in your function dashboard
2. Make sure `GROQ_API_KEY` secret is set correctly
3. Verify the path: `Front-end/supabase/functions/ai-assistant`

**If function works but AI returns errors:**
1. Check your Groq API key is valid
2. View function logs to see the error
3. Make sure you're sending the right data format

---

## 📊 Monitor Your AI Usage

View AI calls in your database:
```sql
-- Run this in Supabase SQL Editor
SELECT 
  created_at,
  mode,
  prompt,
  tokens_used
FROM ai_logs
ORDER BY created_at DESC
LIMIT 20;
```

---

**You're all set! Just follow the 3 parts above and you'll have AI working in minutes! 🚀**
