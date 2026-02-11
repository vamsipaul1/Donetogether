# 🔧 FIX: Task Numbers Instead of UUIDs

## ✅ What Was Fixed:

The chat autocomplete was showing long UUID addresses like:
```
#f18004b-d6d-4a3a-9395198948b
#8b8d8f74-a35c-46b7-5512
```

Now it shows clean numbers like:
```
#1
#2
#3
```

## 🗄️ Database Changes:

### Added `task_number` Column:
- Auto-incrementing integer per project
- Task #1, #2, #3, etc.
- Each project has its own number sequence

### Migration File:
`ADD_TASK_NUMBERS.sql`

This migration:
1. Adds `task_number` column to tasks table
2. Creates auto-increment trigger
3. Numbers all existing tasks
4. Creates unique index per project

## 📝 How to Apply:

### Run the migration in Supabase:

1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Copy contents of `ADD_TASK_NUMBERS.sql`**
4. **Run the migration**

OR use the Supabase CLI:

```bash
supabase db push
```

## 🎯 Code Changes:

### ChatInput.tsx Updated:
1. **Fetches task_number** from database
2. **Displays #1, #2, #3** instead of UUIDs
3. **Inserts clean numbers** when clicking tasks
4. **Searches by number**: Type `#1` to find task 1

## ✨ Result:

**Before:**
```
Type: "#"
Shows: #f18004b-d6d-4a3a → Build dashboard
```

**After:**
```
Type: "#"
Shows: #1 → Build dashboard
       #2 → Setup project
       #3 → Fix login bug
```

## 🚀 Benefits:

1. **Easy to remember**: #1, #2, #3
2. **Clean references**: "Check #42" instead of "Check #8b8d8f74"
3. **Professional**: Like GitHub, Jira, Linear
4. **Per-project**: Each project has its own sequence
5. **Auto-increment**: No manual numbering needed

---

**Run the migration and refresh the page to see clean task numbers!** 🎉
