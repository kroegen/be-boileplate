# Modernization TODO

## Phase 0 - Audit

- [x] Create modernization branch
- [x] Record current Node/npm versions
- [x] Run current application
- [x] Record current API behavior
- [x] Run npm audit and save baseline
- [x] Identify unused dependencies
- [x] Identify obvious runtime bugs
- [x] Document MongoDB assumptions
- [x] Check the audit findings and update the TODO list and the phases accordingly

## Phase 1 - Testability and runtime safety baseline

- [x] Separate Express app creation from server startup
- [x] Allow an explicit MongoDB URI so tests and CLI checks can use an isolated database without touching the shared audit fixtures
- [x] Make MongoDB connection explicit/awaitable and handle connection failures
- [x] Await MongoDB before HTTP listening and before CLI database operations
- [x] Add clean database disconnect for test teardown and CLI success/failure paths
- [x] Add minimal API smoke tests for all seven endpoints using the recorded status codes and response envelopes
- [x] Ensure the isolated test database has the unique User.email index before duplicate-email tests
- [x] Add a test script and commit the behavior baseline separately before applying fixes
- [x] Fix undefined `next` in the user, post, and comment create handlers
- [x] Fix undefined `next` in the user, post, and comment list handlers
- [x] Define a JSON error contract for validation, duplicate-key, malformed-JSON, and database failures
- [x] Add centralized error handling using that contract without exposing stacks
- [x] Add regressions for failed creates and failed list queries, verifying the process survives
- [x] Handle HTTP listen errors, including EADDRINUSE
- [x] Add SIGINT/SIGTERM shutdown that closes the HTTP server and disconnects MongoDB
- [x] Stop logging the full database configuration and JWT secret
- [x] Apply the user serializer to create-user responses to exclude passwordHash and salt; add a response regression test
- [x] Verify unaffected endpoint behavior remains compatible and record intentional corrections in the tests

## Phase 2 - Runtime/tooling

- [x] Declare the already verified Node 24 LTS / npm 11+ baseline in package engines
- [x] Add .nvmrc or .node-version matching the verified runtime
- [x] Refresh the lockfile with the declared npm baseline and review the diff
- [x] Add modern ESLint flat config
- [x] Add Prettier
- [x] Add lint scripts

## Phase 3 - Express/dependency modernization

- [x] Upgrade Express 4 -> 5 and resolve incompatibilities in the existing routes and middleware
- [x] Verify rejected async handlers and malformed JSON still follow the Phase 1 error contract under Express 5
- [x] Upgrade jsonwebtoken and test session token signing, expiry, and invalid credentials
- [x] Upgrade cors and verify the configured request behavior
- [x] Upgrade morgan to address its advisory and on-headers dependency before the later structured-logging replacement
- [x] Replace/remove docopt while preserving the CLI's supported arguments
- [x] Upgrade nodemon to v3.1.14 and make the dev script entry point explicit (src/index.js)
- [x] Test and commit each breaking dependency change separately; review the audit delta without blindly using npm audit fix --force

## Phase 4 - Mongoose compatibility and staged migration

### Schema and connection prerequisites

- [x] Remove mongoose.Promise = global.Promise before the Mongoose 6 upgrade
- [x] Remove obsolete connection options at the applicable upgrade step, including useNewUrlParser
- [x] Verify strictQuery behavior against the installed version and set the intended behavior explicitly; test filters with unknown schema paths across upgrades
- [x] Replace the recursive User pre('update') hook with the non-recursive this._update form, kept as a reference example for the future update service
- [x] Remove the redundant async/next pre('save') timestamp hook and verify timestamps remain correct
- [x] Decide the UUID String / ObjectId strategy using the current public string IDs and existing data as compatibility constraints
- [x] Align Post.comments and Comment.postId types with the chosen ID strategy
- [x] Align relation refs with registered model names while preserving existing collection mappings
- [x] If the chosen strategy changes stored IDs or collection names, prepare and test the required data conversion before switching schemas (no-op: UUID string _ids and collection names are unchanged; tests/user-database.test.js loads existing UUID records without conversion)
- [x] Add relation assignment and populate tests for both Post.comments and Comment.postId (tests/relations.test.js)
- [x] Upgrade uuid and replace legacy uuid/v4 imports, or remove it if the chosen ID strategy no longer needs it
- [x] Add database regressions for unique email enforcement, required/enum validation, User timestamps, serialization, and existing records (tests/user-database.test.js)

