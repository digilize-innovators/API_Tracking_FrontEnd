import CryptoJS from 'crypto-js';
const key = "Equality@123";
export const decrypt = async (ciphertext) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    console.log("original ", originalText);
    return originalText;
}
export const encrypt = async (originalText) => {
    const cipherText = CryptoJS.AES.encrypt(originalText, key);
    console.log("Encrypted ", cipherText.toString());
    return cipherText.toString();
}