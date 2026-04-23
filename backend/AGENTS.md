# kasir-toko — Backend (Codex Instructions)

Spring Boot 4 · Java 21 · Maven · JPA · Spring Security

## Sync Contract

- `CLAUDE.md` and `AGENTS.md` must stay in sync.
- If a user asks to modify either file, apply the same logical change to the other file in the same task.
- No automation/script is used for syncing; synchronization is manual via prompt/process.

## Commands

```bash
./mvnw spring-boot:run          # start dev server (port 8080)
./mvnw test                     # run all tests
./mvnw verify                   # compile + test + package
./mvnw package -DskipTests      # build JAR only
```

## Package Structure

```
com.hazdik.kasirtoko/
├── controller/     # HTTP layer — thin, delegates to service
├── service/        # Business logic
├── repository/     # Spring Data JPA interfaces
├── entity/         # JPA entities (@Entity)
├── dto/            # Request/response objects (no entities over the wire)
├── exception/      # Custom exceptions + global handler
└── config/         # Spring config classes (Security, etc.)
```

## Clean Code — Robert C. Martin

### Naming
- Classes: noun phrases — `ProductService`, `OrderRepository`, `CartItem`
- Methods: verb phrases — `findActiveProducts()`, `calculateTotal()`, `applyDiscount()`
- Booleans: `isAvailable`, `hasStock`, `canCheckout`
- No abbreviations — `quantity` not `qty`, `productId` not `pid`
- Avoid noise words — `ProductData`, `ProductInfo`, `ProductObject` are all just `Product`

### Functions / Methods
- Do one thing — if a method needs a comment to explain *what* it does, split it
- Step-down rule: public methods at the top, implementation details below
- Max ~20 lines; if scrolling is needed, extract
- Avoid flag arguments (`processOrder(boolean sendEmail)`) — make two methods
- Use descriptive names over comments: `calculateDiscountedPrice()` not `// apply discount`

### Classes
- Single Responsibility: one reason to change
- Service classes own business rules only — no HTTP, no persistence logic
- Controllers own routing and request/response mapping only
- Keep constructors clean — use `@RequiredArgsConstructor` (Lombok) for injection

### Error Handling
- Use custom exceptions (`ProductNotFoundException`, `InsufficientStockException`)
- Handle exceptions centrally in a `@RestControllerAdvice` class
- Never return `null` — use `Optional<T>` or throw a domain exception
- Don't swallow exceptions with empty catch blocks

### Comments
- Don't comment what the code does — rename the method/variable instead
- Only comment *why*: a regulatory constraint, a non-obvious business rule, a workaround
- Delete commented-out code — git history is the backup

### Tests
- One assert per test when possible
- Test name describes behavior: `shouldReturnEmptyCartWhenNoItemsAdded()`
- Use Testcontainers (already configured) — no mocking the database
- Arrange / Act / Assert structure, blank line between each section

---

## Karpathy Guidelines
<!-- https://github.com/forrestchang/andrej-karpathy-skills -->

Behavioral guidelines for Codex to reduce common LLM coding mistakes.

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
