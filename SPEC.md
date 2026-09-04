# be-boileplate Modernization Specification

## Goal

Modernize the existing Node.js/Express/MongoDB backend into a clean,
maintainable TypeScript backend boilerplate.

The migration must be incremental.

Do NOT combine dependency upgrades, architecture rewrites, security changes,
API redesign, and TypeScript conversion into one large change.

The application should remain runnable after every migration phase.

---

## Current architecture

Runtime:
- Node.js
- CommonJS
- Express 4
- Mongoose 5
- MongoDB

Current layers:

src/
  bin/
  controllers/
  models/
  routes/
  services/
  utils/
  index.js
  mongoose.js

Current API:

POST /api/sessions

GET  /api/users
POST /api/users

GET  /api/posts
POST /api/posts

GET  /api/comments
POST /api/comments

Preserve these routes during the modernization unless a later explicitly
approved API-cleanup phase changes them.

---

## Target runtime/tooling

Target baseline:

- Node.js 24 LTS
- npm 11+
- Express 5
- Mongoose 9
- TypeScript
- modern ESM
- ESLint 10 flat config
- typescript-eslint
- Prettier
- Vitest
- Supertest
- tsx for development

Use current stable compatible package versions when executing the migration.
Do not blindly use npm audit fix --force.

---

## Migration principles

1. Preserve behavior before improving behavior.
2. Establish tests before risky refactors.
3. Upgrade breaking dependency majors separately.
4. Run tests after every major dependency migration.
5. Do not hide TypeScript errors with `any` or `@ts-ignore`.
6. Do not disable lint rules just to make migration succeed.
7. Do not change persistent database structures without documenting migration impact.
8. Keep commits small and independently runnable.
9. Do not read the entire repository for every task. Inspect only files relevant
   to the current TODO item.
10. Update TODO.md after completing each task.

---

## Target architecture

Preferred eventual structure:

src/
  app.ts
  server.ts

  config/
    env.ts

  db/
    mongoose.ts

  middleware/
    error-handler.ts
    not-found.ts
    validation.ts

  models/
    user.ts
    post.ts
    comment.ts

  routes/
    sessions.ts
    users.ts
    posts.ts
    comments.ts
    index.ts

  controllers/
    sessions.ts
    users.ts
    posts.ts
    comments.ts

  services/
    sessions/
    users/
    posts/
    comments/

  schemas/
    sessions.ts
    users.ts
    posts.ts
    comments.ts

  utils/

  cli/
    add-user.ts

tests/

Do not restructure everything at once.

---

## Application/bootstrap separation

The Express application must eventually be separated from process startup.

app.ts:
- construct Express application
- configure middleware
- configure routes
- configure error handling
- export app

server.ts:
- load validated environment
- connect database
- start HTTP server
- handle shutdown signals
- close MongoDB connection gracefully

This makes integration testing possible without opening a real HTTP port.

---

## Configuration

Remove runtime dependency on:

src/bin/config.json

Use environment variables instead.

Provide:

.env.example

Validate configuration during startup.

Required configuration should include at least:

PORT
MONGODB_URI
JWT_SECRET
CORS_ORIGIN
NODE_ENV

Never log secrets or complete configuration objects.

---

## Database

Modernize Mongoose incrementally.

Current Mongoose is 5.x.

Upgrade major versions separately:

5 -> 6
6 -> 7
7 -> 8
8 -> 9

At each major:
- read migration notes
- update incompatible APIs
- run tests
- verify connection lifecycle
- commit separately

Remove obsolete options such as useNewUrlParser when no longer required.

Do not change ID strategy during dependency migration.

Later audit the current inconsistent ID design:
- some models use UUID string _id
- some relationships use Mongo ObjectId

Choose one consistent strategy.

Preferred default for a new MongoDB boilerplate is Mongo ObjectId unless there
is a concrete requirement for UUID identifiers.

---

## Authentication/security

Replace the current SHA1/HMAC password implementation.

Target:
- Argon2id password hashing using a maintained library
- secure password verification
- never expose password hashes or salts
- JWT secret from environment
- sensible JWT expiry
- validate authentication input

If existing production users must remain compatible, create an explicit
password migration strategy rather than silently invalidating existing hashes.

Add:

- helmet
- configurable CORS
- request validation
- centralized error handling

Do not return stack traces in production.

---

## API validation

Introduce schema validation, preferably Zod.

Validate:
- params
- query
- body
- environment configuration

HTTP/controller code should not pass unchecked req.body directly into models.

---

## Error handling

Add:
- 404 middleware
- centralized Express error middleware
- typed application errors
- correct HTTP status codes

During initial modernization, preserve old response bodies where necessary.

API response redesign should happen as a separate breaking-change phase.

---

## Controllers/services

Current controllers mostly proxy directly into services.

Refactor so responsibilities become explicit:

Controllers:
- Express request/response handling
- validation results
- status codes

Services:
- business logic
- database operations
- no Express Request/Response objects

Avoid layers that only re-export another function.

---

## Logging

Replace ad-hoc console logging / development-only logging with structured logging.

Preferred:
- pino
- pino-http

Never log passwords, JWT secrets or database credentials.

---

## CLI

Replace docopt-based add_user.js.

Prefer Node's built-in argument parsing.

Target:

npm run user:create -- --email=... --password=...

Move CLI implementation to:

src/cli/add-user.ts

Remove docopt if no longer used.

---

## Dependencies

Audit every dependency.

Likely actions:

cookie-parser:
- remove if cookies are not actually used

cors:
- retain but configure through environment

docopt:
- remove

jsonwebtoken:
- upgrade

mongoose:
- staged upgrade to 9

morgan:
- replace with structured logging if pino is introduced

uuid:
- upgrade temporarily or remove after ID strategy cleanup

nodemon:
- replace with tsx watch after TypeScript migration

Remove unused packages rather than upgrading them for ceremonial reasons.

---

## Testing

Introduce:

Vitest
Supertest

Minimum integration coverage:

GET /api/users
POST /api/users

GET /api/posts
POST /api/posts

GET /api/comments
POST /api/comments

POST /api/sessions

Add service/unit tests where useful.

Tests must not depend on a developer's personal MongoDB instance.

Use an isolated test database strategy.

---

## TypeScript migration

Do this only after runtime dependencies and architecture are stable.

Migration should be incremental.

Recommended order:

1. configuration
2. utilities
3. database layer
4. models
5. services
6. controllers
7. routes
8. app/server
9. CLI

Initially allow JS + TS coexistence if necessary.

Final state:

- no application .js files
- strict TypeScript enabled
- no implicit any
- no unnecessary explicit any
- typecheck passes
- build passes

Prefer Mongoose's native TypeScript inference where practical.

---

## Scripts

Final package scripts should approximately provide:

dev
build
start
test
test:watch
lint
lint:fix
typecheck

Example intent:

dev      -> tsx watch src/server.ts
build    -> tsc
start    -> node dist/server.js
test     -> vitest run
lint     -> eslint .
typecheck -> tsc --noEmit

---

## CI

Add GitHub Actions that runs:

npm ci
npm run lint
npm run typecheck
npm test
npm run build

Use Node 24 LTS.

---

## Documentation

Rewrite README.md.

Include:

- purpose
- requirements
- installation
- environment configuration
- local MongoDB setup
- development commands
- build/start commands
- tests
- CLI user creation
- API endpoints
- project structure
