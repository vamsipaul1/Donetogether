# Chat Debugging Guide

## What I Fixed

I've added comprehensive logging throughout the chat message flow to track down why messages aren't displaying.

## How to Debug

1. **Open your browser console** (F12 → Console tab)
2. **Type a message** in the chat input and hit Enter
3. **Watch for these logs** in order:

### Expected Log Flow:

```
🚀 ChatInput: Sending message: [your message]
📨 ChatLayout: handleSendMessage called with: [your message]
📨 ChatLayout: Current messages count: [number]
📨 ChatLayout: Project ID: [uuid]
📨 ChatLayout: Room ID: [uuid or null]
💬 useChat.sendMessage: START { content: ..., roomId: ..., projectId: ... }
💬 useChat.sendMessage: Adding optimistic message [message object]
💬 useChat.sendMessage: New messages array length: [number]
🔄 ChatLayout: Messages state changed! { count: [number], messages: [...] }
💬 useChat.sendMessage: Inserting to DB...
💬 useChat.sendMessage: DB insert SUCCESS [data]
```

## What to Look For

### ❌ Problem 1: Room ID is null
If you see:
```
📨 ChatLayout: Room ID: null
💬 useChat.sendMessage: No roomId, creating...
```
**This means:** The chat room isn't being created properly.
**Fix:** Check Supabase RLS policies for `chat_rooms` table.

### ❌ Problem 2: Messages array doesn't update
If you see the optimistic message added but then:
```
🔄 ChatLayout: Messages state changed! { count: 0, messages: [] }
```
**This means:** The state is being reset somewhere.
**Fix:** Check if `fetchMessages` is running and wiping state.

### ❌ Problem 3: DB Insert fails
If you see:
```
Message insert error: [error details]
```
**This means:** Database permissions or schema issue.
**Fix:** Check RLS policies for `messages` table.

### ❌ Problem 4: No logs at all
If nothing appears in console:
**This means:** The send function isn't being called.
**Fix:** Check if `onSendMessage` prop is correctly passed.

## Next Steps

1. **Send a test message** "hi"
2. **Copy all console logs** (right-click → Save all as log file)
3. **Tell me what you see** - specifically which step fails

## Quick Checks

Run these in browser console:

```javascript
// Check if you're authenticated
supabase.auth.getUser().then(d => console.log('User:', d.data.user?.id))

// Check if project exists
console.log('Project ID from URL:', window.location.pathname)

// Check messages state
// (You'll need React DevTools for this)
```

---

**Pro Tip:** The most common issue is that `messages.length === 0` causes the UI to show the welcome screen instead of the message list. Watch for the "🔄 Messages state changed" log!