### Version upgrades

- [x] Upgrade Mongoose 5 -> 6; resolve version-specific incompatibilities
- [x] Run API/database/CLI regressions and commit the Mongoose 6 step separately
- [x] Upgrade Mongoose 6 -> 7; resolve version-specific incompatibilities
- [x] Run API/database/CLI regressions and commit the Mongoose 7 step separately
- [x] Upgrade Mongoose 7 -> 8; resolve version-specific incompatibilities
- [x] Run API/database/CLI regressions and commit the Mongoose 8 step separately
- [x] Upgrade Mongoose 8 -> 9; resolve version-specific incompatibilities
- [x] Run API/database/CLI regressions and commit the Mongoose 9 step separately
- [x] Review the audit delta for the Mongoose and uuid dependency trees

## Phase 5 - API and CLI correctness cleanup

- [x] Replace hardcoded status codes (0/1) with constants from utils/statusCodes.js
- [x] Fix ESM compatibility issues (uuid, mongoose.Schema, statusCodes re-exports)
- [x] Add Comment.content to the schema and test that submitted content survives save, create responses, and list responses
- [x] Apply the existing post/comment serializers to create responses and test consistency with list response shapes
- [x] Add HTTP_CREATED (201) for successful POST operations
- [x] Update create user/post/comment services to return HTTP 201 on success
- [x] Fix session service to return HTTP 401 for invalid credentials
- [x] Update add_user.js --drop to use dropDatabase() for reliable database cleanup
- [x] Remove unused --company CLI argument from add_user.js
- [x] Remove express.static registration from app.js
- [x] Update tests to expect proper HTTP status codes (201 for create success, 400/401 for errors)
- [x] Remove dead/commented-out code
- [x] Restore STATUS_SUCCESS/STATUS_FAILURE in response body (already present, never removed)

## Phase 6 - Configuration/security and authentication

- [x] Replace config.json with environment variables shared by the server and CLI, including an explicit MongoDB URI
- [x] Move the hardcoded JWT secret to required environment configuration
- [x] Validate environment at startup for both server and CLI
- [x] Add .env.example without real secrets
- [x] Confirm this fresh boilerplate has no existing credentials to migrate; reject login for users without a password
- [x] Add argon2 to package.json and the lockfile
- [x] Replace SHA1-HMAC and the predictable makeSalt implementation with Argon2id
- [x] Make API user creation accept and hash optional passwords through the shared credential logic
- [x] Keep the password virtual write-only and hold pending plaintext in Mongoose $locals until save
- [x] Await async password verification in the session service so invalid passwords and empty hashes return 401
- [x] Remove the unused legacy and bulk migration paths; password changes rehash new Argon2id credentials
- [x] Verify API-created and CLI-created users can log in, including invalid-password cases
- [x] Update existing password-check tests to await checkPassword and add session regressions for valid, invalid, and empty-hash credentials
- [x] Define which routes require JWT authentication and their unauthenticated/expired-token behavior
- [x] Add JWT verification middleware to the agreed routes; tokens currently have no consumer
- [x] Add tests for missing, invalid, expired, and valid tokens
- [x] Define and add input validation for user/session/post/comment bodies, covering the audited missing-field and duplicate-email cases
- [ ] Add Helmet and configure CORS; verify security headers and allowed/disallowed origins with API tests
- [ ] Verify password hashes, salts, and secrets are excluded from every API response and error path

## Phase 7 - Architecture cleanup

- [ ] Move HTTP handling into controllers, make services independent of Express, and remove proxy layers; preserve API response contracts in tests
- [ ] Reorganize database/config modules and move the CLI out of src/bin; verify server startup and CLI database operations
- [ ] Replace morgan with structured logging and retain secret redaction

## Phase 8 - TypeScript

