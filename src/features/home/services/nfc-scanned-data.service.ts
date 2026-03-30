import type { CommonPassInfo, ServiceResponse } from "../../../common/types";
import { getPassInfoService } from "../../../common/features/pass-verification/services/get/get-pass-info.service";

export async function handleNFCScannedDataService(scannedData: {
  tagId: string;
  passNumber: string;
}): Promise<ServiceResponse<{
  type: number;
  bundle: CommonPassInfo | undefined;
}>> {
  const { passNumber, tagId } = scannedData;

  if (!passNumber || !tagId) {
    return {
      success: false,
      message: "Datos NFC no validos",
    };
  }

  const passInfo = await getPassInfoService({
    passNumber: Number.parseInt(passNumber, 10),
    TUID: tagId,
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
