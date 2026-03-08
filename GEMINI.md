# GEMINI.md - Project Context

## Project Overview
**Project Name:** doctor-vue3-js (小农 - Little Farmer)
**Project Type:** Agricultural AI Assistant / Management Platform
**Technology Stack:**
- **Frontend Framework:** Vue 3 (Composition API, `<script setup>`)
- **Build Tool:** Vite
- **State Management:** Pinia (with `pinia-plugin-persistedstate`)
- **Routing:** Vue Router
- **UI Libraries:**
  - **Element Plus:** Primary desktop and admin interface components.
  - **Vant:** Specialized mobile-friendly components for client features.
- **Networking:** Axios (centralized in `src/utils/requests.js`).
- **Data Visualization:** ECharts.
- **Content Rendering:** Marked & vue3-markdown-it for Markdown.
- **Maps:** AMap (@amap/amap-jsapi-loader).

**Main Features:**
- **Workbench:** Central dashboard for quick access to features.
- **AI Chat:** Interactive AI assistant (chat小农) for agricultural advice.
- **Image Diagnosis:** Intelligent crop disease recognition and diagnostic reports.
- **Farm Management:** Create and manage farms and individual plots.
- **Knowledge Base:** Searchable crop disease database.
- **Admin Dashboard:** Comprehensive management of users, knowledge base, feedback, and system logs.

---

## Building and Running

### Prerequisites
- **Node.js:** `^20.19.0` or `>=22.12.0` (as specified in `package.json`)
- **Package Manager:** npm

### Commands
- **Install Dependencies:** `npm install`
- **Development Server:** `npm run dev` (runs at `http://localhost:5173` with proxy to local backend)
- **Production Build:** `npm run build` (outputs to `dist/`, base path `/font/`)
- **Linting:** `npm run lint` (uses ESLint with auto-fix)
- **Formatting:** `npm run format` (uses Prettier)

---

## Project Structure & Architecture

### Directory Map
- `src/views/`: Page components organized by domain (admin, chat, diagnosis, farm, knowledge, etc.).
- `src/components/`: Reusable UI components, categorized by feature area.
- `src/stores/`: Pinia store definitions for state management (user, chat, vision, etc.).
- `src/axios/`: Modular API service layer (one file per domain).
- `src/utils/`:
  - `requests.js`: Axios instance with JWT interceptors.
  - `element.js` / `vant.js`: UI library setup and registration.
  - `image.js`: Image compression and processing utilities.
- `src/styles/`: SCSS global variables, mixins, and theme definitions.
- `src/composables/`: Reusable Vue composition logic (e.g., AMap, ECharts).
- `src/skills/`: Domain-specific business logic or plugins.

---

## Development Conventions

### Coding Style
- **Vue 3 Composition API:** Use `<script setup>` for all new components.
- **Naming:** CamelCase for files/directories where appropriate, PascalCase for Vue components.
- **State Management:** Use Pinia stores for shared state; avoid prop drilling for global data like user info or active chat sessions.
- **API Requests:** Define all API calls in `src/axios/` and import them into components/stores. Do not use `axios` directly in components.
- **Styling:** Use SCSS. Global variables from `src/styles/variables.scss` are automatically available in all components via Vite configuration.

### Authentication & Security
- **JWT:** Authentication is token-based. Tokens are stored in `localStorage` and managed by `userStore`.
- **Interceptors:** `src/utils/requests.js` automatically attaches the Authorization header and handles 401/token expiration.
- **Routing:** Permissions are checked in `router.beforeEach` (e.g., admin-only paths).

### Responsive Design
- The project target both desktop (Element Plus) and mobile (Vant) users.
- Components in `src/components/layout` (like `SideNav` vs `MobileTabBar`) handle platform-specific navigation.