- [x] Remove remaining CommonJS from application files
- [x] Switch package to ESM
- [ ] Install TypeScript tooling and add a strict tsconfig that allows JS/TS coexistence during migration
- [ ] Convert config, utilities, and the database layer to TypeScript; pass typecheck and existing regressions
- [ ] Convert models and services to TypeScript; pass typecheck and database/API regressions
- [ ] Convert controllers, routes, and app/server to TypeScript; pass typecheck and API regressions
- [ ] Convert the CLI to TypeScript; pass typecheck and CLI regressions
- [ ] Remove allowJs and remaining application JavaScript, then pass strict typecheck and production build

## Phase 9 - Quality/CI

- [ ] Complete integration coverage for every API resource beyond the regressions added with earlier fixes
- [ ] Add GitHub Actions for npm ci, lint, typecheck, tests with an isolated MongoDB database, and production build; run the same checks locally and make them pass
- [ ] Review the final npm audit against the saved 20-vulnerability baseline and account for any remaining findings

## Phase 10 - Documentation

- [ ] Rewrite README with requirements, installation, environment variables, project structure, API and intentional response changes, development workflow, isolated database testing, CLI usage, and production build/start

## Phase 0 Audit Notes

### Current Node/npm versions (2026-09-04)

- Node: v24.12.0
- npm: 11.6.2

Both already match the target runtime baseline (Node 24 LTS, npm 11+).

### Run current application (2026-09-04)

- Run command: `npm start` (i.e. `node src/index.js`), port 3000.
- MongoDB was already running locally (Homebrew `mongod`, port 27017, db
  `be-boilerplate`); the app connects at startup.
- A prior `npm start` instance (PID 10496) was already serving on port 3000, up
  ~25h, started from the same committed code (only `TODO.md` is modified on
  disk). A fresh `node src/index.js` therefore failed with
  `EADDRINUSE :::3000` — environmental (port held by the live instance), not an
  application defect.
- Startup log observed from a fresh run attempt (before the port error):
  - Prints the full MongoDB config JSON, including `app.secret` — sensitive
    config is logged at startup.
  - Mongoose circular-dependency warnings for `count` / `findOne` / `remove` /
    `updateOne`.
  - Still sets the obsolete `mongoose.Promise = global.Promise`.
- Live endpoint check against the running instance:
  - `GET /api/users` -> 200 `{"status":1,"data":{"users":[]}}`
  - `GET /api/posts` -> 200 `{"status":1,"data":{"posts":[]}}`
  - `GET /api/comments` -> 200 `{"status":1,"data":{"comments":[]}}`
- Result: the current application runs, connects to MongoDB, and serves the API;
  the test database is currently empty.

### Run npm audit and save baseline (2026-09-07)

`npm audit` run against the unmodified lockfile (Node v24.12.0, npm 11.6.2,
express 4.17.1, mongoose 5.6.9, jsonwebtoken 8.5.1). Full unedited output
saved to `.qwen/tmp/npm-audit-baseline.txt`. No fixes applied — this is the
audit starting point; per SPEC, do not run `npm audit fix --force` blindly.

Summary: **20 vulnerabilities (2 critical, 9 high, 4 moderate, 5 low)**.

Vulnerable packages as installed, with their origin:

| Package (installed)                   | Origin                                  | Severity (npm) | npm's fix path                              |
| ------------------------------------- | --------------------------------------- | -------------- | ------------------------------------------- |
| bson 1.1.1                            | via mongoose 5.6.9                      | critical       | `npm audit fix`                             |
| jsonwebtoken 8.5.1                    | direct dep                              | high           | `--force` → v9 (breaking)                   |
| jws <3.2.3                            | via jsonwebtoken                        | high           | `npm audit fix`                             |
| async 2.6.2                           | via mongoose                            | high           | `--force` → mongoose 9 (breaking)           |
| lodash 4.17.15                        | via mongoose (async)                    | high           | `npm audit fix`                             |
| semver 5.7.2                          | via jsonwebtoken, mongodb-core, nodemon | high           | `npm audit fix`                             |
| body-parser, qs, path-to-regexp, send | via express 4.17.1                      | high           | `npm audit fix` / Express 5                 |
| cookie <0.7.0                         | via cookie-parser 1.4.4                 | high           | `npm audit fix` / remove cookie-parser      |
| morgan 1.9.1                          | direct dep                              | moderate       | `--force` → 1.12.0 (outside declared range) |
| on-headers <1.1.0                     | via morgan                              | moderate       | `--force` → morgan 1.12.0                   |
| mpath <0.8.4, mquery <3.2.3           | via mongoose                            | moderate       | `--force` → mongoose 9 (breaking)           |
| uuid 3.3.2                            | direct dep                              | moderate       | `--force` → v11+ (breaking)                 |

