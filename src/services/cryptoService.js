import sodium from "libsodium-wrappers-sumo";

/**
 * @module cryptoService
 * @description Single entrypoint for all client-side E2EE crypto.
 *
 * Stack:
 *   - Curve25519 + XSalsa20-Poly1305 via crypto_box_easy (message encryption)
 *   - XSalsa20-Poly1305 via crypto_secretbox_easy (private-key envelope)
 *   - Argon2id via crypto_pwhash, MODERATE limits (KEK derivation)
 *
 * The server never sees plaintext message content, the user's password,
 * the password-derived KEK, or the unwrapped private key. All values
 * crossing the network boundary are base64 strings.
 */

let readyPromise = null;

/**
 * Initialize libsodium. Idempotent — subsequent calls return the same
 * promise. Must be awaited before any other function in this module.
 *
 * @returns {Promise<void>}
 */
export function ready() {
  if (!readyPromise) {
    readyPromise = sodium.ready;
  }
  return readyPromise;
}

const b64 = {
  encode: (bytes) =>
    sodium.to_base64(bytes, sodium.base64_variants.ORIGINAL),
  decode: (str) =>
    sodium.from_base64(str, sodium.base64_variants.ORIGINAL),
};

/**
 * Generate a fresh Curve25519 keypair for E2EE messages.
 *
 * @returns {{ publicKey: string, privateKey: string }} base64 strings
 */
export function generateKeypair() {
  const kp = sodium.crypto_box_keypair();
  return {
    publicKey: b64.encode(kp.publicKey),
    privateKey: b64.encode(kp.privateKey),
  };
}

/**
 * Generate a 16-byte salt for KEK derivation.
 *
 * @returns {string} base64
 */
export function randomSaltB64() {
  return b64.encode(sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES));
}

/**
 * Generate a 24-byte nonce for crypto_secretbox or crypto_box.
 *
 * @returns {string} base64
 */
export function randomNonce24B64() {
  return b64.encode(
    sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
  );
}

/**
 * Derive a 32-byte symmetric KEK from the user's password and salt
 * using Argon2id at MODERATE cost. Used to wrap/unwrap the private key.
 *
 * @param {string} password
 * @param {string} saltB64 - base64-encoded 16-byte salt
 * @returns {Uint8Array} 32-byte KEK
 */
export function deriveKEK(password, saltB64) {
  const salt = b64.decode(saltB64);
  if (salt.length !== sodium.crypto_pwhash_SALTBYTES) {
    throw new Error(
      `Invalid salt length: expected ${sodium.crypto_pwhash_SALTBYTES}, got ${salt.length}`
    );
  }
  return sodium.crypto_pwhash(
    sodium.crypto_secretbox_KEYBYTES,
    password,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_MODERATE,
    sodium.crypto_pwhash_MEMLIMIT_MODERATE,
    sodium.crypto_pwhash_ALG_ARGON2ID13
  );
}

/**
 * Encrypt the user's private key with their password-derived KEK.
 *
 * @param {string} privateKeyB64 - the Curve25519 private key, base64
 * @param {Uint8Array} kek - 32-byte symmetric key
 * @param {string} nonceB64 - 24-byte nonce, base64 (must be unique per privKey)
 * @returns {string} ciphertext, base64
 */
export function wrapPrivateKey(privateKeyB64, kek, nonceB64) {
  const privateKey = b64.decode(privateKeyB64);
  const nonce = b64.decode(nonceB64);
  const ciphertext = sodium.crypto_secretbox_easy(privateKey, nonce, kek);
  return b64.encode(ciphertext);
}

/**
 * Decrypt the user's private key envelope.
 *
 * @param {string} ciphertextB64
 * @param {Uint8Array} kek - 32-byte symmetric key
 * @param {string} nonceB64
 * @returns {string} privateKey, base64
 * @throws if the KEK is wrong (wrong password) or the ciphertext is tampered
 */
export function unwrapPrivateKey(ciphertextB64, kek, nonceB64) {
  const ciphertext = b64.decode(ciphertextB64);
  const nonce = b64.decode(nonceB64);
  const privateKey = sodium.crypto_secretbox_open_easy(ciphertext, nonce, kek);
  return b64.encode(privateKey);
}

/**
 * Encrypt a plaintext message for a recipient. Produces two ciphertexts
 * sharing the same nonce: one the recipient can decrypt, one the sender
 * can decrypt to read history from another device.
 *
 * @param {string} plaintext
 * @param {string} recipientPublicKeyB64 - peer's Curve25519 public key
 * @param {string} senderPublicKeyB64    - own Curve25519 public key
 * @param {string} senderPrivateKeyB64   - own Curve25519 private key
 * @returns {{
 *   ciphertextForRecipient: string,
 *   ciphertextForSender: string,
 *   nonce: string,
 *   senderPublicKey: string,
 * }}
 */
export function encryptMessage(
  plaintext,
  recipientPublicKeyB64,
  senderPublicKeyB64,
  senderPrivateKeyB64
) {
  const message = sodium.from_string(plaintext);
  const nonceBytes = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  const recipientPub = b64.decode(recipientPublicKeyB64);
  const senderPub = b64.decode(senderPublicKeyB64);
  const senderPriv = b64.decode(senderPrivateKeyB64);

  const ctForRecipient = sodium.crypto_box_easy(
    message,
    nonceBytes,
    recipientPub,
    senderPriv
  );
  const ctForSender = sodium.crypto_box_easy(
    message,
    nonceBytes,
    senderPub,
    senderPriv
  );

  return {
    ciphertextForRecipient: b64.encode(ctForRecipient),
    ciphertextForSender: b64.encode(ctForSender),
    nonce: b64.encode(nonceBytes),
    senderPublicKey: senderPublicKeyB64,
  };
}

/**
 * Decrypt a ciphertext produced by encryptMessage.
 *
 * @param {object} args
 * @param {string} args.ciphertext       - base64 ciphertext (recipient or sender copy)
 * @param {string} args.nonce            - base64 nonce
 * @param {string} args.peerPublicKey    - the OTHER party's public key. For a received
 *                                         message this is the sender; for a self-echo
 *                                         (sender copy on another device) this is also
 *                                         the sender (i.e. our own publicKey).
 * @param {string} args.myPrivateKey     - our own private key, base64
 * @returns {string} plaintext
 * @throws if the ciphertext is tampered or keys/nonce are wrong
 */
export function decryptMessage({
  ciphertext,
  nonce,
  peerPublicKey,
  myPrivateKey,
}) {
  const ct = b64.decode(ciphertext);
  const n = b64.decode(nonce);
  const peerPub = b64.decode(peerPublicKey);
  const myPriv = b64.decode(myPrivateKey);
  const plain = sodium.crypto_box_open_easy(ct, n, peerPub, myPriv);
  return sodium.to_string(plain);
}
