# 💬 **Reply Feature Implementation Guide**

## ✅ **What's Implemented So Far**

### **1. Database Schema** ✅
- Added `reply_to` column to `messages` table
- Foreign key relationship to reference parent message
- SQL migration ready: `ADD_REPLY_FEATURE.sql`

### **2. Backend (useChat Hook)** ✅
- Added `replyTo` state to track which message is being replied to  
- Added `setReplyTo` function to set/clear reply
- Updated `fetchMessages` to include replied message data
- Updated `sendMessage` to accept `replyToId` parameter
- Returns `replyTo` and `setReplyTo` for components

### **3. ChatLayout Component** ✅
- Destructures `replyTo` and `setReplyTo` from useChat
- Passes `onReply` to MessageBubble
- `onReply` sets the message to reply to: `() => setReplyTo(msg)`

### **4. MessageBubble Component** ✅
- Added `onReply` to props interface
- Added `onReply` to function parameters
- Updated `handleReply` to call `onReply()` when clicked
- Shows toast notification when reply is activated

---

## 🔄 **What's Next (To Complete)**

### **5. Display Replied Message in MessageBubble**

Add UI to show which message this is replying to:

```tsx
// In MessageBubble, before message content
{(message as any).replied_message && (
    <div className="mb-2 pl-3 border-l-4 border-emerald-500 bg-zinc-100 dark:bg-zinc-800/50 rounded-r-lg p-2">
        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {(message as any).replied_message.sender?.display_name || 'Someone'}
        </div>
        <div className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
            {(message as any).replied_message.content || 'Attachment'}
        </div>
    </div>
)}
```

### **6. Update ChatInput to Show Reply Context**

Need to:
1. Accept `replyTo` and `setReplyTo` as props in ChatInput
2. Display reply bar above input when `replyTo` is set
3. Show "Replying to [Name]: [Message]" with X button to cancel
4. Pass `replyTo.id` to `sendMessage` when sending
5. Clear `replyTo` after sending

Example UI:
```tsx
{replyTo && (
    <div className="flex items-center justify-between px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500">
        <div className="flex-1">
            <div className="text-xs font-bold text-emerald-600">
                Replying to {replyTo.sender?.display_name}
            </div>
            <div className="text-sm text-zinc-600 truncate">
                {replyTo.content || 'Attachment'}
            </div>
        </div>
        <button onClick={() => setReplyTo(null)}>
            <X className="w-4 h-4" />
        </button  </div>
)}
```

### **7. ChatInput Send Handler**

Update to pass reply ID:
```tsx
const handleSend = () => {
    if (content.trim() || selectedFile) {
        onSend(content, selectedFile, replyTo?.id); // Pass reply ID
        setReplyTo(null); // Clear after sending
        setContent('');
    }
};
```

---

## 🚀 **Quick Setup Steps**

### **Step 1: Run Database Migration**

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES messages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to);
```

### **Step 2: Test the Feature**

1. **Right-click any message** → Click "Reply"
2. **Should see toast:** "Replying to message"
3. **(After completing steps 5-7)** Input should show reply bar
4. **Type a message** and send
5. **New message should show** the replied-to message above it

---

## 📋 **Files Modified**

1. ✅ `src/hooks/useChat.tsx` - Added reply state and logic
2. ✅ `src/components/chat/ChatLayout.tsx` - Pass reply handlers
3. ✅ `src/components/chat/MessageBubble.tsx` - Accept onReply
4. ⏳ `src/components/chat/ChatInput.tsx` - Show reply context (TODO)
5. ✅ `supabase/migrations/ADD_REPLY_FEATURE.sql` - Database schema

---

## 🎯 **Expected Behavior (When Complete)**

### **Reply Flow:**
1. Right-click message → "Reply"
2. Reply bar appears above input showing original message
3. Type response and send
4. New message shows with replied message preview
5. Click on replied preview → scrolls to original message

### **UI Display:**
```
┌─────────────────────────────────┐
│  👤 John Doe                    │
│  ┌─────────────────────────┐   │
│  │ 📝 Replying to Sarah:   │   │
│  │ "What time is the       │   │
│  │  meeting?"              │   │
│  └─────────────────────────┘   │
│                                 │
│  The meeting is at 3pm         │
│                          4:37PM│
└─────────────────────────────────┘
```

---

## 🐛 **Current Status**

- ✅ Database ready
- ✅ Backend logic working
- ✅ Reply button functional
- ⏳ UI for reply context (in progress)
- ⏳ ChatInput integration (next)

Once ChatInput is updated, the reply feature will be **100% functional**! 🎉
