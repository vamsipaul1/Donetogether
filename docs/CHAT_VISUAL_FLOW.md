# 🎬 CHAT SYSTEM - VISUAL FLOW GUIDE

## 📱 **USER JOURNEY**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER LOGS IN                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              SELECTS A PROJECT                               │
│  (Must have 4-6 members & team complete)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         CHAT BUTTON APPEARS IN HEADER                       │
│              [💬 Chat]                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│    USER CLICKS CHAT → SIDEBAR SLIDES IN                    │
│                                                              │
│  ┌──────────────┐  ┌────────────────────────────────┐      │
│  │              │  │   💬 Team Chat                 │      │
│  │    MAIN      │  │   ─────────────────────────────│      │
│  │   DASHBOARD  │  │                                 │      │
│  │   CONTENT    │  │  🎉 Team is complete!          │      │
│  │              │  │                                 │      │
│  │   [Tasks]    │  │  👤 Alice: Hey team!           │      │
│  │   [Timeline] │  │  👤 Bob: Let's get started!    │      │
│  │              │  │  👤 You: Sounds good! 🚀       │      │
│  │              │  │                                 │      │
│  │              │  │  ─────────────────────────────│      │
│  │              │  │  [Type a message...]   [Send]  │      │
│  └──────────────┘  └────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 **REALTIME MESSAGE FLOW**

```
USER A (Browser 1)                    SUPABASE                    USER B (Browser 2)
─────────────────                     ─────────                   ─────────────────

1. Types message
   "Hello team!"
       │
       ▼
2. Clicks Send ──────────────────────►  INSERT INTO messages
       │                                      │
       │                                      │ Postgres Trigger
       │                                      ▼
       │                                  Broadcast to 
       │                                  Realtime Channel
       │                                      │
       │                                      │
       │◄─────────────────────────────────────┤
       │                                      │
       ▼                                      ▼
3. Message appears                   4. Message appears
   instantly in chat                    instantly in chat
   (optimistic UI)                      (via subscription)

   [You] Hello team!                    [Alice] Hello team!
```

---

## 🗄️ **DATABASE TRIGGER FLOW**

```
┌─────────────────────────────────────────────────────────────┐
│                  TEAM BECOMES COMPLETE                       │
│            (4-6 members in project)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│     UPDATE projects SET is_team_complete = true             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼ TRIGGER: on_team_complete
┌─────────────────────────────────────────────────────────────┐
│        AUTO-CREATE chat_rooms entry                         │
│   INSERT INTO chat_rooms (project_id, name)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│        AUTO-SEND welcome system message                     │
│   INSERT INTO messages (content, message_type)              │
│   "🎉 Team is complete! Chat is now active..."             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 **SYSTEM MESSAGE TRIGGERS**

### **1. Team Complete**
```sql
Event: UPDATE projects (is_team_complete → true)
Trigger: create_chat_room_on_team_complete()
Result: 
  → Create chat_rooms entry
  → Send: "🎉 Team is complete! Chat is now active..."
```

### **2. Member Joins**
```sql
Event: INSERT INTO project_members
Trigger: send_member_joined_message()
Result: 
  → Send: "[Username] joined the team"
```

### **3. Task Completed**
```sql
Event: UPDATE tasks (status → 'completed')
Trigger: send_task_completed_message()
Result: 
  → Send: "✅ [User] completed task: [Task Name]"
```

---

## 🔒 **SECURITY FLOW**

```
┌─────────────────────────────────────────────────────────────┐
│              USER ATTEMPTS TO READ MESSAGES                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           RLS POLICY CHECK (messages_select)                │
│                                                              │
│  Is user a member of this project?                          │
│    ↓ YES                        ↓ NO                        │
│    ▼                            ▼                            │
│  ✅ ALLOW                       ❌ DENY                      │
│  Show messages                  Return empty                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 **COMPONENT ARCHITECTURE**

```
Dashboard.tsx
  ├─ State: isChatOpen, selectedProject, members
  ├─ Header: [Chat Button] onClick → setIsChatOpen(!isChatOpen)
  │
  └─ Main Content
      ├─ Content Area (flex-1)
      │   └─ BoardView / TimelineView / etc.
      │
      └─ ChatSidebar (conditional, animated)
          ├─ useChatRoom(projectId)
          │   └─ Fetches chat_rooms entry
          │
          └─ useChat(chatRoomId, userId)
              ├─ fetchMessages() → Load last 50
              ├─ Realtime subscription → INSERT/UPDATE/DELETE
              ├─ sendMessage(content)
              ├─ editMessage(id, content)
              └─ deleteMessage(id)
```

---

## 🎨 **UI STATES**

### **State 1: Team Not Complete**
```
┌────────────────────────┐
│   🔒 Chat Locked       │
│                        │
│   Team chat will       │
│   unlock when your     │
│   squad reaches        │
│   minimum size         │
└────────────────────────┘
```

### **State 2: Chat Available**
```
┌────────────────────────┐
│ 💬 Team Chat           │
│ 6 members              │
├────────────────────────┤
│                        │
│ 🎉 System message      │
│                        │
│ 👤 Alice: Message...   │
│ 👤 You: Reply...       │
│                        │
├────────────────────────┤
│ [Type a message...]    │
└────────────────────────┘
```

