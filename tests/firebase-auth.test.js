import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { firebaseAuth } from '../src/core/firebase-auth.js';
import { store } from '../src/core/state-store.js';

describe('Firebase Authentication Engine Tests', () => {
  beforeEach(async () => {
    await firebaseAuth.signOut();
  });

  test('signUpWithEmail registers new user and synchronizes with state store', async () => {
    const user = await firebaseAuth.signUpWithEmail('test.alex@example.com', 'SecureP@ss123!', 'Alex Rivera');

    assert.ok(user);
    assert.equal(user.email, 'test.alex@example.com');
    assert.equal(user.name, 'Alex Rivera');
    assert.equal(user.plan, 'Free Pro');
    assert.ok(user.token);

    // Verify state store synchronization
    const stateUser = store.getState().user;
    assert.ok(stateUser);
    assert.equal(stateUser.email, 'test.alex@example.com');
  });

  test('signInWithEmail signs in registered user', async () => {
    const user = await firebaseAuth.signInWithEmail('sarah.connor@example.com', 'password123');

    assert.ok(user);
    assert.equal(user.email, 'sarah.connor@example.com');
    assert.equal(user.name, 'sarah.connor');

    const currentUser = firebaseAuth.getCurrentUser();
    assert.ok(currentUser);
    assert.equal(currentUser.email, 'sarah.connor@example.com');
  });

  test('signInWithGoogle completes OAuth flow and persists session', async () => {
    const user = await firebaseAuth.signInWithGoogle();

    assert.ok(user);
    assert.ok(user.email.includes('alex.morgan@gmail.com') || user.email.includes('google'));
    assert.equal(user.provider, 'google.com');
    assert.ok(user.token.startsWith('fb_google_'));
    assert.equal(store.getState().user?.email, user.email);
  });

  test('sendPasswordReset dispatches password reset instructions', async () => {
    const result = await firebaseAuth.sendPasswordReset('user.reset@example.com');
    assert.equal(result, true);
  });

  test('signOut clears user session and notifies state store', async () => {
    await firebaseAuth.signInWithEmail('active@example.com', 'password');
    assert.ok(store.getState().user);

    await firebaseAuth.signOut();
    assert.equal(store.getState().user, null);
    assert.equal(firebaseAuth.getCurrentUser(), null);
  });

  test('onAuthStateChanged triggers callbacks on state transitions', async () => {
    let notifiedUser = null;
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      notifiedUser = user;
    });

    await firebaseAuth.signInWithEmail('listener@example.com', 'testpass');
    assert.ok(notifiedUser);
    assert.equal(notifiedUser.email, 'listener@example.com');

    await firebaseAuth.signOut();
    assert.equal(notifiedUser, null);

    unsubscribe();
  });
});
