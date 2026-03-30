import type { ServiceResponse } from '../types';
import { StorageKeys, store } from './storage.service';

function normalizeApiUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl.trim());
    let baseUrl = url.origin;

    const path = url.pathname.replace(/\/+$|^\/+/, '');
    const serviceIndex = path.toLowerCase().indexOf('casetaservice');
    if (serviceIndex !== -1) {
      const prefix = path.substring(0, serviceIndex);
      if (prefix) {
        baseUrl += `/${prefix.replace(/\/+$/, '')}`;
      }
    }

    return baseUrl.replace(/\/+$/, '');
  } catch {
    return null;
  }
}

function parseConfigJson(parsed: unknown): string | null {
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const data = parsed as Record<string, unknown>;
  const ips = data.IPs;
  const port = data.port;

  if (Array.isArray(ips) && ips.length > 0 && typeof ips[0] === 'string') {
    const host = ips[0].trim();
    const portNumber = typeof port === 'number' ? port : typeof port === 'string' ? Number(port) : NaN;
    if (host && Number.isFinite(portNumber)) {
      return `http://${host}:${portNumber}`;
    }
  }

  return null;
}

function extractApiUrlFromScanData(scanData: string): string | null {
  const trimmedData = scanData.trim();
  if (!trimmedData) {
    return null;
  }

  // Caso directo: el QR ya contiene una URL completa.
  const directUrl = normalizeApiUrl(trimmedData);
  if (directUrl) {
    return directUrl;
  }

  try {
    const parsedRaw = JSON.parse(trimmedData);
    const fromJson = parseConfigJson(parsedRaw);
    if (fromJson) {
      return fromJson;
    }
  } catch {
    // No es JSON directo, seguimos con otros formatos.
  }

  try {
    const queryStart = trimmedData.indexOf('?');
    const queryString = queryStart >= 0 ? trimmedData.substring(queryStart + 1) : trimmedData;
    const params = new URLSearchParams(queryString);

    const candidateKeys = ['apiUrl', 'url', 'endpoint', 'host'];
    for (const key of candidateKeys) {
      if (params.has(key)) {
        const candidate = params.get(key)?.trim();
        if (candidate) {
          const normalized = normalizeApiUrl(candidate);
          if (normalized) {
            return normalized;
          }
        }
      }
    }

    if (params.has('data')) {
      const dataString = params.get('data');
      if (dataString) {
        const parsed = JSON.parse(dataString);
        const fromJson = parseConfigJson(parsed);
        if (fromJson) {
          return fromJson;
        }

        if (parsed && typeof parsed === 'object') {
          for (const key of candidateKeys) {
            const candidate = (parsed as Record<string, unknown>)[key];
            if (typeof candidate === 'string') {
              const normalized = normalizeApiUrl(candidate);
              if (normalized) {
                return normalized;
              }
            }
          }
        }
      }
    }
  } catch {
    // Ignorar errores de análisis, seguimos con null.
  }

  return null;
}

const HARDCODED_API_URL = 'http://10.10.9.88:1234';

export async function getApiUrl(): Promise<string | null> {
  return HARDCODED_API_URL;
}

export async function setApiUrlFromScanData(
  scanData: string,
): Promise<ServiceResponse<string>> {
  const apiUrl = extractApiUrlFromScanData(scanData);
  if (!apiUrl) {
    return {
      success: false,
      message:
        'No se encontró una URL válida en el QR. Pega el texto completo del código de configuración.',
    };
  }

  await store(StorageKeys.API_URL, apiUrl);

  return {
    success: true,
    message: 'API URL configurada correctamente.',
    data: apiUrl,
  };
}
