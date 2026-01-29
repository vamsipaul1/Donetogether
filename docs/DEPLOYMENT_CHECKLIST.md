# ✅ DEPLOYMENT CHECKLIST

## Pre-Deployment Verification

### 🗄️ Database Setup

- [ ] Run `supabase_tasks_migration.sql` in Supabase SQL Editor
- [ ] Verify no SQL errors in execution log
- [ ] Check tables exist:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('projects', 'tasks', 'project_members');
  ```
- [ ] Verify RLS enabled:
  ```sql
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public';
  ```
- [ ] Test helper functions:
  ```sql
  SELECT is_team_complete('test-uuid-here');
  ```

### 📦 Dependencies

- [ ] `qrcode` installed (`npm list qrcode`)
- [ ] `@types/qrcode` installed
- [ ] No high-severity npm vulnerabilities (`npm audit`)
- [ ] TypeScript builds without errors (`npm run build`)

### 🎨 UI Consistency

- [ ] Dotted background pattern visible
- [ ] Green accent color (#E2F0D9) used
- [ ] Dark mode toggle works
- [ ] All cards use rounded-[32px]
- [ ] Page transitions smooth (150-200ms)

### 🔐 Security Tests

#### Test 1: Task Access Before Team Complete
```
1. Create project with team size 4
2. Add only 2 members
3. Try to access /dashboard directly
Expected: Waiting room shows, no tasks visible
```

- [ ] ✅ PASS / ❌ FAIL

#### Test 2: Non-Owner Task Creation
```
1. Create project (you are owner)
2. Join as member (different account)
3. Member tries to click "Create Task"
Expected: Button not visible
```

- [ ] ✅ PASS / ❌ FAIL

#### Test 3: Edit Other's Task
```
1. Owner creates task assigned to Member A
2. Member B tries to update that task
Expected: Status dropdown disabled
```

- [ ] ✅ PASS / ❌ FAIL

#### Test 4: Direct API Bypass
```
Open browser console, run:
await supabase.from('tasks').insert({
  project_id: 'incomplete-project-id',
  title: 'Hack',
  ...
})
Expected: RLS blocks with error
```

- [ ] ✅ PASS / ❌ FAIL

### ⚡ Performance Tests

- [ ] Dashboard loads in < 2s on 3G
- [ ] Task list renders 50 tasks in < 100ms
- [ ] Status update responds in < 300ms
- [ ] Realtime update arrives in < 500ms
- [ ] No memory leaks after 5 minutes of use

### 📱 Responsive Design

- [ ] Mobile (320px): No horizontal scroll
- [ ] Tablet (768px): Cards stack appropriately
- [ ] Desktop (1920px): Max-width constrains content
- [ ] QR code renders correctly on mobile
- [ ] Modals are scrollable on small screens

### ♿ Accessibility

- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Focus visible on interactive elements
- [ ] Modal traps focus correctly
- [ ] Color contrast ratio > 4.5:1 (WCAG AA)
- [ ] Screen reader announces status changes

---

## Deployment Steps

### Step 1: Environment Variables

Verify `.env` or Vercel environment variables:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

- [ ] Variables set

### Step 2: Build Test

```bash
npm run build
```

Expected: No TypeScript errors, dist/ folder created

- [ ] Build successful

### Step 3: Preview Build Locally

```bash
npm run preview
```

Test all flows in production build:

- [ ] Can create project
- [ ] Can join project  
- [ ] Waiting room works
- [ ] Dashboard unlocks
- [ ] Tasks CRUD works

### Step 4: Deploy to Vercel

```bash
vercel --prod
```

or use Vercel GitHub integration (auto-deploy on push)

- [ ] Deployed successfully
- [ ] URL: ___________________________

### Step 5: Post-Deployment Smoke Test

On live URL:

1. [ ] Sign up new account
2. [ ] Create project with team size 5
3. [ ] Invite 4 members (use temp emails)
4. [ ] Verify team completes at 5/5
5. [ ] Create 3 tasks
6. [ ] Update task status as member
7. [ ] Verify overdue calculation

### Step 6: Performance Check (Production)

Using Google Lighthouse:

- [ ] Performance score > 90
- [ ] Accessibility score > 95
- [ ] Best Practices score > 90
- [ ] SEO score > 90

---

## Post-Deployment Monitoring

### Week 1

- [ ] Monitor Supabase query performance
- [ ] Check for RLS policy errors in logs
- [ ] Track user sign-up rate
- [ ] Collect first user feedback

### Week 2

- [ ] Analyze most-used domains
- [ ] Check task completion rates
- [ ] Review error logs
- [ ] Plan first iteration

---

## Rollback Plan (If Needed)

### If Database Issues

```sql
-- Rollback tasks table (DESTRUCTIVE!)
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP FUNCTION IF EXISTS handle_task_completion CASCADE;
DROP FUNCTION IF EXISTS check_team_completion CASCADE;

