# 🔧 **Troubleshooting: Edit & Reply Not Working**

## ❓ **Common Issues**

### **Issue 1: "Edit" option not visible**

**Why:** Edit only shows for YOUR OWN messages.

**Fix:**
1. Make sure you're **right-clicking YOUR message** (not someone else's)
2. The message bubble should be on the right side
3. Only works for messages you sent

**Test:**
- Send a message yourself
- Right-click it
- You should see: Reply, Copy, **Edit**, React, **Delete**

---

### **Issue 2: "Reply" button doesn't work**

**Possible causes:**

#### **A. SQL Migration Not Run**

The `reply_to` column might not exist in your database.

**Fix:** Run this in Supabase SQL Editor:

```sql
-- Check if column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'messages' AND column_name = 'reply_to';

-- If no results, run this:
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES messages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to);
```

#### **B. Browser Console Errors**

Check browser console (F12) for errors when clicking Reply.

**Expected behavior:**
1. Click Reply
2. Toast shows: "Replying to message"
3. Reply bar appears above input

**If nothing happens:**
- Open F12 → Console tab
- Click Reply
- Look for errors (red text)
- Share the error message

#### **C. Props Not Passed Correctly**

**Quick Fix:** Restart dev server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## 🧪 **Quick Diagnosis**

### **Test 1: Check Edit**

1. **Send your own message**
2. **Right-click it**
3. **Look for "Edit" option** (should be between Copy and React)

**If "Edit" is missing:**
- You might be clicking someone else's message
- Check if `isOwnMessage` prop is correct

**If "Edit" is there but doesn't work:**
- Check console for errors
- Verify `onEdit` prop is passed

### **Test 2: Check Reply**

1. **Right-click ANY message**
2. **Click "Reply"** (first option, with 💬 icon)

**Expected:**
- Toast: "Replying to message"
- Reply bar appears above input
- Shows: "Replying to [Name]: [Message]"

**If toast doesn't show:**
- Check console for errors
- Verify `onReply` prop is passed

**If reply bar doesn't show:**
- SQL migration not run
- `replyTo` state not working
- Check ChatInput props

---

## 🔍 **Debug Steps**

### **Step 1: Check Browser Console**

1. Press **F12**
2. Go to **Console** tab
3. Right-click a message
4. Click **Reply** or **Edit**
5. Look for errors

**Common errors:**

```
❌ "Cannot read property 'id' of undefined"
→ replyTo is not being set correctly

❌ "column 'reply_to' does not exist"
→ SQL migration not run

❌ "onEdit is not a function"
→ Props not passed correctly
```

### **Step 2: Verify SQL Migration**

Run in Supabase SQL Editor:

```sql
-- Check messages table structure
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;
```

**Should include:**
- `reply_to` | uuid | YES

**If missing:** Run `ADD_REPLY_FEATURE.sql`

### **Step 3: Check Network Tab**

1. Press **F12** → **Network** tab
2. Send a message with reply
3. Look for POST to `/rest/v1/messages`
4. Click on it → **Payload** tab
5. Should see: `"reply_to": "some-uuid"`

---

## 🛠️ **Manual Fixes**

### **Fix 1: Restart Everything**

```bash
# 1. Stop dev server (Ctrl+C)
# 2. Clear node_modules cache (optional)
npm run dev
# 3. Hard refresh browser (Ctrl+Shift+R)
```

### **Fix 2: Re-run SQL Migration**

```sql
-- In Supabase SQL Editor
BEGIN;

-- Add reply column
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES messages(id) ON DELETE SET NULL;

-- Add index
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to);

-- Verify
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'messages' AND column_name = 'reply_to';

COMMIT;
```

### **Fix 3: Check Component Props**

**In ChatLayout.tsx:**

```tsx
// Should have these:
<MessageBubble
    onEdit={editMessage}
    onReply={() => setReplyTo(msg)}
    // ... other props
/>

<ChatInput
    replyTo={replyTo}
    setReplyTo={setReplyTo}
    // ... other props
/>
```

---

## 📊 **Expected Behavior**

### **Edit Feature:**

1. Right-click **your own message**
2. Click **"Edit"**
3. Message becomes editable textarea
4. Make changes
5. Click **Save** or press **Enter**
6. Message updates
7. Shows **(edited)** label

### **Reply Feature:**

1. Right-click **any message**
2. Click **"Reply"**
3. Toast shows success
4. Reply bar appears above input:
   ```
   💬 Replying to John: "Hello there"  ✕
   ```
5. Type your response
6. Send message
7. Reply bar disappears
8. New message shows original above it:
   ```
   ┌─────────────────────┐
   │ John: Hello there   │ (preview with green border)
   ├─────────────────────┤
   │ Hi John!            │ (your reply)
   └─────────────────────┘
   ```

---

## 🆘 **Still Not Working?**

### **Provide This Info:**

1. **Browser Console Errors:**
   - Press F12
   - Copy any red errors
   - Screenshot if needed

2. **Which Feature:**
   - Edit not working?
   - Reply not working?
   - Both?

3. **What Happens:**
   - Nothing happens when clicked?
   - Error message shows?
   - Something else?

4. **SQL Check Result:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'messages' AND column_name = 'reply_to';
   ```
   - Does it return `reply_to`?

5. **Network Payload:**
   - When sending reply, does payload include `reply_to`?

---

## ✅ **Quick Checklist**

Before reporting issues, verify:

- [ ] I'm right-clicking MY OWN message for Edit
- [ ] I ran the SQL migration (`ADD_REPLY_FEATURE.sql`)
- [ ] I restarted the dev server (`npm run dev`)
- [ ] I hard refreshed browser (Ctrl+Shift+R)
- [ ] I checked browser console for errors (F12)
- [ ] I verified `reply_to` column exists in database
- [ ] The toast shows when I click Reply
- [ ] Props are passed to components correctly

If all checked and still broken → provide console errors!
