import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.REACT_APP_ENCRYPTION_SECRET!;
const getKey = () => CryptoJS.SHA256(SECRET_KEY);
const IV_LENGTH = 16;
// console.log("Frontend key:", SECRET_KEY);
// console.log("Frontend key hash:", getKey().toString());
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
  const [ivHex, encryptedHex] = data.split(':');
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const ciphertext = CryptoJS.enc.Hex.parse(encryptedHex);
  const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });

  const decrypted = CryptoJS.AES.decrypt(cipherParams, getKey(), {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}
