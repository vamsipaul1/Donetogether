# 🚀 SUPER SIMPLE GUIDE - Follow These Exact Steps

---

## ⚡ STEP 1: Add Your API Key (2 minutes)

### What to do:
1. Open browser → Go to **https://supabase.com/dashboard**
2. Click your **DoneTogether** project
3. Look at LEFT SIDEBAR → Click **⚙️ Settings** (at the bottom)
4. Click **Edge Functions** (in the settings menu)
5. Click **Secrets** tab (at the top)
6. Click **"Add new secret"** button

### What to type:
```
Secret name:  GROQ_API_KEY
Secret value: YOUR_GROQ_API_KEY_HERE
```

7. Click **Save**

✅ **DONE! Your API key is saved.**

---

## ⚡ STEP 2: Deploy Your Function

### ⚠️ IMPORTANT: You need ONE of these two things:

**Option A: Your code is on GitHub** → Easy! Skip to "Deploy from GitHub" below

**Option B: Your code is NOT on GitHub** → You need to either:
- Push to GitHub first (recommended), OR
- Install Supabase CLI (see "One-Time CLI Setup" below)

---

### 🎯 Deploy from GitHub (If your code is on GitHub)

1. LEFT SIDEBAR → Click **Edge Functions**
2. Click **"Create a new function"** or **"Deploy function"**
3. Choose **"Deploy from GitHub"**
4. Connect your GitHub account (if not already connected)
5. Select your repository: **DoneTogether**
6. Select branch: **main** (or your default branch)
7. Function settings:
   ```
   Function name: ai-assistant
   Path:         Front-end/supabase/functions/ai-assistant
   ```
8. Click **Deploy**

✅ **DONE!** Your function is deploying...

---

### 🎯 One-Time CLI Setup (If NOT using GitHub)

**Only do this if you can't use GitHub**

#### Step A: Install CLI
1. Download: https://github.com/supabase/cli/releases/latest
2. Look for: `supabase_windows_amd64.zip`
3. Click to download
4. Extract the ZIP file
5. Copy `supabase.exe` to: `C:\Windows\System32\`

#### Step B: Deploy
1. Press **Windows Key** → Type **PowerShell** → Press Enter
2. Copy and paste this (one line at a time):

```powershell
# Go to your project
cd "c:\Users\rangu\Downloads\DoneTogether\Front-end"

# Login (will open browser)
supabase login

# Get your project ref
# Go to: https://supabase.com/dashboard → Your Project → Settings → General
# Copy the "Reference ID" (looks like: abcd1234efgh5678)

# Deploy (replace YOUR_PROJECT_REF with the ID you just copied)
supabase functions deploy ai-assistant --project-ref YOUR_PROJECT_REF
```

✅ **DONE!** Function is deployed.

---

## ⚡ STEP 3: Check It Worked (1 minute)

1. LEFT SIDEBAR → Click **Edge Functions**
2. You should see **"ai-assistant"**
3. Click on it
4. You should see:
   - ✅ Status: **Deployed**
   - 📅 Deployed: Just now
   - 🔗 URL: `https://xxxxx.supabase.co/functions/v1/ai-assistant`

✅ **SUCCESS!** Your AI Assistant is live!

---

## 🎯 What's Next?

Your AI function is now online and ready to use!

### To use it in your app:

```typescript
// Example call from your frontend
const { data } = await supabase.functions.invoke('ai-assistant', {
  body: {
    mode: 'task_assistant',
    context: { /* your project data */ },
    prompt: 'Help me break down tasks'
  }
});
```

---

## 📋 Quick Reference - Copy This

```
✅ API Key Added:     GROQ_API_KEY
✅ Function Name:     ai-assistant
✅ Function Path:     Front-end/supabase/functions/ai-assistant
✅ Your Function URL: https://[your-ref].supabase.co/functions/v1/ai-assistant
```

---

## 🆘 Stuck? Common Issues:

### "I don't see Edge Functions in sidebar"
→ Make sure you're logged into the correct Supabase account

### "Can't deploy - no GitHub"
→ Use the CLI method above (it's easy!)

### "CLI install seems complicated"
→ Just push your code to GitHub, then use the GitHub deploy method

### "How do I push to GitHub?"
→ Ask me! I can help you do that quickly.

---

**That's it! Three simple steps and you're done! 🎉**
