# QUICK REFERENCE - Top 20 Files needing Loading State Fixes

## ADMIN COMPONENTS (13 files)

### 🔴 CRITICAL (FIX FIRST)
1. **ProductsAdmin.js** (11+ buttons)
   - Status toggles, bulk operations, create/edit/delete
   - Loading: Partial only
   - Issue: Multi-item operations have no feedback

2. **usersAdmin.js** (10+ buttons)
   - User CRUD operations
   - Loading: None
   - Issue: All operations need loading states

3. **account.js** (6 buttons)
   - Account create/update
   - Loading: None
   - Issue: Form submissions unresponsive

### 🟠 HIGH
4. **RestaurantManagement.js** (8+ buttons)
   - Status approval workflow
   - Loading: Partial (needs per-button states)

5. **creatProducts.js** (2 buttons)
   - Product creation
   - Loading: None

6. **editPtoducts.js** (3+ buttons)
   - Product editing
   - Loading: None

7. **AddCategory.js** (4 buttons)
   - Category CRUD
   - Loading: Partial

### 🟡 MEDIUM
8. **roleHome.js** (3+ buttons) - NO loading
9. **roleCreate.js** (1 button) - NO loading
10. **roleEdit.js** (1 button) - NO loading
11. **order.js** (2+ buttons) - NO loading
12. **setting/SettingAdmin.js** - Verify loading states
13. **permission/permission.js** - ✅ HAS loading (good)

---

## USER COMPONENTS (7 files)

### 🔴 CRITICAL
1. **checkoutCart.js** (8+ buttons)
   - Order type selection, table selection, submission
   - Loading: Partial (isLoadingTables exists, checkout submission missing)

### 🟠 HIGH
2. **register.js** (2 buttons) - ✅ COMPLETE (good implementation)
3. **RestaurantRegister.js** (1 button) - ✅ COMPLETE
4. **detailProducts.js** (4 buttons) - ✅ MOSTLY COMPLETE
5. **cardProducts.js** (4+ buttons) - ✅ MOSTLY COMPLETE

### 🟡 MEDIUM
6. **login.js** (1 button) - ✅ COMPLETE
7. **forgotPassword.js** (2 buttons) - ✅ COMPLETE

---

## IMPLEMENTATION STATUS SUMMARY

```
ADMIN:
✅ login.js                    1/1     Complete
✅ permission.js               1/1     Complete
⚠️  RestaurantManagement.js    6/8     Partial
⚠️  AddCategory.js             1/4     Partial
❌ ProductsAdmin.js           0/11     CRITICAL
❌ usersAdmin.js              0/10     CRITICAL
❌ account.js                 0/6      HIGH PRIORITY
❌ creatProducts.js           0/2      HIGH PRIORITY
❌ editPtoducts.js            0/3      HIGH PRIORITY
❌ roleHome.js                0/3      MEDIUM
❌ roleCreate.js              0/1      MEDIUM
❌ roleEdit.js                0/1      MEDIUM
❌ order.js                   0/2      MEDIUM

USER:
✅ register.js                2/2     Complete
✅ RestaurantRegister.js      1/1     Complete
✅ login.js                   1/1     Complete
✅ forgotPassword.js          2/2     Complete
⚠️  detailProducts.js         2/4     Partial
⚠️  cardProducts.js           2/4+    Partial
⚠️  checkoutCart.js           6/8     Partial (need form submission)
```

---

## ACTION ITEMS

### Week 1: CRITICAL (Admin)
```
[ ] ProductsAdmin.js - Add loading for:
    - handleChangeStatus (status toggle per button)
    - handleUpdateChangeMulti (bulk operations)
    - Delete operations

[ ] usersAdmin.js - Add loading for:
    - handleAddUser (create user)
    - handleSave (update user)
    - Delete operations
```

### Week 1: CRITICAL (User)
```
[ ] checkoutCart.js - Add loading for checkout submission form
```

### Week 2: HIGH (Admin)
```
[ ] account.js - Add loading for create/save operations
[ ] creatProducts.js - Add loading for submit
[ ] editPtoducts.js - Add loading for submit
[ ] AddCategory.js - Add loading for submit
[ ] RestaurantManagement.js - Individual button loading states
```

### Week 2: HIGH (User)
```
[ ] detailProducts.js - Verify loading text on checkout button
[ ] cardProducts.js - Verify loading text on buttons
```

### Week 3: MEDIUM
```
[ ] roleHome.js - Add loading for edit/delete
[ ] roleCreate.js - Add loading for submit
[ ] roleEdit.js - Add loading for submit
[ ] order.js - Add loading for bulk actions
```

---

## CODE TEMPLATE

### For Form Submissions:
```javascript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    const res = await fetch('/api/...');
    const data = await res.json();
    // handle response
  } catch (error) {
    // handle error
  } finally {
    setIsLoading(false);
  }
};

// Button:
<button type="submit" disabled={isLoading} className="btn">
  {isLoading ? "Đang xử lý..." : "Lưu"}
</button>
```

### For Async Actions:
```javascript
const [loadingId, setLoadingId] = useState(null);

const handleAction = async (id) => {
  setLoadingId(id);
  try {
    // async operation
  } finally {
    setLoadingId(null);
  }
};

// Button:
<button 
  onClick={() => handleAction(id)}
  disabled={loadingId === id}
>
  {loadingId === id ? "Đang..." : "Hành động"}
</button>
```

---

## FILES AND THEIR BUTTON COUNTS

| Rank | File | Path | Buttons | Loading | Fix Priority |
|------|------|------|---------|---------|--------------|
| 1 | ProductsAdmin.js | admin/components/products/ | 11+ | ❌ | Critical |
| 2 | usersAdmin.js | admin/components/users/ | 10+ | ❌ | Critical |
| 3 | checkoutCart.js | users/components/pages/ | 8+ | ⚠️ | Critical |
| 4 | RestaurantManagement.js | admin/components/restaurant/ | 8+ | ⚠️ | High |
| 5 | account.js | admin/components/account/ | 6 | ❌ | High |
| 6 | cardProducts.js | users/components/mixi/ | 4+ | ⚠️ | High |
| 7 | detailProducts.js | users/components/MainContents/products/ | 4 | ⚠️ | High |
| 8 | AddCategory.js | admin/components/AddCategory/ | 4 | ⚠️ | High |
| 9 | register.js | users/components/login/ | 2 | ✅ | - |
| 10 | forgotPassword.js | users/components/login/ | 2 | ✅ | - |
| 11 | creatProducts.js | admin/components/creatProduct/ | 2 | ❌ | High |
| 12 | editPtoducts.js | admin/components/creatProduct/ | 3+ | ❌ | High |
| 13 | roleHome.js | admin/components/role/ | 3+ | ❌ | Medium |
| 14 | order.js | admin/components/order/ | 2+ | ❌ | Medium |
| 15 | login.js (admin) | admin/components/auth/ | 1 | ✅ | - |
| 16 | login.js (user) | users/components/login/ | 1 | ✅ | - |
| 17 | roleCreate.js | admin/components/role/ | 1 | ❌ | Medium |
| 18 | roleEdit.js | admin/components/role/ | 1 | ❌ | Medium |
| 19 | RestaurantRegister.js | users/components/pages/ | 1 | ✅ | - |
| 20 | permission.js | admin/components/permission/ | 1 | ✅ | - |

**Legend:**
- ✅ = Has loading state
- ⚠️ = Partial loading state
- ❌ = No loading state

---

Generated: May 7, 2026
