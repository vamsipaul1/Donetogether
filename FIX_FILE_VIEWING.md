# 📁 **FIX: Members Can't View Files/Photos**

## ❌ **The Problem**

Files and images show on **desktop** but NOT on **mobile** or other devices. Members just see empty chat messages instead of attachments.

**Root Cause:** Supabase Storage RLS (Row Level Security) policies are too restrictive or missing.

---

## ✅ **THE FIX (3 Steps)**

### **Step 1: Run the SQL Fix**

1. Open **Supabase Dashboard** → Your Project
2. Go to **SQL Editor**
3. Copy **ALL** content from `FIX_FILE_ACCESS.sql`
4. **Paste and Run**
5. Should see: `🎉 File access is now fixed!`

### **Step 2: Verify Storage Bucket**

1. Go to **Supabase Dashboard** → **Storage**
2. Click on **chat-files** bucket
3. Click **Policies** tab
4. You should see these 4 policies:
   - ✅ `project_members_upload_chat_files` - FOR INSERT
   - ✅ `project_members_view_chat_files` - FOR SELECT (CRITICAL!)
   - ✅ `users_update_own_files` - FOR UPDATE
   - ✅ `users_delete_own_files` - FOR DELETE

### **Step 3: Test on Mobile**

1. **Send a test image** from desktop
2. **Open chat on mobile device**
3. **Image should now be visible!** ✅
4. **Click download button** → Should download ✅

---

## 🔍 **Why This Happened**

### **The Missing Policy:**

The bucket had an **INSERT policy** (upload works) but NO **SELECT policy** (viewing doesn't work on some devices).

**Before:**
```sql
-- ❌ Only upload allowed, viewing blocked
CREATE POLICY "upload_only" ON storage.objects FOR INSERT ...
```

**After:**
```sql
-- ✅ Both upload AND viewing allowed
CREATE POLICY "upload" ON storage.objects FOR INSERT ...
CREATE POLICY "view" ON storage.objects FOR SELECT ...  -- This was missing!
```

---

## 🧪 **Testing Checklist**

After running the fix, test these:

### **Desktop:**
- [ ] Upload image → Shows inline ✅
- [ ] Upload PDF → Shows card with download ✅
- [ ] Click download → File downloads ✅
- [ ] Click image → Opens in new tab ✅

### **Mobile:**
- [ ] See previously sent images ✅
- [ ] See PDF cards ✅
- [ ] Click download → File downloads ✅
- [ ] Tap image → Opens full-screen ✅

### **Cross-Device:**
- [ ] Send from desktop → Visible on mobile ✅
- [ ] Send from mobile → Visible on desktop ✅
- [ ] Multiple members can see same file ✅

---

## 🚨 **If Still Not Working**

### **Issue 1: Files Still Not Visible on Mobile**

**Check:**
```sql
-- Verify SELECT policy exists
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND cmd = 'SELECT';
```

**Should return:** `project_members_view_chat_files`

**If not:** Re-run `FIX_FILE_ACCESS.sql`

### **Issue 2: "Access Denied" Errors**

**Check:** Browser console (F12) for errors

**Common errors:**
- `403 Forbidden` → RLS policy blocking
- `404 Not Found` → File doesn't exist
- `CORS error` → Bucket configuration issue

**Fix:**
1. Go to **Storage** → **chat-files** → **Configuration**
2. Make sure **"Add more allowed headers"** includes:
   - `authorization`
   - `x-client-info`
   - `apikey`

### **Issue 3: Downloads Work But Images Don't Show**

**Check:** Image URLs in messages table

```sql
SELECT 
    id,
    content,
    attachment_url,
    attachment_type
FROM messages 
WHERE attachment_url IS NOT NULL
LIMIT 5;
```

**Expected:** URLs like `https://[project-ref].supabase.co/storage/v1/object/public/chat-files/[path]`

**If broken URLs:** Files uploaded before bucket was created

---

## 🔐 **Security Note**

The fix uses **authenticated-only** access:
- ✅ Only logged-in users can view files
- ✅ Public cannot access files
- ✅ Each user must be authenticated
- ✅ Files are NOT public

**Alternative (More Restrictive):**
If you want ONLY project members to access files:

```sql
CREATE POLICY "strict_project_access" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'chat-files'
    AND (storage.foldername(name))[1] IN (
        SELECT project_id::text 
        FROM project_members 
        WHERE user_id = auth.uid()
    )
);
```

But this requires organizing files in project folders: `{project-id}/{filename}`

---

## 📊 **Expected Behavior After Fix**

### **Upload (Desktop/Mobile):**
1. Click `+` button
2. Select file
3. See upload progress
4. File sends successfully
5. **All project members see it immediately**

### **View (Desktop/Mobile):**
1. Open chat
2. **See ALL attachments** (images inline, files as cards)
3. Images load and display
4. Download buttons work
5. **No broken image icons**
6. **No "access denied" errors**

### **Download (Desktop/Mobile):**
1. Click download button on any attachment
2. File downloads to device
3. Can open/view the file
4. **Works for all file types**

---

## ✅ **Success Criteria**

Mark these when done:

- [ ] SQL fix run successfully
- [ ] 4 policies visible in Storage → chat-files → Policies
- [ ] Test image sent from desktop
- [ ] Same image visible on mobile
- [ ] Download works on both devices
- [ ] No console errors
- [ ] All project members can view all files

**All checked? You're done!** 🎉

---

## 💡 **Pro Tips**

1. **Clear browser cache** after applying fix (Ctrl + Shift + R)
2. **Test in incognito** to verify policies work
3. **Check Storage → chat-files** to see uploaded files
4. **Monitor storage usage** in Supabase dashboard

Your file attachments now work perfectly across all devices! 🚀
