import { encryptData } from "../../lib/encryptor";
import { StorageKeys, deleteKey, getKey, store } from "../services/storage.service";
import type { FormStatus, User } from "../types";
import { getApiUrl } from "./api-config.service";

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult extends FormStatus {
  user?: User;
  requiresPasswordChange?: boolean;
}

export async function login({ username, password }: LoginParams): Promise<LoginResult> {
  const apiUrl = await getApiUrl();

  console.log("API URL obtenida en login:", apiUrl);
  if (!apiUrl) {
    return {
      success: false,
      message: "API URL no configurada.",
    };
  }

  try {
    const params = {
      Usuario: username,
      Contrasena: password,
    };

    const encryptedText = encryptData(params);
    const encodedEncryptedText = encodeURIComponent(encryptedText.toString());
    const loginUrl = `${apiUrl}/CasetaService/LogIn/?Datos=${encodedEncryptedText}`;

    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMsg =
        errorData?.Mensaje || `Error: ${response.status} ${response.statusText}`;

      return {
        success: false,
        message: errorMsg,
      };
    }

    const responseData = await response.json();

    if (!responseData.esExitoso) {
      return {
        success: false,
        message: responseData.Mensaje || "Credenciales inválidas.",
      };
    }

    const userData: User = {
      idGuardia: responseData.idGuardia,
      Nombre: responseData.Nombre,
      Usuario: responseData.Usuario,
    };

    const requiresChange = responseData.CambiarContrasena === true;

    await store(StorageKeys.USER_DATA, JSON.stringify(userData));
    await store(StorageKeys.REQUIRES_PASSWORD_CHANGE, requiresChange.toString());

    return {
      success: true,
      message: "Inicio de sesión exitoso.",
      user: userData,
      requiresPasswordChange: requiresChange,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocurrió un error durante el inicio de sesión.",
    };
  }
}

export async function logout(): Promise<void> {
  await deleteKey(StorageKeys.USER_DATA);
  await deleteKey(StorageKeys.REQUIRES_PASSWORD_CHANGE);
}

export async function getStoredUser(): Promise<User | null> {
  const storedUserData = await getKey(StorageKeys.USER_DATA);
  if (!storedUserData) return null;
  return JSON.parse(storedUserData) as User;
}
