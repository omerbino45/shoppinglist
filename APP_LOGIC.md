# Shopping List App — Logic & Flow

Hebrew RTL family shopping list app. React 19 + TypeScript + Vite + Tailwind v4 + Firebase Firestore.

---

## Data Model

```
User
  id          string   — auto-generated "U" + base36 timestamp suffix
  name        string
  createdAt   ISO string

MasterCategory
  id          string
  name        string
  icon        string   — emoji character
  color       string   — hex, used for category accent color
  items       MasterItem[]

MasterItem
  name        string
  freq        "monthly" | "occasional"

ShoppingList
  id          string   — "SL-" + base36 (internal)
  visibleId   string   — "#1234" (random 4-digit, shown to user)
  userId      string
  date        string   — YYYY-MM-DD
  store       string   — default "רמי לוי"
  items       ShoppingItem[]
  closed      boolean
  createdAt   ISO string

ShoppingItem
  name        string
  freq        "monthly" | "occasional"
  category    string   — snapshot of category name at list creation time
  catIcon     string   — snapshot of icon
  catColor    string   — snapshot of color
  checked     boolean
```

> **Note:** `ShoppingItem` stores a snapshot of the category's display fields so lists remain correct even if the master is later edited.

---

## Firebase Collections

| Collection / Doc | Contents |
|---|---|
| `users/{id}` | User records |
| `config/masterList` | `{ categories: MasterCategory[] }` — single shared doc for all users |
| `config/masterTrash` | `{ items: DeletedMasterItem[], categories: DeletedMasterCategory[] }` |
| `shoppingLists/{id}` | ShoppingList records, queried by `userId` |

---

## App State (App.tsx)

All top-level state lives in `App`. Screens are rendered by a simple `screen` string switch — no router.

| State | Type | Description |
|---|---|---|
| `screen` | `Screen` | Current view: `login \| home \| new \| lists \| shop \| master` |
| `user` | `User \| null` | Logged-in user |
| `master` | `MasterCategory[]` | Loaded once on mount, shared across all screens |
| `lists` | `ShoppingList[]` | Loaded after login, kept in sync locally |
| `shopId` | `string \| null` | ID of the list currently open in ShopScreen |
| `loaded` | `boolean` | `false` until master loads from Firestore |

**Startup sequence:**
1. App mounts → `getMasterList()` is called immediately
2. If no master doc exists in Firestore, it is seeded from `defaultMaster.ts`
3. Once master loads, `loaded = true` → LoginScreen is shown
4. After user selects themselves, `getShoppingLists(userId)` loads their lists → HomeScreen

---

## Screen Flow

```
App boots
  └── loading spinner (until master loaded)
      └── LoginScreen
          └── select user → HomeScreen
              ├── "רשימה חדשה"  → NewListScreen → (on create) → HomeScreen
              ├── "הרשימות שלי" → ListsScreen
              │     └── tap list → ShopScreen → back → ListsScreen
              ├── "רשימת מאסטר" → MasterScreen → back → HomeScreen
              └── logout icon   → LoginScreen
```

---

## Screen Logic

### LoginScreen
- Fetches all users from `users` collection on mount.
- While loading, shows 3 shimmer skeleton rows.
- Displays each user as a tappable avatar card.
- "משתמש חדש" form: type a name → `createUser()` → saves to Firestore → calls `onLogin`.
- `onLogin(user)` → App sets `user` + navigates to `home`.

### HomeScreen
- Displays open/closed list counts derived from `lists` prop.
- Three menu cards: New List, My Lists, Master List.
- Logout button calls `onLogout` → clears user + lists, returns to login.

### NewListScreen
- Receives the full `master` array and renders all categories in collapsed accordion cards.
- Local `sel` map: `"${catIndex}-${itemIndex}" → boolean` tracks checked items.
- Filters: **All / Monthly / Occasional** (by `freq` field) and a text search.
- Each category has **Select All** and **Clear** shortcuts.
- On "צור רשימה":
  1. Validates at least one item is selected and a date is set.
  2. Builds `ShoppingItem[]` from selected entries (snapshots category display fields).
  3. Calls `saveShoppingList()` → Firestore.
  4. Calls `onCreated(list)` → App prepends list to `lists` and navigates to `home`.

### ListsScreen
- Splits lists into open (sorted by date ascending) and closed (sorted by date descending).
- **Search** filters by visibleId, raw id, formatted date string, or store name.
- **Select mode**: tap "בחירה" to enter bulk-select mode.
  - Can **Close** (marks `closed: true`) or **Delete** selected lists.
  - Close is only available if all selected lists are open.
- Tapping a card calls `onOpenList(id)` → App sets `shopId` and navigates to `shop`.

### ShopScreen
- The active shopping view for a single list.
- Items are **grouped by category** and rendered in collapsible accordion sections.
- **Filters**: All / Pending / Done. Each pill shows live counts.
- **Check/uncheck**: toggles `item.checked`, saves immediately to Firestore.
- **Remove item**: removes from array, shows a 5-second **Undo bar** at the bottom. Undo re-inserts the item at its original index.
- **Add item**: bottom sheet browsing the master list with search. Already-present items are greyed out and unclickable.
- **Settings sheet** (gear icon) exposes:
  - Edit date inline
  - Copy to WhatsApp (formatted text via `copyListToWhatsApp`)
  - Reset all checkmarks
  - Duplicate list (clone items with `checked: false` to a new date)
  - Close / Reopen list
- Progress bar in the header shows `done/total` and percentage, with contextual gradient:
  - 0–79%: violet → indigo
  - 80–99%: indigo → emerald
  - 100%: full emerald

### MasterScreen
- Full CRUD for the master item catalog.
- **Trash system**: deleted items and categories go to `config/masterTrash` in Firestore.
- **Delete item** → moves to trash, can be restored to any category via a modal.
- **Delete category** → moves category + all its items to trash. Can restore entire category.
- **Add category**: name + emoji icon + hex color picker (preset swatches).
- **Add item to category**: name + freq toggle (Monthly / Occasional).
- **Edit item**: rename and change frequency.
- Trash tab shows all deleted items and categories; each has a Restore button.
- All changes persist immediately to `config/masterList` and `config/masterTrash`.

---

## Key Utilities

### `lib/db.ts`
All Firestore I/O. Exported functions:
- `getUsers()` / `createUser(name)`
- `getMasterList()` / `saveMasterList(categories)`
- `getMasterTrash()` / `saveMasterTrash(data)`
- `getShoppingLists(userId)` / `saveShoppingList(list)` / `deleteShoppingList(id)` / `updateShoppingList(id, data)`
- `generateListId()` — `"SL-"` + base36 timestamp
- `generateVisibleId()` — `"#"` + random 4-digit number

### `lib/utils.ts`
- `formatDate(dateStr)` — Hebrew-locale date formatting
- `copyListToWhatsApp(list)` — formats the list as a plain-text WhatsApp message and writes to clipboard

### `hooks/useToast.ts`
- Returns `{ message, fire(msg) }`. Fires a toast that auto-dismisses after ~2.5s.

---

## Persistence Strategy

All mutations are **optimistic**: local state is updated first, then Firestore is called in the background. There is no loading state during mutations — the UI responds instantly and errors are silent toasts at worst. Full data is fetched only on app load and on login.