### **State 3: Typing Indicator**
```
┌────────────────────────┐
│ Latest messages...     │
│                        │
│ ● ● ● Alice is typing  │
│ [Type a message...]    │
└────────────────────────┘
```

---

## 📱 **RESPONSIVE BEHAVIOR**

### **Desktop (>768px)**
```
┌─────────────────────────────────────────────────────────┐
│  Sidebar  │     Main Content      │  Chat (380px)      │
│  (280px)  │     (flexible)        │  (when open)       │
└─────────────────────────────────────────────────────────┘
```

### **Mobile (<768px)**
```
┌─────────────────────────┐     ┌────────────────────────┐
│                         │     │   Chat (full screen)   │
│    Main Content         │ →   │   with backdrop        │
│    (full width)         │     │                        │
│                         │     │   [Close on tap]       │
└─────────────────────────┘     └────────────────────────┘
     Bottom Nav                      Bottom Nav
  [Home] [Menu] [Board] [Chat]   [Home] [Menu] [Board] [Chat]
```

---

## ⚡ **PERFORMANCE OPTIMIZATIONS**

### **1. Pagination**
```
Load 50 messages ────► Show in UI
       │
       ▼ User scrolls up
Load next 50 ────────► Prepend to array
       │
       ▼ Keeps going...
```

### **2. Realtime Subscription**
```
Component Mounts ──────► Subscribe to channel
       │                  (chat_room:{id})
       │
       ▼ New message
   Receive event ──────► Fetch full message with profile
       │                  (single query)
       │
       ▼
   Append to state ────► React re-renders

Component Unmounts ───► Unsubscribe from channel
                          (prevent memory leak)
```

### **3. Rate Limiting**
```
User sends message 1 ──► ✅ Allowed (counter: 1)
User sends message 2 ──► ✅ Allowed (counter: 2)
User sends message 3 ──► ✅ Allowed (counter: 3)
User sends message 4 ──► ✅ Allowed (counter: 4)
User sends message 5 ──► ✅ Allowed (counter: 5)
User sends message 6 ──► ❌ BLOCKED (max 5 per 10 sec)

Wait 10 seconds ────────► Counter resets ──► Can send again
```

---

## 🎯 **MESSAGE LIFECYCLE**

```
1. USER TYPES MESSAGE
   └─ handleTyping() → setTyping(true)
   └─ After 2sec timeout → setTyping(false)

2. USER PRESSES ENTER
   └─ handleSendMessage()
      ├─ Validate (not empty)
      ├─ Set sending state
      ├─ Call sendMessage() from useChat hook
      └─ Clear input

3. HOOK SENDS TO SUPABASE
   └─ supabase.from('messages').insert({...})
      └─ RLS Check: Is user in project?
         ├─ YES → Insert message
         │    └─ Trigger: check_message_rate_limit()
         │        ├─ Under limit → Allow
         │        └─ Over limit → Throw error
         │
         └─ NO → Reject with error

4. REALTIME BROADCAST
   └─ Supabase broadcasts INSERT event
      └─ All subscribed clients receive

5. OTHER CLIENTS RECEIVE
   └─ Subscription callback fires
      ├─ Fetch full message with profile
      └─ Append to messages array

6. UI UPDATES
   └─ React re-renders with new message
      └─ Framer Motion animates in
         └─ Auto-scroll to bottom
```

---

## 🎨 **MESSAGE RENDERING LOGIC**

```javascript
messages.map((message, index) => {
  const isOwn = message.user_id === currentUserId
  const isSystem = message.message_type === 'system'
  const showAvatar = !isOwn && !isSystem && 
                     (index === 0 || messages[index-1].user_id !== message.user_id)

  if (isSystem) {
    return <SystemMessage /> // Centered, gray
  }

  return (
    <MessageBubble 
      align={isOwn ? 'right' : 'left'}
      color={isOwn ? 'emerald' : 'zinc'}
      showAvatar={showAvatar}
      showName={!isOwn && showAvatar}
    />
  )
})
```

---

## ✅ **COMPLETE FEATURE MATRIX**

| Feature | Status | Description |
|---------|--------|-------------|
| Send Messages | ✅ | Text messages with Enter to send |
| Realtime Sync | ✅ | Instant delivery via Supabase |
| Edit Messages | ✅ | Edit own messages with indicator |
| Delete Messages | ✅ | Delete own messages with confirm |
| System Messages | ✅ | Auto-generated for events |
| Typing Indicator | ✅ | Shows who's typing |
| Pagination | ✅ | Load 50 messages at a time |
| Rate Limiting | ✅ | 5 messages per 10 seconds |
| Role Badges | ✅ | Leader crown icon |
| Mobile Responsive | ✅ | Full-screen overlay |
| Dark Mode | ✅ | Follows theme |
| Timestamps | ✅ | Relative time display |
| Message Grouping | ✅ | Groups by sender |
| Smooth Animations | ✅ | Framer Motion |
| Security | ✅ | RLS policies |

---

**Now you understand the complete system! Ready to test it? 🚀**

See `CHAT_QUICK_START.md` for immediate next steps.
