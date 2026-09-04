# Modernization TODO

## Phase 0 - Audit

- [ ] Create modernization branch
- [ ] Record current Node/npm versions
- [ ] Run current application
- [ ] Record current API behavior
- [ ] Run npm audit and save baseline
- [ ] Identify unused dependencies
- [ ] Identify obvious runtime bugs
- [ ] Document MongoDB assumptions
- [ ] Do not make architectural changes yet

## Phase 1 - Testability baseline

- [ ] Separate Express app creation from server startup
- [ ] Make MongoDB connection explicit/awaitable
- [ ] Add clean database disconnect
- [ ] Add minimal API smoke tests
- [ ] Verify all existing endpoints still behave the same
- [ ] Commit baseline separately

## Phase 2 - Runtime/tooling

- [ ] Set Node 24 LTS in engines
- [ ] Add .nvmrc or .node-version
- [ ] Update npm lockfile
- [ ] Add modern ESLint flat config
- [ ] Add Prettier
- [ ] Add lint scripts
- [ ] Add test scripts

## Phase 3 - Express/dependency modernization

- [ ] Upgrade Express 4 -> 5
- [ ] Fix Express 5 incompatibilities
- [ ] Upgrade jsonwebtoken
- [ ] Upgrade cors
- [ ] Upgrade cookie-parser or remove it
- [ ] Upgrade/remove uuid
- [ ] Remove unused dependencies
- [ ] Replace/remove docopt
- [ ] Upgrade development dependencies
- [ ] Run full tests after each breaking dependency change

## Phase 4 - Mongoose migration

- [ ] Mongoose 5 -> 6
- [ ] Test and commit
- [ ] Mongoose 6 -> 7
- [ ] Test and commit
- [ ] Mongoose 7 -> 8
- [ ] Test and commit
- [ ] Mongoose 8 -> 9
- [ ] Test and commit
- [ ] Remove obsolete connection options
- [ ] Audit model middleware/hooks
- [ ] Audit populate/ref behavior

## Phase 5 - Correctness cleanup

- [ ] Fix createUser undefined `next` bug
- [ ] Audit all async handlers for equivalent bugs
- [ ] Audit response status codes
- [ ] Add centralized error handling
- [ ] Add 404 handling
- [ ] Remove unnecessary await res.send(...)
- [ ] Audit model names and refs
- [ ] Resolve UUID/ObjectId inconsistency
- [ ] Remove dead/commented-out code

## Phase 6 - Configuration/security

- [ ] Replace config.json with environment variables
- [ ] Add .env.example
- [ ] Validate environment at startup
- [ ] Stop logging database configuration
- [ ] Move JWT secret to environment
- [ ] Replace SHA1 password hashing with Argon2id
- [ ] Add input validation
- [ ] Add Helmet
- [ ] Restrict/configure CORS
- [ ] Ensure sensitive fields never appear in API responses

## Phase 7 - Architecture cleanup

- [ ] Make controllers actual HTTP adapters
- [ ] Make services independent of Express
- [ ] Remove redundant controller/service proxy layers
- [ ] Reorganize database/config modules
- [ ] Move CLI out of src/bin
- [ ] Add structured logging
- [ ] Add graceful shutdown

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

- [ ] Add integration tests for every API resource
- [ ] Add authentication tests
- [ ] Add error-path tests
- [ ] Add GitHub Actions
- [ ] npm audit final review
- [ ] Run lint
- [ ] Run typecheck
- [ ] Run tests
- [ ] Run production build

## Phase 10 - Documentation

- [ ] Rewrite README
- [ ] Document environment variables
- [ ] Document project structure
- [ ] Document API
- [ ] Document development workflow
- [ ] Document testing
- [ ] Document production start/build
