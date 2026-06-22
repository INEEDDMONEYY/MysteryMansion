# 📚 Migration Guide: From Old to New Structure

This guide helps developers understand what changed during the refactoring and how to adapt.

## 🔄 Backend Migration

### Before (Old Structure)
```
src/backend/
├── models/
├── controllers/
├── routes/
├── middleware/
├── utils/
├── config/
└── server.js
```

### After (New Structure)
```
src/backend/src/
├── modules/          # Feature-organized modules
├── common/           # Shared code
├── models/
├── config/
└── app.js

server.js            # Simplified entry point
```

### Breaking Changes

| Item | Before | After | Why |
|------|--------|-------|-----|
| Entry point | `server.js` | `server.js` (simplified) | Cleaner startup code |
| App config | Scattered in `server.js` | `src/app.js` | Separated concerns |
| Routes | `routes/authRoutes.js` | `src/modules/auth/routes.js` | Feature-based organization |
| Controllers | `controllers/auth.js` | `src/modules/auth/controllers/` | Co-located with feature |
| Models | `models/` | `src/models/` | Unchanged location |
| Config | `config/` | `src/config/` | Moved to src |
| Middleware | `middleware/` | `src/common/middleware/` | Shared code |
| Utils | `utils/` | `src/common/utils/` | Shared code |

### Updated Imports (Backend)

**Old:**
```javascript
import User from './models/User.js';
import authRoutes from './routes/authRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import sendEmail from './utils/sendWelcomeEmail.js';
```

**New (from app.js):**
```javascript
import { User } from './models/index.js';
import authRoutes from './modules/auth/routes.js';
import { authMiddleware } from './common/middleware/authMiddleware.js';
import { sendEmail } from './common/services/emailService.js';
```

### Module Structure (Backend)

Each module follows this pattern:
```
modules/[moduleName]/
├── routes.js              # Express Router
├── controllers/           # Business logic handlers
│   └── [name]Controller.js
├── services/              # Reusable business logic
│   └── [name]Service.js
└── index.js               # Exports
```

**Example Usage:**
```javascript
// modules/auth/routes.js
import authController from '../controllers/authController.js';

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
```

---

## 🎨 Frontend Migration

### Before (Old Structure)
```
src/
├── components/     # All components in one folder
├── pages/
├── context/
├── utils/
└── App.jsx
```

### After (New Structure)
```
src/
├── features/       # Feature-based organization
├── shared/         # Shared components/utilities
├── context/        # Global state (unchanged)
├── services/       # API services
└── App.jsx
```

### Breaking Changes

| Item | Before | After | Why |
|------|--------|-------|-----|
| Components | `components/` | `features/[feature]/components/` | Feature isolation |
| Pages | `pages/` | `features/[feature]/pages/` | Feature organization |
| Utils | `utils/` | `shared/utils/` | Clear separation |
| Hooks | None | `shared/hooks/` | Reusable logic |
| Constants | None | `shared/constants/` | Centralized constants |
| API calls | Scattered | `services/` & `features/*/services/` | Clear API layer |

### Updated Imports (Frontend)

**Old:**
```javascript
import PostCard from '../../components/Posts/PostCard.jsx';
import { useUser } from '../context/useUser.jsx';
import api from '../utils/api.js';
```

**New:**
```javascript
import { PostCard } from '@/features/posts';
import { useUser } from '@/context';
import api from '@/shared/utils/api';
```

### Feature Structure (Frontend)

Each feature folder contains:
```
features/[featureName]/
├── pages/              # Feature pages
│   └── [Name]Page.jsx
├── components/         # Feature components
│   └── [Name].jsx
├── services/           # Feature API calls
│   └── [name]Service.js
├── hooks/              # Feature hooks
│   └── use[Name].js
└── index.js            # Barrel export
```

### Path Aliases (Auto-configured)

These are now available:
```javascript
'@/features/...'       // Imports from features
'@/shared/...'         // Imports from shared
'@/context/...'        // Imports from context
'@/'                   // Imports from src
```

---

## 🔧 Common Migration Tasks

### Task: Update Route Import (Backend)

