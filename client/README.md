# Rental Finder — Client

React single‑page application (Vite) that consumes the Rental Finder
API and presents listings with filtering, sorting, and pagination.

---

## 🛠 Tech Stack

| Layer | Library |
|---|---|
| UI | React 19 |
| Build | Vite 7 |
| Testing | Vitest 4 + React Testing Library + happy-dom |

---

## 📦 Installation

```bash
npm install
```

---

## ▶️ Development

```bash
npm run dev      # Vite dev server → http://localhost:5173
npm run build    # production build
npm run preview  # preview the production build locally
npm run lint     # ESLint
```

The dev server proxies `/api` requests to `http://localhost:3000` (the
Express backend).

---

## ✅ Testing

```bash
npm test            # single run (vitest run)
npm run test:watch  # watch mode (vitest)
```

**100 tests** across 8 test files:

| Test file | What's covered |
|---|---|
| `src/__tests__/App.test.jsx` | Initial fetch, filter/sort/page state, pagination visibility, API error handling |
| `src/sections/__tests__/Filters.test.jsx` | Controlled inputs, label rendering, handler delegation |
| `src/sections/__tests__/ListingsGrid.test.jsx` | Empty state, card rendering, fallback values, link hrefs, `rel` safety |
| `src/sections/__tests__/Pagination.test.jsx` | Prev/Next disabled states, page indicator, `onPageChange` calls |
| `src/components/__tests__/Filter.test.jsx` | Option list, controlled value, `setSortBy` interactions |
| `src/components/__tests__/NavBtn.test.jsx` | Label, disabled/enabled state, click handling |
| `src/js/__tests__/fetch-library.test.js` | HTTP method, URL, response parsing, error propagation |
| `src/js/__tests__/utils-library.test.js` | `appendParams` types/null/JSON; `getListingHref` all URL variants |

Test files live alongside the code they cover in co-located
`__tests__/` directories. The Vitest config is in
[`vite.config.js`](vite.config.js) and the jest-dom setup is in
[`src/test-setup.js`](src/test-setup.js).

---

## 🗂 Directory Layout

```
src/
├── __tests__/        # App integration tests
├── components/
│   ├── Filter.jsx
│   ├── NavBtn.jsx
│   └── __tests__/
├── js/
│   ├── fetch-library.js
│   ├── utils-library.js
│   └── __tests__/
├── sections/
│   ├── Filters.jsx
│   ├── ListingsGrid.jsx
│   ├── Pagination.jsx
│   └── __tests__/
├── App.jsx
├── main.jsx
└── test-setup.js     # @testing-library/jest-dom import
```
