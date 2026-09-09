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
- [ ] Refresh the lockfile with the declared npm baseline and review the diff
- [ ] Add modern ESLint flat config
- [ ] Add Prettier
- [ ] Add lint scripts

## Phase 3 - Express/dependency modernization

- [ ] Remove cookie-parser and its middleware registration; no code consumes cookies
- [ ] Upgrade Express 4 -> 5 and resolve incompatibilities in the existing routes and middleware
- [ ] Verify rejected async handlers and malformed JSON still follow the Phase 1 error contract under Express 5
- [ ] Upgrade jsonwebtoken and test session token signing, expiry, and invalid credentials
- [ ] Upgrade cors and verify the configured request behavior
- [ ] Upgrade morgan to address its advisory and on-headers dependency before the later structured-logging replacement
- [ ] Replace/remove docopt while preserving the CLI's supported arguments; handle the audited broken flags in Phase 5
- [ ] Upgrade nodemon and make the dev script entry point explicit instead of relying on package.json main
- [ ] Test and commit each breaking dependency change separately; review the audit delta without blindly using npm audit fix --force

## Phase 4 - Mongoose compatibility and staged migration

### Schema and connection prerequisites

- [ ] Remove mongoose.Promise = global.Promise before the Mongoose 6 upgrade
- [ ] Remove obsolete connection options at the applicable upgrade step, including useNewUrlParser
- [ ] Verify strictQuery behavior against the installed version and set the intended behavior explicitly; test filters with unknown schema paths across upgrades
- [ ] Remove the unused recursive User pre('update') hook
- [ ] Remove the redundant async/next pre('save') timestamp hook and verify timestamps remain correct
- [ ] Decide the UUID String / ObjectId strategy using the current public string IDs and existing data as compatibility constraints
- [ ] Align Post.comments and Comment.postId types with the chosen ID strategy
- [ ] Align relation refs with registered model names while preserving existing collection mappings
- [ ] If the chosen strategy changes stored IDs or collection names, prepare and test the required data conversion before switching schemas
- [ ] Add relation assignment and populate tests for both Post.comments and Comment.postId
- [ ] Upgrade uuid and replace legacy uuid/v4 imports, or remove it if the chosen ID strategy no longer needs it
- [ ] Add database regressions for unique email enforcement, required/enum validation, User timestamps, serialization, and existing records

### Version upgrades

- [ ] Upgrade Mongoose 5 -> 6; resolve version-specific incompatibilities
- [ ] Run API/database/CLI regressions and commit the Mongoose 6 step separately
- [ ] Upgrade Mongoose 6 -> 7; resolve version-specific incompatibilities
- [ ] Run API/database/CLI regressions and commit the Mongoose 7 step separately
- [ ] Upgrade Mongoose 7 -> 8; resolve version-specific incompatibilities
- [ ] Run API/database/CLI regressions and commit the Mongoose 8 step separately
- [ ] Upgrade Mongoose 8 -> 9; resolve version-specific incompatibilities
- [ ] Run API/database/CLI regressions and commit the Mongoose 9 step separately
- [ ] Review the audit delta for the Mongoose and uuid dependency trees

## Phase 5 - API and CLI correctness cleanup

- [x] Replace hardcoded status codes (0/1) with constants from utils/statusCodes.js
- [ ] Add Comment.content to the schema and test that submitted content survives save, create responses, and list responses
- [ ] Apply the existing post/comment serializers to create responses and test consistency with list response shapes
- [ ] Decide HTTP status-code changes using the recorded all-200 logical-failure behavior as the compatibility baseline
- [ ] Apply the agreed status codes and add response-contract tests
- [ ] Correct session error-message typos while preserving indistinguishable credential failures
- [ ] Add JSON 404 handling consistent with the error contract
- [ ] Remove unnecessary await res.send(...)
- [ ] Fix add_user.js --drop to target the actual User model collection; test only against an isolated database
- [ ] Remove the unused --company CLI argument and its help entry
- [ ] Remove the express.static registration pointing to the nonexistent src/public directory
- [ ] Remove dead/commented-out code

## Phase 6 - Configuration/security and authentication

