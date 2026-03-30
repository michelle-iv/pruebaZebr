import Constants from "expo-constants";
import CryptoJS from "crypto-js";

const CRYPTO_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_CRYPTO_KEY || "";
const CRYPTO_IV = Constants.expoConfig?.extra?.EXPO_PUBLIC_CRYPTO_IV || "";

export function encryptData(data: object) {
  if (!CRYPTO_KEY || !CRYPTO_IV) {
    throw new Error("Encryption keys are not set.");
  }

  const key = CryptoJS.enc.Utf8.parse(CRYPTO_KEY);
  const iv = CryptoJS.enc.Utf8.parse(CRYPTO_IV);
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
    blockSize: 128,
    keySize: 256,
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted;
}
