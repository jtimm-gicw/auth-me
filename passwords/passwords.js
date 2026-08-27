'use strict';

/*
node passwords/password.js
========================================================
CLASS 6 - PASSWORDS DEMO
========================================================

This demo shows two very different ideas:

1. BASE64 ENCODING
2. BCRYPT PASSWORD HASHING

IMPORTANT:
Base64 is NOT encryption.

Base64 is simply a way of representing data in a
different format.

Bcrypt is used to create a one-way password hash.

--------------------------------------------------------
POINTER -->
Next: demo/basic/server.js

We will use what we learned here to build a very
simple authentication server.
========================================================
*/

const bcrypt = require('bcrypt');

// ======================================================
// PART 1: BASE64 ENCODING
// ======================================================

console.log('\n========================================');
console.log('PART 1: BASE64 ENCODING');
console.log('========================================\n');

const password = 'secret123';

console.log('Original password:');
console.log(password);

const encodedPassword = Buffer
  .from(password)
  .toString('base64');

console.log('\nBase64 encoded password:');
console.log(encodedPassword);

// ------------------------------------------------------
// Base64 can be decoded.
// ------------------------------------------------------

const decodedPassword = Buffer
  .from(encodedPassword, 'base64')
  .toString();

console.log('\nDecoded password:');
console.log(decodedPassword);

// ------------------------------------------------------
// IMPORTANT:
// Encoding can be reversed.
//
// Original:
// secret123
//
// Encoded:
// c2VjcmV0MTIz
//
// Decoded:
// secret123
//
// This is why Base64 should NOT be used to protect
// passwords.
// ======================================================


// ======================================================
// PART 2: BCRYPT PASSWORD HASHING
// ======================================================

console.log('\n========================================');
console.log('PART 2: BCRYPT PASSWORD HASHING');
console.log('========================================\n');

async function passwordDemo() {

  const password = 'secret123';

  console.log('Original password:');
  console.log(password);

  // ----------------------------------------------------
  // Create a bcrypt hash.
  // ----------------------------------------------------

  const hash1 = await bcrypt.hash(password, 10);

  console.log('\nFirst bcrypt hash:');
  console.log(hash1);

  // ----------------------------------------------------
  // Hash the SAME password again.
  // ----------------------------------------------------

  const hash2 = await bcrypt.hash(password, 10);

  console.log('\nSecond bcrypt hash:');
  console.log(hash2);

  // ----------------------------------------------------
  // Notice:
  //
  // hash1 !== hash2
  //
  // Even though the password was exactly the same,
  // bcrypt created a different hash.
  // ----------------------------------------------------

  console.log('\nAre the hashes the same?');
  console.log(hash1 === hash2);

  // ====================================================
  // PART 3: VERIFY A PASSWORD
  // ====================================================

  console.log('\n========================================');
  console.log('PART 3: VERIFYING A PASSWORD');
  console.log('========================================\n');

  const correctPassword = await bcrypt.compare(
    'secret123',
    hash1
  );

  console.log('Correct password:');
  console.log(correctPassword);

  // ----------------------------------------------------
  // Try the wrong password.
  // ----------------------------------------------------

  const wrongPassword = await bcrypt.compare(
    'wrongpassword',
    hash1
  );

  console.log('\nWrong password:');
  console.log(wrongPassword);

  // ----------------------------------------------------
  // IMPORTANT:
  //
  // We do NOT decode the bcrypt hash.
  //
  // Instead, bcrypt compares:
  //
  // password + hash
  //
  // and tells us whether they match.
  // ====================================================
}

passwordDemo();