**Before:**
```javascript
// server.js
import postRoutes from './routes/postRoutes.js';
app.use('/api/posts', postRoutes);
```

**After:**
```javascript
// src/app.js
import postRoutes from './modules/posts/routes.js';
app.use('/api/posts', postRoutes);
```

### Task: Update Component Import (Frontend)

**Before:**
```javascript
import PostCard from '../components/Posts/PostCard.jsx';
import PostDetail from '../components/Posts/PostDetail.jsx';
```

**After:**
```javascript
import { PostCard, PostDetail } from '@/features/posts';
```

### Task: Move Component to Shared

**When to do this:** Component used by multiple features

**Steps:**
1. Move to `src/shared/components/[ComponentName].jsx`
2. Update `src/shared/components/index.js`:
   ```javascript
   export { default as MyComponent } from './MyComponent.jsx';
   ```
3. Update imports everywhere:
   ```javascript
   import { MyComponent } from '@/shared/components';
   ```

### Task: Create New Feature

**Backend:**
```bash
mkdir -p src/backend/src/modules/myFeature/{controllers,services}
```

Create files:
- `routes.js` - Express routes
- `controllers/myController.js` - Business logic
- `services/myService.js` - Reusable functions
- `index.js` - Exports

Update `src/app.js`:
```javascript
import myRoutes from './modules/myFeature/routes.js';
app.use('/api/my-feature', myRoutes);
```

**Frontend:**
```bash
mkdir -p src/features/myFeature/{pages,components,services}
```

Create files:
- `pages/MyFeaturePage.jsx`
- `components/MyComponent.jsx`
- `services/myFeatureService.js`
- `index.js` - Exports

Usage:
```javascript
import { MyFeaturePage, MyComponent } from '@/features/myFeature';
```

---

## ✅ Verification Checklist

After refactoring:

### Backend
- [ ] All routes defined in `modules/*/routes.js`
- [ ] Controllers in `modules/*/controllers/`
- [ ] Services in `modules/*/services/`
- [ ] Middleware in `common/middleware/`
- [ ] Utilities in `common/utils/`
- [ ] Models in `models/`
- [ ] Config in `config/`
- [ ] Entry point: `server.js` → `src/app.js` → `modules/*/routes.js`
- [ ] No circular imports

### Frontend
- [ ] Components organized by feature in `features/*/components/`
- [ ] Pages in `features/*/pages/`
- [ ] Shared components in `shared/components/`
- [ ] API calls in `services/` or `features/*/services/`
- [ ] Using path aliases (`@/`) for imports
- [ ] Barrel exports (`index.js`) in each module
- [ ] Context for global state
- [ ] No deep import paths (`../../../`)

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors

**Solution:** Check import paths
```javascript
// ❌ Wrong
import { User } from '../../../models';

// ✅ Correct
import { User } from '../../models/index.js';  // relative
// or
import { User } from '@/shared/models';  // if using alias
```

### Issue: Circular dependency errors

**Solution:** Restructure to remove cycles
- Move shared logic to `services/`
- Avoid importing `routes.js` in non-route files
- Use dependency injection

### Issue: Path aliases not working

**Solution:** Ensure vite.config.js has aliases:
```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@/shared': path.resolve(__dirname, './src/shared'),
    '@/features': path.resolve(__dirname, './src/features'),
  }
}
```

### Issue: Old imports still working in some places

**Solution:** Create import compatibility layer
```javascript
// utils/index.js (old location, if needed)
export { default as api } from '@/shared/utils/api';
```

Then gradually migrate to new location.

---

## 📝 Best Practices Going Forward

1. **Keep features independent** - Minimize cross-feature dependencies
2. **Use barrel exports** - Create `index.js` in each folder
3. **Consistent import style** - Use path aliases, not relative imports
4. **Services for logic** - Keep components presentation-only
5. **Tests alongside code** - Feature test files near feature code
6. **Document patterns** - Update this guide as you add patterns

---

## 📞 Questions or Issues?

Refer to `STRUCTURE.md` for detailed architecture information, or check the specific module's `README.md` if one exists.

---

**Last Updated:** June 2024
