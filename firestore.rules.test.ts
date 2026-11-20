import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const blueprint = JSON.parse(fs.readFileSync('./firebase-blueprint.json', 'utf8'));
const rulesText = fs.readFileSync('./firestore.rules', 'utf8');

function validateId(id: unknown): id is string {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && /^[a-zA-Z0-9_-]+$/.test(id);
}

test('Blueprint defines expected collections and validation constraints', () => {
  assert.ok(blueprint.entities.UserProfile);
  assert.ok(blueprint.entities.UserPrivateInfo);
  assert.ok(blueprint.entities.ProjectBookmark);
  assert.ok(blueprint.entities.AiLabSession);
  assert.ok(blueprint.firestore['/users/{userId}']);
  assert.ok(blueprint.firestore['/users/{userId}/private/{docId}']);
  assert.ok(blueprint.firestore['/bookmarks/{bookmarkId}']);
  assert.ok(blueprint.firestore['/aiSessions/{sessionId}']);
});

test('Dirty Dozen security invariants hold in drafted firestore.rules', () => {
  assert.match(rulesText, /rules_version\s*=\s*'2'/);
  assert.match(rulesText, /match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;\s*\}/);
  assert.match(rulesText, /request\.auth\.token\.email_verified\s*==\s*true/);
  assert.match(rulesText, /isValidId\(/);
  assert.match(rulesText, /affectedKeys\(\)\.hasOnly\(/);
  assert.match(rulesText, /incoming\(\)\.createdAt\s*==\s*request\.time/);
  assert.match(rulesText, /incoming\(\)\.updatedAt\s*==\s*request\.time/);
  assert.match(rulesText, /existsAfter\(/);
  assert.match(rulesText, /allow list:\s*if isVerifiedUser\(\) && resource\.data\.uid == request\.auth\.uid/);
  assert.equal(validateId('valid_user-123'), true);
  assert.equal(validateId('invalid/id..poison'), false);
});
