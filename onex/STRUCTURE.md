# 📁 Refactored Codebase Structure

This document outlines the new modular architecture for the MysteryMansion project, implemented for improved maintainability, scalability, and developer experience.

## Overview

The codebase has been restructured into a **feature-based, modular architecture** following modern best practices. Each feature is self-contained with its own components, pages, services, and logic.

---

## 🏗️ Backend Structure

Located at: `/src/backend/src/`

### Directory Layout

```
src/backend/src/
├── modules/                      # Feature-specific modules
│   ├── auth/                    # Authentication (signup, login, logout)
│   │   ├── routes.js           # Auth routes
│   │   ├── controllers/        # Auth business logic
│   │   ├── services/           # Auth services
│   │   └── index.js            # Barrel exports
│   │
│   ├── users/                  # User management
│   │   ├── routes.js
│   │   ├── controllers/
│   │   ├── services/
│   │   └── index.js
│   │
│   ├── posts/                  # Post CRUD operations
│   │   ├── routes.js
│   │   ├── controllers/
│   │   ├── services/
│   │   └── index.js
│   │
│   ├── messages/               # Messaging system
│   │   ├── routes.js
│   │   ├── conversationRoutes.js
│   │   ├── controllers/
│   │   ├── services/
│   │   └── index.js
│   │
│   ├── admin/                  # Admin dashboard & operations
│   │   ├── routes.js
│   │   ├── controllers/
│   │   ├── services/
│   │   └── index.js
│   │
│   ├── promotions/             # User promotion/tier system
│   │   ├── routes.js
│   │   ├── controllers/
│   │   ├── services/
│   │   └── index.js
│   │
│   ├── promoCodes/             # Promo code management
│   │   ├── routes.js
│   │   ├── controllers/
│   │   ├── services/
│   │   └── index.js
│   │
│   ├── analytics/              # Event tracking & analytics
│   │   ├── routes.js
│   │   └── index.js
│   │
│   ├── reviews/                # User reviews/ratings
│   │   ├── routes.js
│   │   └── index.js
│   │
│   └── platformUpdates/        # Platform announcements
│       ├── routes.js
│       ├── controllers/
│       ├── services/
│       └── index.js
│
├── common/                      # Shared backend code
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── isAdmin.js
│   │   ├── restrictionMiddleware.js
│   │   └── index.js
│   │
│   ├── utils/                  # Shared utilities
│   │   ├── cloudinary.js       # Image CDN config
│   │   ├── multer.js           # File upload middleware
│   │   ├── emailService.js     # Consolidated email utilities
│   │   ├── firebase.js         # Firebase config
│   │   ├── stateNormalizer.js
│   │   ├── promoExpiryReminderJob.js
│   │   └── index.js
│   │
│   ├── services/               # Shared business logic services
│   │   ├── emailService.js     # All email operations
│   │   └── index.js
│   │
│   ├── errors/                 # Custom error classes
│   │   ├── AppError.js
│   │   └── index.js
│   │
│   └── constants/              # Application constants
│       └── roles.js
│
├── models/                      # MongoDB schemas
│   ├── User.js
│   ├── Post.js
│   ├── Message.js
│   ├── Conversation.js
│   ├── PromoCode.js
│   ├── PromotionRequest.js
│   ├── AdminSettings.js
│   ├── AnalyticsEvent.js
│   ├── PlatformUpdate.js
│   ├── Review.js
│   ├── Comment.js
│   ├── Profiles.js
│   └── index.js                # Model exports
│
├── config/                      # Environment & app config
│   ├── env.js
│   ├── roles_list.js
│   └── index.js
│
└── app.js                       # Express app setup (routes, middleware, errors)

server.js                        # Entry point (in /src/backend/)
```

### Key Principles

- **Modules are independent**: Each module contains its own routes, controllers, and services
- **Shared code is centralized**: Common middleware, utils, and services live in `/common`
- **Clear separation of concerns**:
  - `routes.js`: Define endpoints and apply middleware
  - `controllers/`: Handle HTTP request/response logic
  - `services/`: Contain business logic (reusable functions)
  - `models/`: MongoDB schemas
- **Barrel exports**: Each module has an `index.js` for clean imports
- **Error handling**: Use `AppError` class for consistent error responses

### Import Patterns

```javascript
// Import models
import { User, Post } from '../../models/index.js';

// Import middleware
import { authMiddleware } from '../../../../common/middleware/authMiddleware.js';

// Import utilities
import { sendEmail } from '../../../../common/utils/emailService.js';

// Import services
import { promoteUser } from '../services/promotionService.js';
```

---

## 🎨 Frontend Structure

Located at: `/src/`

### Directory Layout