-- Restore projects table
ALTER TABLE public.projects 
  DROP COLUMN IF EXISTS expected_team_size,
  DROP COLUMN IF EXISTS is_team_complete;
```

- [ ] Rollback SQL prepared

### If Frontend Issues

```bash
# Revert to previous Git commit
git revert HEAD
git push origin main

# Vercel will auto-redeploy previous version
```

- [ ] Git history clean for rollback

---

## Success Metrics

### Technical Health

- [ ] < 1% error rate on task operations
- [ ] < 500ms average API response time
- [ ] > 99% uptime (Vercel + Supabase)
- [ ] Zero RLS bypass incidents

### User Engagement

- [ ] > 80% of created projects complete teams
- [ ] > 50% of teams create at least 5 tasks
- [ ] Average task completion rate > 60%
- [ ] Users return within 7 days

### Code Quality

- [ ] Zero TypeScript errors
- [ ] < 5 console warnings
- [ ] 100% of critical paths covered
- [ ] Documentation up-to-date

---

## Known Issues (Track & Fix)

### Issue Template

| # | Issue | Severity | Status | Fix Target |
|---|-------|----------|--------|-----------|
| 1 | Example: Slow on 2G | Low | Open | v1.1 |

*Add your own as you discover them*

---

## Communication Plan

### Pre-Launch

- [ ] Send beta invite to 10 students
- [ ] Create feedback Google Form
- [ ] Prepare demo video (2 min)

### Launch Day

- [ ] Post on social media
- [ ] Email to student groups
- [ ] Monitor real-time errors

### Post-Launch

- [ ] Weekly update emails
- [ ] Monthly feature surveys
- [ ] Quarterly roadmap sharing

---

## Final Checklist

Before marking "DONE":

- [ ] Database migration executed ✅
- [ ] All security tests passed ✅
- [ ] Production build succeeds ✅
- [ ] Deployed to live URL ✅
- [ ] Smoke tests passed ✅
- [ ] Lighthouse scores green ✅
- [ ] Documentation complete ✅
- [ ] Beta users invited ✅
- [ ] Monitoring set up ✅
- [ ] Rollback plan ready ✅

---

## 🎉 Launch Day Checklist

On the day you go live:

### Morning
- [ ] 9 AM: Final DB backup
- [ ] 10 AM: Deploy to production
- [ ] 11 AM: Run smoke tests

### Afternoon
- [ ] 12 PM: Send launch announcement
- [ ] 1 PM: Monitor error logs
- [ ] 3 PM: Check first user sign-ups

### Evening
- [ ] 6 PM: Review analytics
- [ ] 7 PM: Respond to feedback
- [ ] 9 PM: Prepare next-day plan

---

## Emergency Contacts

**Supabase Issues**: https://supabase.com/dashboard/support  
**Vercel Issues**: https://vercel.com/help  
**Database Admin**: [Your contact]  
**Frontend Dev**: [Your contact]  

---

## Additional Resources

- **Setup Guide**: `QUICK_START.md`
- **Full Docs**: `TASK_MANAGEMENT_README.md`
- **Architecture**: `ARCHITECTURE.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`

---

**Status**: Ready for deployment when all checkboxes ✅

**Deployment Confidence**: 🟢 HIGH

**Go / No-Go Decision**: ___________

**Signed Off By**: _____________ Date: _______

---

Good luck with your launch! 🚀
