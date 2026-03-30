import { getApiUrl } from "../../../../services/api-config.service";
import { StorageKeys, getKey } from "../../../../services/storage.service";
import type { CommonPassInfo, ServiceResponse } from "../../../../types";

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

interface GetPassInfoParams {
  passNumber: string | number;
  TUID?: string;
}

export async function getPassInfoService({
  passNumber,
  TUID,
}: GetPassInfoParams): Promise<ServiceResponse<CommonPassInfo>> {
  const apiUrl = await getApiUrl();

  console.log("API URL obtenida:", apiUrl);

  if (!apiUrl) {
    return { success: false, message: "API URL not configured." };
  }

  const userDataString = await getKey(StorageKeys.USER_DATA);
  if (!userDataString) {
    return { success: false, message: "User data not found." };
  }

  const userData = JSON.parse(userDataString) as { idGuardia: number };
  const idGuardia = userData.idGuardia;
  const url = `${apiUrl}/CasetaService/GetInfoPase`;

  const body = JSON.stringify({ noPase: passNumber, idGuardia, TUID });

  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    return { success: false, message: "Error al intentar obtener los datos" };
  }

  const responseData = await response.json();

  if (!responseData?.NroPase) {
    return { success: false, message: "Error al intentar obtener los datos" };
  }

  const transformedData: CommonPassInfo = {
    NroPase: responseData.NroPase,
    Placas: responseData.Placas,
    Nombre: responseData.Nombre,
    ApellidoPaterno: responseData.ApellidoPaterno,
    ApellidoMaterno: responseData.ApellidoMaterno,
    FechaVencimiento: responseData.FechaVencimiento,
    FechaCruce: responseData.FechaCruce,
    Responsable: responseData.Responsable,
    CantidadPersonas: responseData.CantidadPersonas,
    Verificacion: {
      PaseLibre: responseData.PaseLibre,
      IdObservacion: responseData.idObservacion,
      Observacion: responseData.Observacion,
    },
    idIntento: responseData.idIntento,
  };

  return {
    success: true,
    message: "Datos obtenidos correctamente.",
    data: transformedData,
  };
}