```
src/
├── features/                    # Feature modules (organized by domain)
│   ├── auth/                   # Authentication feature
│   │   ├── pages/
│   │   │   ├── SignInPage.jsx
│   │   │   ├── SignUpPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   └── SignOutPage.jsx
│   │   ├── components/         # Auth-specific components
│   │   ├── services/           # Auth API calls
│   │   └── index.js
│   │
│   ├── posts/                  # Posts feature
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   └── PostPage.jsx
│   │   ├── components/
│   │   │   ├── PostCard.jsx
│   │   │   ├── PostDetail.jsx
│   │   │   ├── PostForm.jsx
│   │   │   ├── Categories/
│   │   │   └── index.js
│   │   ├── services/
│   │   │   └── postCategories.js
│   │   └── index.js
│   │
│   ├── messages/               # Messaging feature
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── index.js
│   │
│   ├── users/                  # User profiles & management
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── index.js
│   │
│   ├── admin/                  # Admin dashboard
│   │   ├── pages/
│   │   ├── components/
│   │   └── index.js
│   │
│   ├── promotions/             # Promotions feature
│   │   ├── components/
│   │   └── index.js
│   │
│   ├── reviews/                # Reviews feature
│   │   ├── components/
│   │   └── index.js
│   │
│   └── updates/                # Platform updates feature
│       ├── components/
│       └── index.js
│
├── shared/                      # Reusable code across all features
│   ├── components/             # Layout & UI components
│   │   ├── Body.jsx
│   │   ├── Header.jsx
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── ScrollToTop.jsx
│   │   ├── Buttons/
│   │   ├── Loaders/
│   │   ├── Toasts/
│   │   ├── ToolTips/
│   │   ├── References/
│   │   └── index.js
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useServerPing.js
│   │   └── index.js
│   │
│   ├── utils/                  # Shared utilities
│   │   ├── api.js              # Axios instance & interceptors
│   │   ├── seo.js              # SEO utilities
│   │   ├── stateNormalizer.js
│   │   ├── analyticsTracker.js
│   │   └── index.js
│   │
│   ├── constants/              # Application constants
│   │   └── index.js
│   │
│   └── types/                  # TypeScript interfaces (JSDoc)
│       └── index.js
│
├── context/                     # Global React context
│   ├── UserContext.jsx         # User auth & profile state
│   ├── ServerReadyContext.jsx  # Server health state
│   ├── DevMessageContext.jsx   # Developer messages
│   └── useUser.jsx             # Custom hook for UserContext
│
├── services/                    # Centralized API services
│   ├── api.js                  # API client
│   └── index.js
│
├── store/                       # State management (if using Redux/Zustand)
│   └── index.js
│
├── styles/                      # Global styles
│   └── index.css
│
├── App.jsx                      # Root component
├── main.jsx                     # React DOM render entry point
└── index.css                    # Global styles

public/
├── robots.txt
└── sitemap.xml
```

### Key Principles

- **Features are independent**: Can be moved, modified, or removed without affecting others
- **Each feature is complete**: Contains pages, components, and services for that domain
- **Shared code is minimal**: Only truly reusable components/hooks go in `/shared`
- **Clear entry points**: Each feature has an `index.js` for clean imports
- **Context for global state**: User, server, and app-level state in `/context`
- **Services for API calls**: API logic centralized in feature services

### Import Patterns

```javascript
// Import from same feature
import PostCard from './components/PostCard.jsx';
import { getPost } from './services/postService.js';

// Import from shared components
import { Navbar, ScrollToTop } from '@/shared/components';

// Import from shared hooks
import { useServerPing } from '@/shared/hooks';

// Import from shared utils
import api from '@/shared/utils/api';

// Import from context
import { useUser } from '@/context';

// Import from features
import { PostPage, PostForm } from '@/features/posts';
```

### Path Aliases (Configured in vite.config.js)

```javascript
'@': './src'
'@/shared': './src/shared'
'@/features': './src/features'
'@/context': './src/context'
```

---

## 📋 Import Guidelines

### ✅ DO

```javascript
// Use barrel exports
import { PostCard, PostForm } from '@/features/posts';
import { Navbar, Footer } from '@/shared/components';

// Use relative imports for same feature
import PostDetail from './components/PostDetail';

// Use path aliases for cross-feature
import { UserProfile } from '@/features/users';
import { useUser } from '@/context';
```

### ❌ DON'T

```javascript
// Don't use deep nested imports
import PostCard from '../../../features/posts/components/PostCard';

// Don't import from index files explicitly
import { PostCard } from '@/features/posts/index.js';

// Don't mix import styles
import { PostCard } from '@/features/posts';
import { Footer } from '../shared/components/Footer'; // inconsistent
```

---

## 🔄 Module Communication

### Same Feature
```javascript
// controllers/userController.js
import userService from '../services/userService.js';
import { User } from '../../../../models/index.js';
```

### Between Features (Backend)
```javascript
// modules/promotions/services/promotionService.js
import { User, PromotionRequest } from '../../../models/index.js';
import { sendEmail } from '../../../common/utils/emailService.js';
```

### Between Features (Frontend)
```javascript
// features/admin/pages/AdminDashboard.jsx
import { useUser } from '@/context';
import { AdminStats } from '../components';
import { getMetrics } from '@/features/admin/services';
import api from '@/shared/utils/api';
```

---

## 🚀 Development Workflow

### Adding a New Feature

1. **Create feature folder**: `src/features/newFeature/`
2. **Set up structure**:
   ```
   newFeature/
   ├── pages/
   ├── components/
   ├── services/
   ├── hooks/
   └── index.js
   ```
3. **Create barrel export**: Export all public APIs
4. **Use feature**: Import from `@/features/newFeature`

### Adding a Shared Component

1. **Create in** `src/shared/components/`
2. **Update** `src/shared/components/index.js`
3. **Use from anywhere**: `import { Component } from '@/shared/components'`

### Adding a Backend Module

1. **Create** `src/backend/src/modules/newModule/`
2. **Set up**:
   ```
   newModule/
   ├── routes.js
   ├── controllers/
   ├── services/
   └── index.js
   ```
3. **Update** `src/backend/src/app.js` to register routes

---

## 📚 Resources

- [Backend Architecture Patterns](./docs/backend-patterns.md)
- [Frontend Component Guidelines](./docs/component-guidelines.md)
- [API Documentation](./docs/api.md)
- [State Management Guide](./docs/state-management.md)

---

## 🤝 Contributing

When contributing:
1. Maintain the modular structure
2. Keep features independent
3. Add tests alongside new features
4. Update documentation
5. Use consistent import patterns

---

## 📝 Last Updated

June 2024 - Complete refactoring to modular architecture
