import sodium from 'libsodium-wrappers';
import { config } from '../../envconfig.js';

const KEY_LENGTH = 32; // 256 bits for XChaCha20-Poly1305

export const encrypt = async (text: string): Promise<string> => {
  await sodium.ready;

  // Generate a random nonce
  const nonce = sodium.randombytes_buf(
    sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
  );

  // Derive a key from the secret key using HKDF
  const key = sodium.crypto_generichash(KEY_LENGTH, config.crypto.mfaSecretKey);

  // Encrypt the text
  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    text,
    null, // No additional data
    null, // No additional data
    nonce,
    key
  );

  // Combine nonce and ciphertext
  const combined = new Uint8Array(nonce.length + ciphertext.length);
  combined.set(nonce);
  combined.set(ciphertext, nonce.length);

  // Convert to base64 for storage
  return sodium.to_base64(combined);
};

export const decrypt = async (encryptedText: string): Promise<string> => {
  await sodium.ready;

  // Convert from base64
  const combined = sodium.from_base64(encryptedText);

  // Extract nonce and ciphertext
  const nonce = combined.slice(
    0,
    sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
  );
  const ciphertext = combined.slice(
    sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
  );

  // Derive the same key
  const key = sodium.crypto_generichash(KEY_LENGTH, config.crypto.mfaSecretKey);

  // Decrypt
  const decrypted = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null, // No additional data
    ciphertext,
    null, // No additional data
    nonce,
    key
  );

  return sodium.to_string(decrypted);
};
