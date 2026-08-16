import CryptoJS from "crypto-js";

const SECRET_KEY =
  process.env.NEXT_PUBLIC_CRYPTO_SECRET || "EDL_EVALUATION_SECRET_KEY_2026";

/**
 * Encrypts a string or number value using CryptoJS AES and URL-encodes it.
 */
export function encryptData(value: string | number): string {
  const strValue = String(value);
  const ciphertext = CryptoJS.AES.encrypt(strValue, SECRET_KEY).toString();
  return encodeURIComponent(ciphertext);
}

/**
 * Decrypts a URL-encoded ciphertext back to plaintext string using CryptoJS AES.
 */
export function decryptData(encryptedValue: string): string {
  try {
    const decoded = decodeURIComponent(encryptedValue);
    const bytes = CryptoJS.AES.decrypt(decoded, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedText;
  } catch (err) {
    console.error("CryptoJS Decryption error:", err);
    return "";
  }
}
