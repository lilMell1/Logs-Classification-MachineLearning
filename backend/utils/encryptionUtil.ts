import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY = process.env.ENCRYPTION_SECRET!;
const getKey = () => CryptoJS.SHA256(SECRET_KEY);
const IV_LENGTH = 16;
// console.log("Backend key:", SECRET_KEY);
// console.log("Backend key hash:", getKey().toString());

export function encrypt(text: string): string {
  const iv = CryptoJS.lib.WordArray.random(IV_LENGTH);
  const encrypted = CryptoJS.AES.encrypt(text, getKey(), {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.ciphertext.toString(CryptoJS.enc.Hex);
}

export function decrypt(data: string): string {
  try {
    console.log("Incoming encrypted data:", data);
    const [ivHex, encryptedHex] = data.split(':');

    if (!ivHex || !encryptedHex) {
      console.error("Invalid encrypted format");
      return '';
    }

    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const ciphertext = CryptoJS.enc.Hex.parse(encryptedHex);
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, getKey(), {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    console.log("Decrypted string:", decryptedString);
    return decryptedString;

  } catch (err) {
    console.error("Decryption failed:", err);
    return '';
  }
}
