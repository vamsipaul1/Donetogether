# 🎯 Supabase Dashboard Deployment Guide
## Deploy Your AI Assistant in 5 Minutes (No Terminal Needed!)

---

## 📋 **What You'll Do**

1. ✅ Add your Groq API key to Supabase secrets
2. ✅ Deploy the AI assistant function
3. ✅ Test that it works
4. ✅ Update your frontend to use it

**Total Time:** ~5 minutes

---

## 🚀 **PART 1: Add the API Key**

### Step 1: Open Supabase Dashboard
1. Open your browser
2. Go to: **https://supabase.com/dashboard**
3. Log in with your account
4. Click on your **DoneTogether** project

### Step 2: Navigate to Edge Functions Settings
1. Look at the **left sidebar**
2. Scroll down to the bottom
3. Click the **"Settings"** icon (looks like a gear ⚙️)
4. In the settings menu, click **"Edge Functions"**

### Step 3: Add Your Secret
1. You should see a **"Secrets"** tab at the top - click it
2. Click the **"Add new secret"** button (usually green)
3. You'll see a form with two fields:

   **Field 1 - Secret Name:**
   ```
   GROQ_API_KEY
   ```
   
   **Field 2 - Secret Value:**
   ```
   YOUR_GROQ_API_KEY_HERE
   ```

4. Click **"Save"** or **"Add Secret"**

✅ **Done!** Your API key is now securely stored in Supabase.

---

## 🚀 **PART 2: Deploy the Function**

Now we need to upload your AI assistant code to Supabase.

### Method A: If You Have GitHub Connected (Recommended)

1. In the left sidebar, click **"Edge Functions"**
2. Click **"Create a new function"** or **"Deploy function"**
3. Choose **"Deploy from GitHub"**
4. Select your repository: `DoneTogether`
5. Select branch: `main` (or whatever your main branch is)
6. Function name: `ai-assistant`
7. Path to function: `Front-end/supabase/functions/ai-assistant`
8. Click **"Deploy"**

### Method B: Manual Upload (If you don't have GitHub)

Since Supabase doesn't support uploading Edge Functions directly through the UI, we'll use a workaround:

**Option 1: Use GitHub (Easiest)**
1. Push your code to GitHub if you haven't already
2. Then use Method A above

**Option 2: Use Supabase CLI (One-Time Setup)**
Don't worry, I'll make this super easy:

1. **Download Supabase CLI:**
   - Go to: https://github.com/supabase/cli/releases/latest
   - Download `supabase_windows_amd64.zip`
   - Extract the ZIP file
   - Copy `supabase.exe` to `C:\Windows\System32\` (this makes it available everywhere)

2. **Open PowerShell** (press Windows key, type "PowerShell", press Enter)

3. **Run these commands one by one:**

```powershell
# Navigate to your project
cd "c:\Users\rangu\Downloads\DoneTogether\Front-end"

# Login to Supabase (this will open a browser window)
supabase login

# Deploy the function
supabase functions deploy ai-assistant --project-ref YOUR_PROJECT_REF
```

**Where to find YOUR_PROJECT_REF:**
1. Go to Supabase Dashboard
2. Settings → General
3. Look for "Reference ID" - copy it
4. Replace `YOUR_PROJECT_REF` in the command above

---

## 🎉 **PART 3: Verify It Worked**

### Check in Dashboard
1. Go to **Edge Functions** in the left sidebar
2. You should see **"ai-assistant"** in the list
3. Click on it
4. You should see:
   - Status: **Deployed** ✅
   - Last deployed: Just now
   - Function URL: `https://[your-ref].supabase.co/functions/v1/ai-assistant`

### Test Your Function
1. Click on the **"ai-assistant"** function
2. Look for **"Invocations"** or **"Logs"** tab
3. You can test it right from the dashboard

Or test with this curl command (replace YOUR_ANON_KEY and YOUR_PROJECT_URL):

```bash
curl -X POST https://YOUR_PROJECT_URL/functions/v1/ai-assistant \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "task_assistant",
    "context": {
      "project": {"name": "Test", "goal": "Test", "team_size": 1},
      "tasks": {"total": 1, "done": 0, "in_progress": 1}
    },
    "prompt": "Help me"
  }'
```

**Where to find YOUR_ANON_KEY:**
- Settings → API
- Copy the "anon" key (public key)

---

## 🔗 **PART 4: Update Your Frontend**

Your AI Assistant is now live! Update your frontend to use it.

### Get Your Function URL

Your function is available at:
```
https://[your-project-ref].supabase.co/functions/v1/ai-assistant
```

### Example Frontend Code

If you already have Supabase initialized in your frontend:

```typescript
// In your AI service file (e.g., src/services/aiService.ts)
import { supabase } from './supabaseClient';

export async function callAIAssistant(
  mode: 'task_assistant' | 'progress_analyst' | 'team_mentor' | 'reflection_coach',
  context: any,
  prompt: string
) {
  // Get user session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('You must be logged in to use AI Assistant');
  }

  // Call your deployed function
  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: {
      mode,
      context,
      prompt
    }
  });

  if (error) {
    console.error('AI Error:', error);
    throw error;
  }

  return data;
}
```

### Usage in Your Components

```typescript
import { callAIAssistant } from './services/aiService';

// Example: Task breakdown
const result = await callAIAssistant(
  'task_assistant',
  {
    project: {
      name: 'My Project',
      goal: 'Build a task manager',
      team_size: 3
    },
    tasks: {
      total: 10,
      done: 3,
      in_progress: 2
    }
  },
  'Break down the remaining tasks'
);

console.log(result);
// { mode: 'task_assistant', insights: [...], recommendations: [...] }
```

---

## ✅ **Checklist**

Mark off each step as you complete it:

- [ ] Step 1: Opened Supabase Dashboard
- [ ] Step 2: Added GROQ_API_KEY secret
- [ ] Step 3: Deployed ai-assistant function
- [ ] Step 4: Verified function appears in Edge Functions list
- [ ] Step 5: Got my function URL
- [ ] Step 6: Updated frontend to call the function
- [ ] Step 7: Tested it works!

---

## 🆘 **Troubleshooting**

### "I don't see Edge Functions in the sidebar"
- Make sure you're on a paid plan or have Edge Functions enabled
- Some free plans may have limited Edge Functions access

### "Secret won't save"
- Make sure the secret name is exactly: `GROQ_API_KEY` (all caps, no spaces)
- The value should be your complete API key

### "Function deployment failed"
- Check that your `index_v2.ts` file has no syntax errors
- Make sure the path is correct: `Front-end/supabase/functions/ai-assistant`

### "Function deployed but not working"
- Check the Logs tab in the function dashboard
- Make sure the GROQ_API_KEY secret is set
- Verify your frontend is sending the Authorization header

---

## 🎯 **Quick Reference**

**Your API Key:**
```
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
```

**Function Name:**
```
ai-assistant
```

**Function Path:**
```
Front-end/supabase/functions/ai-assistant
```

**Supported Modes:**
- `task_assistant` - Break down tasks
- `progress_analyst` - Analyze progress
- `team_mentor` - Team collaboration tips
- `reflection_coach` - Reflection and learning

---

## 📞 **Need Help?**

If you get stuck:
1. Check the **Logs** tab in your function dashboard
2. Look at the **Error messages** - they're usually helpful
3. Make sure you completed all the checklist items above

---

**You've got this! 💪 Each step is simple, just follow along.**