How the planned phases clear this baseline (fixes happen as part of the
planned upgrades, each tested and committed separately):

- Mongoose staged upgrade to 9 (Phase 4): async, mpath, mquery, bson,
  lodash, semver (all transitive via mongoose 5).
- Express 4 -> 5 (Phase 3): body-parser, qs, path-to-regexp, send, cookie.
- jsonwebtoken upgrade (Phase 3): jsonwebtoken, jws.
- cookie-parser removal (Phase 3, already identified as unused): clears the
  cookie advisory independently.
- morgan: replace with pino (Phase 7) or bump to 1.12.0.
- uuid: upgrade to 11+ or remove after the ID-strategy cleanup (Phase 5).

### Identify unused dependencies (2026-09-04)

Audited all 8 runtime dependencies + 1 devDependency against actual imports in
`src/` (29 JS files) and the package.json scripts. No dependency is fully
unused — every declared package is imported somewhere:

| Dependency       | Used in                                                       |
| ---------------- | ------------------------------------------------------------- |
| express          | `src/index.js`, all `src/routes/*`                            |
| mongoose         | `src/mongoose.js`, `src/models/*`                             |
| jsonwebtoken     | `src/services/sessions/create.js`                             |
| uuid (`uuid/v4`) | `src/models/User.js`, `Post.js`, `Comment.js` (default `_id`) |
| morgan           | `src/index.js` (`logger('dev')`)                              |
| cors             | `src/index.js` (origin `*`)                                   |
| cookie-parser    | `src/index.js` (`app.use(cookieParser())`)                    |
| docopt           | `src/bin/add_user.js` (CLI only)                              |
| nodemon (dev)    | `npm run dev` script (`npx nodemon`)                          |

Findings:

- **cookie-parser** is the only functionally unused dependency: it is mounted
  as middleware, but no code reads `req.cookies` or `req.signedCookies`
  anywhere in `src/`. Candidate for removal (matches the SPEC).
- **docopt** is used only by the standalone CLI `src/bin/add_user.js`, which is
  invoked directly (shebang), not via any package.json script.
- **nodemon** is used only through the `dev` script; there is no nodemon config
  file, so it works solely because `main` is set in package.json.
- All other dependencies (express, mongoose, jsonwebtoken, uuid, morgan, cors)
  are actively used by the application itself.

No packages were removed or changed.

### Record current API behavior (2026-09-04)

Baseline observed against the unmodified code (Node v24.12.0, Express 4,
Mongoose 5). Probed on throwaway instances started with `PORT=3001..3004
node src/index.js` (probe matrix: `.qwen/tmp/api-audit-probe.sh`; server logs:
`.qwen/tmp/api-audit-{A,B,C,D}.log`), then cross-checked with read-only GETs
against the live instance on port 3000 (PID 10496), which returned identical
status codes and response shapes. No implementation was changed.

General envelope: all successful requests return HTTP 200 with
`{"status":1,"data":{...}}`; logical failures return HTTP 200 with
`{"status":0,...}`. There is no custom error middleware — Express 4 defaults
apply.

- **GET /api/users** → 200 `{"status":1,"data":{"users":[...]}}`; each item is
  the `dumpUser` shape `{id, name, status, role, email, createdAt, updatedAt}`
  (no `passwordHash`/`salt`; `_id` exposed as `id`).
- **POST /api/sessions** — body `{"email","password"}`. Always 200:
  - success: `{"status":1,"data":{"token":"<JWT>"}}` (HS256 signed with
    `app.secret` `"secret"`, `expiresIn: "1h"`);
  - **every** failure (unknown email, wrong password, empty body, missing keys)
    returns the identical body
    `{"status":0,"data":{"errors":[{"param":"password","message":"Invaild password"}],"message":"Invaild param(s)"}}`
    — note the real "Invaild" typo; failures are indistinguishable.
