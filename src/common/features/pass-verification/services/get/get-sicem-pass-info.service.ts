import { getApiUrl } from "../../../../services/api-config.service";
import type { SICEMPassInfo, ServiceResponse } from "../../../../types";

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

interface GetSICEMPassInfoParams {
  idEmpleado: number | string;
  TUID?: string;
}

export async function getSICEMPassInfoService({
  idEmpleado,
  TUID,
}: GetSICEMPassInfoParams): Promise<ServiceResponse<SICEMPassInfo>> {
  const apiUrl = await getApiUrl();

  if (!apiUrl) {
    return { success: false, message: "API URL not configured." };
  }

  const url = `${apiUrl}/CasetaService/GetInfoPaseSICEM`;
  const body = JSON.stringify({ idEmpleado, TUID });

  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    return { success: false, message: "Error al obtener la información del pase" };
  }

  const responseData = (await response.json()) as SICEMPassInfo;

  if (!responseData?.NoFuncionario) {
    return { success: false, message: "Error al obtener la información del pase" };
  }

  return {
    success: true,
    message: "Datos de pase SICEM obtenidos correctamente.",
    data: responseData,
  };
}
