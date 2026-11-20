# Firestore Security Architecture Specification

## 1. Data Invariants
1. **Default-Deny Catch-All**: Every path not explicitly matched under `/databases/{database}/documents` is rejected (`allow read, write: if false;`).
2. **Verified Identity Ownership**: Every write requires `request.auth != null` and `request.auth.token.email_verified == true`.
3. **PII Isolation (Split Collection)**: Sensitive email PII is stored only in `/users/{userId}/private/{docId}` and never exposed on `/users/{userId}` or list queries.
4. **Master Gate Relational Sync**: `/users/{userId}/private/{docId}` creation requires the parent `/users/{userId}` document to exist in the database or be created atomically in the same batch (`exists(...) || existsAfter(...)`).
5. **Temporal Integrity & Immutability**: `createdAt` must equal `request.time` on creation and never change (`incoming().createdAt == existing().createdAt`). `updatedAt` must equal `request.time` on creation and update. Owner `uid` cannot be altered on update.
6. **Volumetric Constraints**: Every string has strict `.size()` bounds matching `firebase-blueprint.json`, and all document IDs (`userId`, `docId`, `bookmarkId`, `sessionId`, `projectId`) match `^[a-zA-Z0-9_\-]+$` (`<= 128` chars).
7. **Secure List Enforcement**: List queries on `/bookmarks` and `/aiSessions` strictly require `resource.data.uid == request.auth.uid`; blanket `allow list: if isSignedIn();` is prohibited.

## 2. The "Dirty Dozen" Attack Payloads (All Expected: `PERMISSION_DENIED`)
1. **Unauthenticated Write**: Create `/bookmarks/bm1` with `request.auth == null`.
2. **Unverified Email Spoof**: Create `/bookmarks/bm2` with `request.auth.token.email_verified == false`.
3. **Identity Spoofing on Create**: User `alice` creates `/bookmarks/bm3` with `uid: "bob"`.
4. **Shadow Field Injection**: Create `/bookmarks/bm4` with extra undocumented field `{ isAdmin: true }`.
5. **Client Timestamp Forgery**: Create `/bookmarks/bm5` with `createdAt` set in the past rather than `request.time`.
6. **Immutable Owner Mutation**: User `alice` updates `/bookmarks/bm1` attempting to reassign `uid: "bob"`.
7. **Immutable CreatedAt Mutation**: User `alice` updates `/bookmarks/bm1` modifying `createdAt`.
8. **ID Poisoning**: Attempt `get` or `create` on `/bookmarks/bad$id..with..chars` violating `isValidId()`.
9. **Denial-of-Wallet Payload Overflow**: Create `/aiSessions/s1` with `lastResponse` > 4000 characters.
10. **PII Blanket Scrape**: User `bob` attempts `get` on `/users/alice/private/info`.
11. **Orphaned Private Info Write**: Write `/users/alice/private/info` when `/users/alice` does not exist and is not atomically created.
12. **Unscoped Collection Query**: Authenticated user issues unbounded `list` query on `/users` or `/bookmarks` without matching `uid == request.auth.uid`.