- **POST /api/users** — body `{"name","email"}` (name optional; `password` in
  the body is silently dropped — API-created users get
  `passwordHash:""`/`salt:""` and can never log in).
  - success: 200 `{"status":1,"data":{"user":{...}}}` with the **raw** document
    `{passwordHash, salt, role, status, name, email, _id, createdAt, updatedAt, __v:0}`
    (no dump applied, unlike GET).
  - `{}` (missing email) → **process crash**: `ReferenceError: next is not
defined` at `src/services/users/create.js:11`; no HTTP response (curl:
    HTTP 000 / exit 52).
  - duplicate email → same ReferenceError crash (duplicate-key error reaches
    the same undefined `next(error)`).
  - malformed JSON (`{bad json`) → 400 HTML error page (Express default) with
    a SyntaxError stack; process survives.
- **GET /api/posts** → 200 `{"status":1,"data":{"posts":[...]}}`; each item is
  the `dumpPost` shape `{id, author, content}`.
- **POST /api/posts** — body `{"author","content"}`.
  - success: 200 `{"status":1,"data":{"post":{...}}}` with raw document
    `{comments:[], author, content, _id, __v:0}` (no timestamps).
  - missing `content` is allowed (key simply omitted in the response).
  - `{}` (missing author) → **process crash**: `ReferenceError: next is not
defined` at `src/services/posts/create.js:11`; no HTTP response.
- **GET /api/comments** → 200 `{"status":1,"data":{"comments":[...]}}`; each
  item is the `dumpComment` shape **minus content**: `{id, author}` — the
  Comment schema has no `content` field, so content is silently stripped on
  save and never appears in any response.
- **POST /api/comments** — body `{"author","content"}`.
  - success: 200 `{"status":1,"data":{"comment":{author, _id, __v:0}}}`
    (content dropped, as above).
  - `{}` (missing author) → **process crash**: `ReferenceError: next is not
defined` at `src/services/comments/create.js:11`; no HTTP response.

System-wide error behavior: `createUser`, `createPost` and `createComment`
services are declared `async (req, res)` with **no `next` parameter**, so any
error in their try/catch (validation failure, duplicate key) throws
`ReferenceError: next is not defined` as an uncaught rejection and **kills the
whole process** on Node 24 — one bad request takes the API down. The session
service does accept `next`, and its only error path is the 200/`status:0` body
above.

Audit side effects in the shared dev DB (`be-boilerplate`): seeded login user
`audit-baseline@example.com` (via `add_user.js`, password works), plus one
`audit-new-user@example.com` user, two "Audit Poster" posts and one
"Audit Commenter" comment created by the probes. Left in place — they are
harmless dev fixtures and the baseline evidence. No code, dependency, or
response format was changed.

### Identify obvious runtime bugs (2026-09-07)

Read-only review of all 29 `src/` files. Findings are recorded for later
phases (Phase 5+); no code was changed. Items marked ✅ were also observed
live in the "Record current API behavior" / "Run current application" notes.

**A. Process-killing handlers (`next is not defined`)**

All six of these handlers are declared `async (req, res)` with no `next`
parameter, but their `catch` blocks call `next(error)`. On Node 24 the
resulting `ReferenceError` is an uncaught rejection and **kills the whole
process** — one bad request takes the API down.

- `src/services/users/create.js:11` — any create failure (missing email,
  duplicate email) ✅
- `src/services/posts/create.js:11` — same ✅
- `src/services/comments/create.js:11` — same ✅
- `src/services/users/list.js:10` — any `User.find()` failure (e.g. DB down
  mid-request)
- `src/services/posts/list.js:10` — same
- `src/services/comments/list.js:10` — same

`src/services/sessions/create.js` is the only handler that declares `next`, so
it cannot crash this way.

**B. Silent data loss / sensitive data leaks**

- `src/models/Comment.js` has **no `content` field** — POST bodies' `content`
  is stripped on save; `dumpComment` (`src/utils/dump.js`) reads
  `comment.content`, which is always `undefined`. Comments are effectively
  contentless. ✅
- `src/services/users/create.js` ignores `password` in the request body —
  API-created users get `passwordHash:""`/`salt:""` and can never log in. ✅
- `createUser`/`createPost`/`createComment` send the **raw document**
  (no `dump*` applied): the user create response leaks `passwordHash` and
  `salt`. ✅

