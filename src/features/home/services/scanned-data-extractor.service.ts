import type { RawQRPassData, ServiceResponse } from "../../../common/types";
import { ExtractedDataType } from "../../../common/types";

export type ExtractedBarcodeData = {
  type: ExtractedDataType.Barcode;
  value: string;
};

export type ExtractedFastLaneQRData = {
  type: ExtractedDataType.FastLaneQR;
  value: RawQRPassData;
};

export type ExtractedSicemQRData = {
  type: ExtractedDataType.SicemQR;
  value: {
    idEmpleado: string;
  };
};

export type ExtractedScanOutput =
  | ExtractedBarcodeData
  | ExtractedFastLaneQRData
  | ExtractedSicemQRData;

export async function scannedDataExtractor(
  data: string,
): Promise<ServiceResponse<ExtractedScanOutput>> {
  try {
    if (!data || data.trim().length === 0) {
      return {
        success: false,
        message: "No se encontraron datos de escaneo",
      };
    }

    if (/^\d+$/.test(data)) {
      return {
        success: true,
        message: "Datos de código de barras escaneados correctamente",
        data: {
          type: ExtractedDataType.Barcode,
          value: data,
        },
      };
    }

    const queryStart = data.indexOf("?");
    if (queryStart === -1) {
      return {
        success: false,
        message: "Formato de código QR inválido: falta la cadena de consulta",
      };
    }

    const queryString = data.substring(queryStart + 1);
    const params = new URLSearchParams(queryString);

    if (params.has("data")) {
      const fastlaneDataString = params.get("data");
      if (!fastlaneDataString) {
        return {
          success: false,
          message: "El parámetro 'data' del QR de FastLane está vacío.",
        };
      }

      try {
        const qrdata: RawQRPassData = JSON.parse(fastlaneDataString);
        if (typeof qrdata !== "object" || qrdata === null) {
          throw new Error("Los datos QR de FastLane analizados no son un objeto.");
        }

        return {
          success: true,
          message: "Datos QR de FastLane escaneados correctamente",
          data: {
            type: ExtractedDataType.FastLaneQR,
            value: qrdata,
          },
        };
      } catch (error) {
        return {
          success: false,
          message: `Error al analizar los datos QR de FastLane: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`,
        };
      }
    }

    if (params.has("idEmpleado")) {
      const idEmpleado = params.get("idEmpleado");
      if (!idEmpleado || idEmpleado.trim() === "") {
        return {
          success: false,
          message: "El parámetro 'idEmpleado' del QR de SICEM falta o está vacío.",
        };
      }

      return {
        success: true,
        message: "Datos QR de SICEM escaneados correctamente",
        data: {
          type: ExtractedDataType.SicemQR,
          value: { idEmpleado: idEmpleado.trim() },
        },
      };
    }

    return {
      success: false,
      message:
        "El código QR no coincide con los formatos esperados (FastLane o SICEM).",
    };
  } catch (error) {
    return {
      success: false,
      message: `Error en el procesamiento de datos de escaneo: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

export { ExtractedDataType };
