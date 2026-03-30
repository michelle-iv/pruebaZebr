import * as SecureStore from "expo-secure-store";

export const StorageKeys = {
  API_URL: "apiUrl",
  USER_DATA: "userData",
  REQUIRES_PASSWORD_CHANGE: "requiresPasswordChange",
};

export async function store(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function getKey(key: string): Promise<string | null> {
  return await SecureStore.getItemAsync(key);
}

export async function deleteKey(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