**C. ID-strategy / ref inconsistencies**

- Post `_id` and Comment `_id` are UUID **Strings** (`uuid/v4` default), but
  `Post.comments: [{ type: ObjectId, ref: 'Comment' }]`
  (`src/models/Post.js:6`) and `Comment.postId: ObjectId, ref: 'Post'`
  (`src/models/Comment.js:5`) expect **ObjectIds**. Populating/assigning these
  paths with real IDs throws CastError — both relations are unusable as
  defined.
- `src/bin/add_user.js --drop` drops collection `users`, but the model is
  named `UserModel` (`src/models/User.js:5`) → Mongoose actually uses
  `usermodels`. The flag silently does nothing to real data.
- `--company` is parsed by `add_user.js` but never used.

**D. Bootstrap / server lifecycle**

- `src/mongoose.js` `setUpConnection()` neither returns nor handles the
  `mongoose.connect()` promise, and no `'error'` listener is registered — a
  dead/unreachable Mongo at startup is an unhandled rejection (process exit),
  with no retry.
- `src/mongoose.js` sets `mongoose.Promise = global.Promise` — deprecated in
  Mongoose 5, **removed in Mongoose 6** (future upgrade crash); also passes
  obsolete `useNewUrlParser`.
- `src/index.js`: `server.listen(port)` has no `'error'` handler (EADDRINUSE
  crashes the process — observed ✅); no graceful shutdown /
  `mongoose.disconnect()` on SIGINT/SIGTERM; no 404 handler; no central error
  middleware (Express 4 default HTML error pages with stacks, ✅).
- `src/index.js` mounts `express.static()` on `src/public`, which does not
  exist in the repo.
- `src/mongoose.js` logs the full config JSON at startup — including
  `app.secret`, the hardcoded JWT signing secret (`src/bin/config.json`).
- `cookie-parser` is mounted but never used (see unused-deps notes).

**E. Model / hook landmines**

- `src/models/User.js` `pre('update')` hook calls `this.update(...)` inside
  itself — infinite recursion if it ever runs; dead code (nothing calls
  `doc.update()`).
- `UserSchema.pre('save')` is `async` **and** calls `next()`, and is redundant
  with `timestamps: true`.
- `User` `password` is a virtual with a setter but **no getter**: after
  `user.password = ...`, `user.password` reads `undefined`; the setter stashes
  into non-schema path `_password` (never persisted).
- `makeSalt()` = `Math.round(Date.now() * Math.random())` — weak, predictable
  salt; passwords use SHA1-HMAC (Phase 6 replacement target).
- JWT is issued by `sessions/create.js` but **no middleware anywhere verifies
  it** — the token is inert as shipped.
- `sessions/create.js` error message typo: "Invaild password" /
  "Invaild param(s)" (✅ recorded in baseline).