- [ ] Replace config.json with environment variables shared by the server and CLI, including an explicit MongoDB URI
- [ ] Move the hardcoded JWT secret to required environment configuration
- [ ] Validate environment at startup for both server and CLI
- [ ] Add .env.example without real secrets
- [ ] Define how existing SHA1-HMAC credentials and users with empty password hashes will transition to Argon2id
- [ ] Replace SHA1-HMAC and the predictable makeSalt implementation with Argon2id using the agreed credential transition
- [ ] Make API user creation accept and hash passwords through the shared credential logic
- [ ] Resolve the write-only password virtual and non-schema _password storage according to the credential design
- [ ] Verify API-created and CLI-created users can log in, including credential-transition and invalid-password cases
- [ ] Define which routes require JWT authentication and their unauthenticated/expired-token behavior
- [ ] Add JWT verification middleware to the agreed routes; tokens currently have no consumer
- [ ] Add tests for missing, invalid, expired, and valid tokens
- [ ] Define and add input validation for user/session/post/comment bodies, covering the audited missing-field and duplicate-email cases
- [ ] Add Helmet
- [ ] Restrict/configure CORS
- [ ] Verify password hashes, salts, and secrets are excluded from every API response and error path

## Phase 7 - Architecture cleanup

- [ ] Make services independent of Express
- [ ] Make controllers actual HTTP adapters and remove redundant controller/service proxy layers
- [ ] Reorganize database/config modules
- [ ] Move CLI out of src/bin
- [ ] Replace morgan with structured logging and retain secret redaction

## Phase 8 - TypeScript

- [ ] Install TypeScript/tooling
- [ ] Add tsconfig
- [ ] Enable strict mode
- [ ] Convert config
- [ ] Convert utilities
- [ ] Convert database layer
- [ ] Convert models
- [ ] Convert services
- [ ] Convert controllers
- [ ] Convert routes
- [ ] Convert app/server
- [ ] Convert CLI
- [ ] Remove remaining CommonJS
- [ ] Switch package to ESM
- [ ] Remove allowJs
- [ ] Ensure zero type errors

## Phase 9 - Quality/CI

- [ ] Complete integration coverage for every API resource beyond the regressions added with earlier fixes
- [ ] Add GitHub Actions for lint, typecheck, tests with an isolated MongoDB database, and production build
- [ ] Review the final npm audit against the saved 20-vulnerability baseline and account for any remaining findings
- [ ] Run lint
- [ ] Run typecheck
- [ ] Run tests
- [ ] Run production build

## Phase 10 - Documentation

- [ ] Rewrite README
- [ ] Document environment variables
- [ ] Document project structure
- [ ] Document API, including intentional changes from the recorded response baseline
- [ ] Document development workflow
- [ ] Document testing and the isolated database setup
- [ ] Document production start/build

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
  - `GET /api/users`    -> 200 `{"status":1,"data":{"users":[]}}`
  - `GET /api/posts`    -> 200 `{"status":1,"data":{"posts":[]}}`
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

| Package (installed) | Origin | Severity (npm) | npm's fix path |
| --- | --- | --- | --- |
| bson 1.1.1 | via mongoose 5.6.9 | critical | `npm audit fix` |
| jsonwebtoken 8.5.1 | direct dep | high | `--force` → v9 (breaking) |
| jws <3.2.3 | via jsonwebtoken | high | `npm audit fix` |
| async 2.6.2 | via mongoose | high | `--force` → mongoose 9 (breaking) |
| lodash 4.17.15 | via mongoose (async) | high | `npm audit fix` |
| semver 5.7.2 | via jsonwebtoken, mongodb-core, nodemon | high | `npm audit fix` |
| body-parser, qs, path-to-regexp, send | via express 4.17.1 | high | `npm audit fix` / Express 5 |
| cookie <0.7.0 | via cookie-parser 1.4.4 | high | `npm audit fix` / remove cookie-parser |
| morgan 1.9.1 | direct dep | moderate | `--force` → 1.12.0 (outside declared range) |
| on-headers <1.1.0 | via morgan | moderate | `--force` → morgan 1.12.0 |
| mpath <0.8.4, mquery <3.2.3 | via mongoose | moderate | `--force` → mongoose 9 (breaking) |
| uuid 3.3.2 | direct dep | moderate | `--force` → v11+ (breaking) |

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

| Dependency       | Used in                                                            |
| ---------------- | ------------------------------------------------------------------ |
| express          | `src/index.js`, all `src/routes/*`                                  |
| mongoose         | `src/mongoose.js`, `src/models/*`                                   |
| jsonwebtoken     | `src/services/sessions/create.js`                                   |
| uuid (`uuid/v4`) | `src/models/User.js`, `Post.js`, `Comment.js` (default `_id`)       |
| morgan           | `src/index.js` (`logger('dev')`)                                    |
| cors             | `src/index.js` (origin `*`)                                         |
| cookie-parser    | `src/index.js` (`app.use(cookieParser())`)                          |
| docopt           | `src/bin/add_user.js` (CLI only)                                    |
| nodemon (dev)    | `npm run dev` script (`npx nodemon`)                                |

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
