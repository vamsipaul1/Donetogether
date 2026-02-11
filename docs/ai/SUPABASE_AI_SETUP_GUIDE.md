# 🚀 Supabase AI Assistant Setup Guide

This guide walks you through connecting your Groq API key to your Supabase Edge Function and deploying it.

---

## 📋 What You Have

- **Groq API Key**: `[Get from https://console.groq.com]`
- **Edge Function**: `supabase/functions/ai-assistant/index_v2.ts`
- **Function Config**: `supabase/config.toml`

---

## 🔧 Setup Process

### Step 1: Local Development Setup

The API key has been added to `supabase/.env` for local development:

```bash
# Location: supabase/.env
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
```

✅ **This allows you to test the function locally before deploying.**

---

### Step 2: Test Locally

Before deploying, test the function on your local machine:

```bash
# Navigate to your project directory
cd "c:\Users\rangu\Downloads\DoneTogether\Front-end"

# Start Supabase locally (this will use the .env file)
supabase start

# The function will be available at:
# http://localhost:54321/functions/v1/ai-assistant
```

**Test with curl:**
```bash
curl -X POST http://localhost:54321/functions/v1/ai-assistant \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "task_assistant",
    "context": {
      "project": {"name": "Test Project", "goal": "Test Goal", "team_size": 5},
      "tasks": {"total": 10, "done": 3, "in_progress": 2}
    },
    "prompt": "Help me break down this project"
  }'
```

---

### Step 3: Deploy to Production

Once local testing is successful, deploy to your Supabase project:

#### A. Set the Secret in Supabase

**Option 1: Using Supabase CLI (Recommended)**
```bash
# Set the production secret
supabase secrets set GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE

# Verify it was set
supabase secrets list
```

**Option 2: Using Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings** → **Edge Functions** → **Secrets**
4. Click **Add Secret**
5. Name: `GROQ_API_KEY`
6. Value: `YOUR_GROQ_API_KEY_HERE`
7. Click **Save**

#### B. Deploy the Function

```bash
# Deploy the ai-assistant function
supabase functions deploy ai-assistant

# Expected output:
# Deploying ai-assistant (project ref: your-project-ref)
# Bundled ai-assistant (xx kB)
# Deployed ai-assistant to https://your-project-ref.supabase.co/functions/v1/ai-assistant
```

---

### Step 4: Update Frontend to Use the Function

Your frontend should call the deployed edge function:

```typescript
// Example: src/lib/aiService.ts
const callAIAssistant = async (mode: string, context: any, prompt: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${supabase.supabaseUrl}/functions/v1/ai-assistant`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode, context, prompt }),
    }
  );

  if (!response.ok) {
    throw new Error('AI request failed');
  }

  return await response.json();
};
```

---

## 🎯 How It All Connects

```
┌─────────────────┐
│   Your Frontend │
│   (React/Vue)   │
└────────┬────────┘
         │ 1. User sends request
         │    with auth token
         ▼
┌─────────────────────────┐
│  Supabase Edge Function │
│   (ai-assistant)        │
├─────────────────────────┤
│ • Verifies user auth    │
│ • Gets GROQ_API_KEY     │
│   from secrets          │
│ • Builds prompt         │
└────────┬────────────────┘
         │ 2. Calls Groq API
         │    with API key
         ▼
┌─────────────────┐
│    Groq API     │
│ (LLaMA 3.3 70B) │
└────────┬────────┘
         │ 3. Returns AI response
         ▼
┌─────────────────────────┐
│  Supabase Edge Function │
├─────────────────────────┤
│ • Formats response      │
│ • Logs to ai_logs table │
│ • Returns to frontend   │
└────────┬────────────────┘
         │ 4. JSON response
         ▼
┌─────────────────┐
│   Your Frontend │
│  (Displays AI   │
│    response)    │
└─────────────────┘
```

---

## 🛠️ Troubleshooting

### Function deployment fails
- Ensure you're logged in: `supabase login`
- Link to your project: `supabase link --project-ref your-project-ref`

### "Groq API key not configured" error
- Check secrets are set: `supabase secrets list`
- Redeploy after setting secrets: `supabase functions deploy ai-assistant`

### CORS errors in browser
- The function already has CORS headers configured (see lines 4-7 in index_v2.ts)
- Ensure you're sending the Authorization header from your frontend

### Authentication errors
- Ensure user is logged in before calling the function
- Pass the session access_token in Authorization header: `Bearer ${token}`

---

## 📊 Monitoring & Logs

### View Function Logs (CLI)
```bash
supabase functions logs ai-assistant
```

### View Logs in Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Edge Functions** → **ai-assistant** → **Logs**

### View AI Usage (Database)
Your function automatically logs every AI interaction to the `ai_logs` table:

```sql
SELECT * FROM ai_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## ✅ Checklist

- [x] API key added to `supabase/.env` for local dev
- [ ] Test function locally with `supabase start`
- [ ] Set production secret: `supabase secrets set GROQ_API_KEY=...`
- [ ] Deploy function: `supabase functions deploy ai-assistant`
- [ ] Update frontend to call the deployed function
- [ ] Test in production
- [ ] Monitor logs and usage

---

## 🔐 Security Notes

1. **Never commit `.env` to Git** - The `.env` file is already in `.gitignore`
2. **Use secrets for production** - Always use `supabase secrets set` for deployed functions
3. **API key is secure** - It's only accessible server-side in the Edge Function
4. **User authentication required** - The function verifies JWT tokens before executing

---

## 📚 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Groq API Documentation](https://console.groq.com/docs)
- [Managing Secrets](https://supabase.com/docs/guides/functions/secrets)

---

**Ready to go! 🎉** Your AI Assistant is configured with the Groq API key and ready for deployment.