These map onto existing later checkboxes (e.g. Phase 5 "Fix createUser
undefined `next` bug", "Resolve UUID/ObjectId inconsistency"; Phase 6 "Stop
logging database configuration"; Phase 7 "Add graceful shutdown") — this
section is the consolidated evidence, not a new task list.

### Document MongoDB assumptions (2026-09-07)

Read-only review of `src/mongoose.js`, `src/bin/config.json`,
`src/models/{User,Post,Comment}.js` and their call sites. These are the
MongoDB-related assumptions the code silently relies on; each is a risk for
the Phase 4 Mongoose upgrade, Phase 5 ID-strategy cleanup, and Phase 1 test
isolation. No code was changed.

**Connection (`src/mongoose.js`, `src/bin/config.json`)**

- Connection URI is hardcoded and built at runtime as
  `mongodb://localhost:27017/be-boilerplate` from `config.json` — assumes a
  **local, unauthenticated, non-TLS, standalone** `mongod` (no replica set,
  no credentials, no pool/timeout/`authSource` options). Port is a string in
  the JSON but interpolates fine.
- `setUpConnection()` is fire-and-forget: it neither returns the
  `mongoose.connect()` promise nor registers a `'error'` listener, and both
  call sites (`src/index.js:18`, `src/bin/add_user.js:6`) invoke it without
  awaiting. Assumption: Mongo is already up, and the connect promise settles
  before the first DB access. An unreachable Mongo at startup is an unhandled
  rejection (process exit) — see "Identify obvious runtime bugs" §D.
- `src/index.js` starts listening **without** waiting for the connection, so
  early requests assume connect has completed (Mongoose 5 buffers
  operations; a failed connect still takes the process down, see above).
- Mongoose 5-specific APIs assumed: `mongoose.Promise = global.Promise`
  (removed in Mongoose 6 — crash on upgrade) and `useNewUrlParser: true`
  (obsolete; no-op from Mongoose 6, removed as an option in 7).
- No `strictQuery` set anywhere: queries rely on the **Mongoose 5 default
  `strictQuery: true`**. Mongoose 6 changed the default to `false`, so
  upgrade behavior on filters with non-schema paths will differ unless set
  explicitly (Phase 4).
- No disconnect anywhere in `src/` — assumes process lifetime == connection
  lifetime (no graceful shutdown; Phase 7).

**Schema / ID assumptions (`src/models/*.js`)**

- All three models default `_id` to a **UUID v4 String** (`uuid/v4`) — the
  app assumes string IDs are the public identity (`dump*` exposes `_id` as
  `id`).
- The two relations contradict that assumption: `Post.comments`
  (`[{ type: ObjectId, ref: 'Comment' }]`) and `Comment.postId`
  (`{ type: ObjectId, ref: 'Post' }`) are **ObjectId** paths. Assigning the
  real UUID string `_id`s to them would throw CastError.
- The `ref` values (`'Comment'`, `'Post'`) don't match the registered model
  names (`CommentModel`, `PostModel`), so even ObjectId IDs would fail ref
  resolution. Nothing in `src/` ever calls `.populate()` (verified by
  search), so both relations are dormant — the only live assumption is that
  they are never exercised.
- Model names `UserModel`/`PostModel`/`CommentModel` → collections
  `usermodels`/`postmodels`/`commentmodels` (Mongoose pluralizes the model
  name, not a fixed convention). `add_user.js --drop` targets `users` and
  silently no-ops (already recorded in bug notes §C).
- `User` is the only model with `timestamps: true` (plus a redundant
  `updatedAt` pre-save hook) and `minimize: false`; `Post` and `Comment`
  have no timestamps and default `minimize: true`.
- The only index in the app is the **unique index on `User.email`** —
  duplicate-email handling (and the observed process crash on duplicate key)
  assumes that index exists server-side; nothing else is indexed.
- Validation assumes only Mongoose `required`/`enum` constraints; no
  `match`, length limits, or trimming. `Comment` has **no `content`
  path** — the schema assumes comments are contentless (bug notes §B).
- `__v` version keys are on (default) and appear in raw responses.
- No schema-level assumption of existing data: collections are created
  lazily by Mongoose; no migrations, no seed script, no schema versioning.
  The dev DB was empty at baseline; it now contains the harmless audit
  fixtures recorded under "Record current API behavior".

**Operational assumptions**

- Development assumes a locally managed Mongo (Homebrew `mongod`, port
  27017, db `be-boilerplate` auto-created on first connect). Phase 1 tests
  must not inherit this assumption (SPEC: isolated test database strategy).
- The `add_user.js` CLI opens its **own** connection to the same hardcoded
  URI (second `setUpConnection()` call site), assuming the same local server.
- Password hashes/salts are stored as plain schema fields (no encryption at
  rest) — assumed acceptable for a boilerplate; Phase 6 replaces the hashing.

Maps onto existing later checkboxes: Phase 1 "Make MongoDB connection
explicit/awaitable", Phase 4 "Remove obsolete connection options" / "Audit
populate/ref behavior", Phase 5 "Resolve UUID/ObjectId inconsistency".

### Decide the UUID String / ObjectId strategy (2026-09-11)

**Decision: keep UUID v4 String `_id` as the single ID strategy for all
models.** No schema type changes, no data conversion, and the `uuid`
dependency stays (it remains the ID generator).

Compatibility constraints that drove the decision:

- **Public string IDs.** Every API response already exposes the schema `_id`
  as a string: list endpoints via `dump*` (`id: doc._id` in
  `src/utils/dump.js`) and create endpoints via the raw document `_id`.
  Client-facing IDs are UUID v4 strings; switching to ObjectId would change
  the `id` format for new records and invalidate previously issued IDs.
- **Existing data.** All records in the dev DB (audit fixtures: 2 users,
  2 posts, 1 comment — see "Record current API behavior") were created by
  this app, whose `_id` default is `uuidv4` on all three models, so every
  stored `_id` is a UUID v4 string by construction. An ObjectId schema would
  throw CastError reading those documents and force a data conversion.
  Keeping String avoids that. (Dev DB was offline when this was decided —
  `mongod` not running — but the fixture `_id` shape follows from the
  schema default, and the audit record documents the fixtures.)
- **SPEC default exception.** SPEC prefers ObjectId "unless there is a
  concrete requirement for UUID identifiers"; the two constraints above are
  that requirement, consistent with SPEC principle 1 (preserve behavior
  before improving it).

State of the schema at the time of the decision (HEAD):

- `User`, `Post`, and `Comment` all already use
  `{ type: String, default: uuidv4 }` for `_id`.
- The previously inconsistent relation paths (`Post.comments`,
  `Comment.postId`) were already changed from `ObjectId` to `String` in
  799af15 (ESM compatibility commit), so the schema is now uniformly
  String-based and matches this decision — no type change required.
- No other `ObjectId` assumptions remain in `src/` (the only match is a
  generic comment in `src/utils/errors.js`).

Impact on follow-up Phase 4 items:

- "Align Post.comments and Comment.postId types with the chosen ID strategy"
  → already aligned (both String); verify-only when reached.
- "If the chosen strategy changes stored IDs or collection names, prepare
  and test the required data conversion..." → not applicable: stored IDs
  and collection names are unchanged.
- "Upgrade uuid ... or remove it" (done) → `uuid` stays in use.
- Relation `ref`s (`'Comment'`/`'Post'` vs registered model names
  `CommentModel`/`PostModel`) are still misaligned; that is handled by the
  separate "Align relation refs" item, not by this decision.

### Align Post.comments and Comment.postId types (2026-09-11)

Verified already aligned with the chosen UUID v4 String `_id` strategy;
no code change needed:

- `src/models/Post.js` — `comments: [{ type: String, ref: 'Comment' }]`.
- `src/models/Comment.js` — `postId: { type: String, ref: 'Post' }`.
- Both paths became `String` in 799af15 (ESM compatibility commit), so
  they match the `_id` type on every model.
- No other `ObjectId` usage remains in `src/` (single grep hit is a
  generic comment in `src/utils/errors.js`); no `ObjectId` assumptions
  in `tests/` either.
- Test suite run as verification is blocked by the dev DB being offline
  (`ECONNREFUSED 127.0.0.1:27017`, pre-existing environment state) and
  the smoke tests expect empty collections, so they are not a valid
  check for this no-code-change verification.
- `ref` strings are still `'Comment'`/`'Post'` (vs registered
  `CommentModel`/`PostModel`); that remains the separate "Align relation
  refs" item.

### Align relation refs with registered model names (2026-09-11)

Aligned the `ref` strings to the registered model names; collection
mappings are preserved:

- `src/models/Post.js` — `comments` ref: `'Comment'` → `'CommentModel'`.
- `src/models/Comment.js` — `postId` ref: `'Post'` → `'PostModel'`.
- Registered model names were left unchanged (`PostModel`/`CommentModel`/
  `UserModel`), so derived collection names (`postmodels`,
  `commentmodels`, `usermodels`) — and the existing data in them — are
  untouched. Renaming the registered models instead would have changed
  collection names and was rejected for that reason.
- With the old refs, any `populate('comments')`/`populate('postId')` call
  would throw a ref-lookup error; no `populate` calls exist in `src/` or
  `tests/` yet, so this change is inert until the "Add relation assignment
  and populate tests" item lands, which will exercise it.
- No `ObjectId`/schema type changes; refs stay `String`-typed per the
  decided ID strategy.
- Verification: `npm run lint` passes; API test suite remains blocked by
  the dev DB being offline (pre-existing environment state).
- Unrelated pre-existing inconsistency noticed (not touched):
  `src/bin/add_user.js` drops `collections.users`, which does not match
  the `UserModel` collection.
