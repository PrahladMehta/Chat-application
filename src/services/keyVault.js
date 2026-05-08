import sodium from "libsodium-wrappers-sumo";
import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval";
import { ready } from "./cryptoService";

/**
 * @module keyVault
 *
 * Persists the user's decrypted Curve25519 private key across page
 * reloads within a tab session, so the user is not re-prompted for
 * their password on every refresh.
 *
 * Storage scheme:
 *   - sessionStorage["e2ee.sk"]   = base64(32-byte session key)
 *   - IndexedDB["e2ee.privkey"]   = { ciphertext, nonce } (base64)
 *
 * The session key never leaves sessionStorage; the ciphertext never
 * leaves IndexedDB. An attacker needs BOTH halves to recover the
 * private key — and getting either implies full DOM access, in which
 * case all bets are off anyway. The split protects against accidental
 * leaks (e.g. JSON.stringify(localStorage), heap dumps).
 *
 * Both halves are wiped on logout, on tab close, and on any decryption
 * failure.
 */

const SESSION_KEY_KEY = "e2ee.sk";
const IDB_PRIVKEY_KEY = "e2ee.privkey";

const b64 = {
  encode: (bytes) => sodium.to_base64(bytes, sodium.base64_variants.ORIGINAL),
  decode: (str) => sodium.from_base64(str, sodium.base64_variants.ORIGINAL),
};

/**
 * Encrypt and persist the decrypted private key for the current tab.
 *
 * @param {string} privateKeyB64
 * @returns {Promise<void>}
 */
export async function storeKey(privateKeyB64) {
  await ready();

  const sessionKey = sodium.randombytes_buf(sodium.crypto_secretbox_KEYBYTES);
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const privBytes = b64.decode(privateKeyB64);

  const ciphertext = sodium.crypto_secretbox_easy(privBytes, nonce, sessionKey);

  sessionStorage.setItem(SESSION_KEY_KEY, b64.encode(sessionKey));
  await idbSet(IDB_PRIVKEY_KEY, {
    ciphertext: b64.encode(ciphertext),
    nonce: b64.encode(nonce),
  });
}

/**
 * Load and decrypt the persisted private key.
 *
 * @returns {Promise<string|null>} privateKey base64, or null if either
 *   half is missing or decryption fails (caller should treat null as
 *   "needs unlock" and prompt the user to re-enter their password).
 */
export async function loadKey() {
  await ready();

  const sessionKeyB64 = sessionStorage.getItem(SESSION_KEY_KEY);
  if (!sessionKeyB64) return null;

  const stored = await idbGet(IDB_PRIVKEY_KEY);
  if (!stored || !stored.ciphertext || !stored.nonce) return null;

  try {
    const sessionKey = b64.decode(sessionKeyB64);
    const ciphertext = b64.decode(stored.ciphertext);
    const nonce = b64.decode(stored.nonce);
    const privBytes = sodium.crypto_secretbox_open_easy(
      ciphertext,
      nonce,
      sessionKey
    );
    return b64.encode(privBytes);
  } catch {
    // Session key / ciphertext mismatch — wipe both halves and force unlock.
    await clear();
    return null;
  }
}

/**
 * Wipe both halves of the vault. Called on logout and on init failures.
 *
 * @returns {Promise<void>}
 */
export async function clear() {
  sessionStorage.removeItem(SESSION_KEY_KEY);
  try {
    await idbDel(IDB_PRIVKEY_KEY);
  } catch {
    // ignore — IDB may not be available, and a missing key is fine.
  }
}
