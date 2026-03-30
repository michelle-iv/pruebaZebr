import { getPassInfoService } from "../../../common/features/pass-verification/services/get/get-pass-info.service";
import { getSICEMPassInfoService } from "../../../common/features/pass-verification/services/get/get-sicem-pass-info.service";
import type { ScannedData, ServiceResponse } from "../../../common/types";
import { ExtractedDataType, scannedDataExtractor } from "./scanned-data-extractor.service";

export async function handleScannedData(
  scanData: string,
): Promise<ServiceResponse<ScannedData>> {
  const extraction = await scannedDataExtractor(scanData);

  if (!extraction.success || !extraction.data) {
    return {
      success: false,
      message: extraction.message,
    };
  }

  const { type, value } = extraction.data;

  if (type === ExtractedDataType.Barcode) {
    const passInfo = await getPassInfoService({
      passNumber: Number.parseInt(value, 10),
    });

    if (!passInfo.success || !passInfo.data) {
      return {
        success: false,
        message: passInfo.message,
      };
    }

    return {
      success: true,
      message: passInfo.message,
      data: {
        type: 1,
        bundle: passInfo.data,
      },
    };
  }

  if (type === ExtractedDataType.FastLaneQR) {
    const passInfo = await getPassInfoService({
      passNumber: Number.parseInt(value.NP, 10),
    });

    if (!passInfo.success || !passInfo.data) {
      return {
        success: false,
        message: passInfo.message,
      };
    }

    return {
      success: true,
      message: passInfo.message,
      data: {
        type: Number.parseInt(value.TIP, 10),
        bundle: passInfo.data,
      },
    };
  }

  if (type === ExtractedDataType.SicemQR) {
    const passInfo = await getSICEMPassInfoService({
      idEmpleado: Number.parseInt(value.idEmpleado, 10),
    });

    if (!passInfo.success || !passInfo.data) {
      return {
        success: false,
        message: passInfo.message,
      };
    }

    return {
      success: true,
      message: passInfo.message,
      data: {
        type: -1,
        bundle: passInfo.data,
      },
    };
  }

  return {
    success: false,
    message: "Tipo de código escaneado no soportado",
  };
}

export default handleScannedData;
