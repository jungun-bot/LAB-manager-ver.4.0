
// Simple encryption utility for client-side storage
// Note: In a purely client-side app, "encryption" obfuscates the key to prevent 
// casual reading from LocalStorage. True security requires a backend.

const STORAGE_KEY = 'lab_mgr_api_key_enc';
const SALT = 'LAB_MANAGER_SECURE_SALT_v1';

export const saveApiKey = (apiKey: string) => {
  try {
    // Simple XOR obfuscation + Base64
    const encrypted = xorEncrypt(apiKey, SALT);
    localStorage.setItem(STORAGE_KEY, encrypted);
    return true;
  } catch (e) {
    console.error("Failed to save API key", e);
    return false;
  }
};

export const getApiKey = (): string | null => {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;
    return xorDecrypt(encrypted, SALT);
  } catch (e) {
    console.error("Failed to retrieve API key", e);
    return null;
  }
};

export const hasApiKey = (): boolean => {
  return !!localStorage.getItem(STORAGE_KEY);
};

export const removeApiKey = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Helper: XOR Cipher
const xorEncrypt = (text: string, key: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result); // Base64 encode
};

const xorDecrypt = (encryptedBase64: string, key: string): string => {
  const text = atob(encryptedBase64); // Base64 decode
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};
