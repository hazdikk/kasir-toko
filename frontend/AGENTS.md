<!-- AUTO-GENERATED: run `npm run sync:agent-docs` -->
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# kasir-toko — Frontend

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · App Router

> Sync note: `AGENTS.md` is generated from this file via `npm run sync:agent-docs`.
> After editing this file, run the sync command to keep both in sync.

> **Note:** This is Next.js 16 with React 19 — APIs and conventions may differ
> from earlier versions. Check `node_modules/next/dist/docs/` before using
> unfamiliar APIs.

## Commands

```bash
npm run dev     # start dev server (port 3000)
npm run build   # production build
npm run lint    # ESLint check
```

## Directory Structure

```
src/
└── app/
    ├── layout.tsx          # root layout
    ├── page.tsx            # home route
    ├── (auth)/             # route group — login, register
    ├── (dashboard)/        # route group — main app pages
    │   ├── kasir/          # cashier / POS screen
    │   ├── produk/         # product management
    │   └── laporan/        # sales reports
    └── api/                # route handlers (if needed)

src/
├── components/             # shared UI components
│   └── ui/                 # primitives (Button, Input, Modal…)
├── hooks/                  # custom React hooks
├── services/               # API call functions (fetch wrappers)
├── types/                  # TypeScript interfaces and types
└── lib/                    # pure utilities (formatters, helpers)
```

## Styling — Mobile First

This app is primarily used on phones. All UI must be designed for mobile first.

- Default styles target mobile; use `md:` / `lg:` breakpoints to scale up for larger screens
- Minimum tap target size: 44×44px for buttons and interactive elements
- Avoid hover-only interactions — use `active:` states instead
- Use `text-base` (16px) minimum for body text to prevent iOS auto-zoom on inputs
- Prefer full-width (`w-full`) buttons and inputs on mobile
- Avoid fixed pixel widths — use relative units, `w-full`, or Tailwind's fluid utilities
- Test layouts at 375px (iPhone SE) as the baseline width

---

## Clean Code — Robert C. Martin (adapted for React/TS)

### Naming
- Components: `PascalCase` noun — `ProductCard`, `CartSummary`, `CheckoutButton`
- Hooks: `use` prefix + verb/noun — `useCart()`, `useProductList()`, `useAuthSession()`
- Event handlers: `handle` prefix — `handleAddToCart`, `handleSubmit`, `handleDelete`
- Booleans: `isLoading`, `hasError`, `canSubmit`
- No abbreviations — `transaction` not `txn`, `product` not `prod`

### Components
- Single responsibility: one component = one purpose
- If a component needs scrolling to read, extract part of it
- Keep JSX clean — move complex logic into variables or helper functions above the return
- Avoid prop drilling beyond 2 levels — use context or co-locate state
- Separate concerns: data-fetching components vs. pure presentational components

### Functions / Hooks
- Do one thing — `useCart` manages cart state only, not auth or product fetching
- Extract repeated logic into a custom hook, not copy-pasted between components
- No side effects outside `useEffect` (or equivalent React 19 pattern)
- Return early to avoid deeply nested conditionals

### Types
- Prefer `interface` for component props and API shapes
- Name DTOs after the domain object: `Product`, `CartItem`, `Order` — not `ProductDTO`
- No `any` — use `unknown` and narrow it, or define the type
- Co-locate types with the module that owns them; shared types go in `src/types/`

### Error Handling
- Handle loading, error, and empty states for every data-fetching component
- Use error boundaries for unexpected runtime errors
- API errors should surface a user-readable message, never a raw stack trace

### Comments
- Don't comment what JSX renders — the component name and prop names should be enough
- Only comment *why*: a browser quirk workaround, a non-obvious business constraint
- Delete commented-out code — git history is the backup

### Tests
- Name tests after behavior: `should show out-of-stock badge when quantity is zero`
- Arrange / Act / Assert, with blank lines between sections
- Test user interactions, not implementation details

---

## Karpathy Guidelines
<!-- https://github.com/forrestchang/andrej-karpathy-skills -->

Behavioral guidelines to reduce common LLM coding mistakes.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
