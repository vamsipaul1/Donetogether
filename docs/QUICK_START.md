# ⚡ Quick Start Guide - Task Management System

## 🎯 What You Need To Do (3 Steps)

### Step 1: Run Database Migration (5 minutes)

1. Open your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to SQL Editor
3. Open the file: `supabase_tasks_migration.sql`
4. Copy the ENTIRE file content
5. Paste into Supabase SQL Editor
6. Click **RUN**
7. Wait for success message: `✅ Task Management Migration Complete`

**That's it!** Your database now has:
- ✅ Tasks table
- ✅ Team size gating
- ✅ Row Level Security
- ✅ Auto-completion triggers

---

### Step 2: Dependencies Already Installed ✅

The `qrcode` package has been installed automatically. You're good to go!

---

### Step 3: Test the Complete Flow (10 minutes)

#### a) Create a Project with Team Size

1. Start your dev server (if not running):
   ```bash
   npm run dev
   ```

2. Login and click **Create Project**

3. Fill in the form:
   - Title: "Test Project"
   - Domain: "Web Development"
   - **Team Size**: Select **4 Members** ⚠️ (NEW FIELD)
   - Duration: "1 Month"

4. Click **Create & Invite Members**

#### b) See the Waiting Room

You should now see:
- 📊 Progress bar showing **1 / 4**
- ✅ Your name in a green slot (as lead)
- ⚪ 3 empty waiting slots
- 🔗 Join code (e.g., "ABC123")
- 📱 QR code you can scan

**Task dashboard is LOCKED** 🔒 - This is correct!

#### c) Join as More Members

Open **3 incognito/private** browser windows:

**Window 1 (2nd member):**
- Sign up with a different email
- Go to **/join**
- Enter the join code
- Click **Join Project**

**Repeat for Windows 2 & 3**

#### d) Watch the Magic ✨

After the **4th member** joins:
- 🎉 Progress bar completes
- 🔄 Page automatically refreshes
- 🔓 **Task dashboard unlocks**
- 📋 You now see "Create Task" button (as lead)

#### e) Create Your First Task

As the lead:
1. Click **+ Create Task**
2. See **Smart Suggestions** appear (like "Setup repository")
3. Click a suggestion or type your own
4. Assign to a team member
5. Set due date
6. Select priority
7. Click **Create Task**

#### f) Update Task Status

As an assigned member:
1. Find your task in the task board
2. Click the status dropdown
3. Change to "In Progress"
4. See the status update in real-time

---

## 🎨 What You Should See

### Before Team Complete (Waiting Room)
```
┌─────────────────────────────┐
│   Waiting for Team          │
│                             │
│   Test Project              │
│   Task management unlocks   │
│   when your full team joins │
│                             │
│   ▓▓▓▓░░░░ 1/4              │
│                             │
│   ✅ You (lead)            │
│   ⚪ Waiting...             │
│   ⚪ Waiting...             │
│   ⚪ Waiting...             │
│                             │
│   📱 QR Code                │
│   🔗 ABC123                 │
└─────────────────────────────┘
```

### After Team Complete (Task Dashboard)
```
┌─────────────────────────────┐
│  Test Project   [+Create]   │
│                             │
│  📊 Stats                   │
│  Total: 3  Completed: 1     │
│                             │
│  📋 All Tasks               │
│  ─────────────────          │
│  │ Setup Repository         │
│  │ 👤 John · Due: Jan 20    │
│  │ Status: ✅ Completed     │
│  ─────────────────          │
│  │ Design UI Mockups        │
│  │ 👤 Sarah · Due: Jan 25   │
│  │ Status: 🔵 In Progress   │
│  ─────────────────          │
└─────────────────────────────┘
```

---

## 🚨 Common Issues & Fixes

### Issue: "Can't see task dashboard even with 4 members"

**Fix:**
```sql
-- Run in Supabase SQL Editor
UPDATE projects 
SET is_team_complete = true 
WHERE id = 'YOUR_PROJECT_ID';
```

### Issue: "Create Task button doesn't appear"

**Check:**
- Are you the project lead?
- Refresh the page
- Check browser console for errors

### Issue: "Tasks table doesn't exist error"

**Fix:**
- You forgot Step 1! Run the migration SQL
- Check Supabase SQL Editor for error messages
- Make sure you ran the FULL migration file

---

## 🎯 Features You Can Now Use

### For leads
- ✅ Create tasks with domain suggestions
- ✅ Assign tasks to any team member
- ✅ Change task status, priority, deadline
- ✅ See team progress overview
- ✅ Delete tasks

### For Members
- ✅ View all project tasks
- ✅ Update status of assigned tasks only
- ✅ See their personal task count
- ✅ Track approaching deadlines

### For Everyone
- ✅ Automatic overdue detection
- ✅ Visual status indicators
- ✅ Priority badges
- ✅ Due date countdowns
- ✅ Completion timestamps

---

## 📋 Keyboard Shortcuts (Pro Tips)

- `Tab` → Navigate through form fields
- `Enter` → Submit forms quickly
- `Esc` → Close modals
- `Click QR/Code` → Auto-copy to clipboard

---

## 🔍 Where to Find What

### Task Suggestions
- Located in: `src/types/database.ts`
- 9 domain categories with 6-7 tasks each
- Fully customizable - just edit the object!

### Database Schema
- Migration file: `supabase_tasks_migration.sql`
- Lines 1-50: Table creation
- Lines 51-120: RLS policies
- Lines 121-200: Helper functions

### UI Components
- Waiting Room: `src/components/WaitingRoom.tsx`
- Task Board: `src/components/TaskBoard.tsx`
- Create Modal: `src/components/CreateTaskModal.tsx`

---

## ✅ Success Checklist

After completing the quick start, you should have:

- [x] Database migration executed
- [x] QRCode package installed
- [x] Project created with team size
- [x] Waiting room displayed
- [x] 4 members joined
- [x] Task dashboard unlocked
- [x] First task created
- [x] Task status updated

**If all checked → You're ready for production!** 🚀

---

## 🚀 Deploy to Production

When ready to go live:

1. **Database**: Already done (Supabase)
2. **Frontend**: Deploy to Vercel
   ```bash
   npm run build
   vercel --prod
   ```
3. **Environment**: Make sure `.env` has production Supabase keys
4. **Test**: Run through the flow one more time in production
5. **Ship**: Share with your users!

---

## 📞 Need Help?

- **Database errors**: Check Supabase logs
- **UI bugs**: Open browser DevTools console
- **Logic issues**: Review RLS policies in Supabase

---

**Total Setup Time**: ~15 minutes  
**Complexity**: Beginner-friendly  
**Result**: Production-ready task manager  

Let's gooo! 🎉
