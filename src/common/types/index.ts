export interface FormStatus {
  success: boolean;
  message?: string;
}

export interface ServiceResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export type User = {
  idGuardia: number;
  Nombre: string;
  Usuario: string;
};

export interface RawQRPassData {
  NP: string;
  Nom: string;
  AP: string;
  AM: string;
  FV: string;
  DR: string;
  PV: string;
  MAT: string;
  TIP: string;
}

export type CommonPassInfo = {
  NroPase: number | string;
  Placas: string;
  Nombre: string;
  ApellidoPaterno: string;
  ApellidoMaterno: string;
  FechaVencimiento: string;
  FechaCruce: string;
  Responsable: string;
  CantidadPersonas: number | string;
  Verificacion: {
    PaseLibre: boolean | string;
    IdObservacion: number | string;
    Observacion: string;
  };
  idIntento: number | string;
};

export type SICEMPassInfo = {
  NoEmpleado: number | string;
  NoFuncionario: string;
  Nombre: string;
  ApellidoPaterno: string;
  ApellidoMaterno: string;
  Activo: boolean;
  Verificacion: {
    PaseLibre: boolean;
    IdObservacion: number;
    Observacion: string;
  };
};

export enum ExtractedDataType {
  Barcode = "BARCODE",
  FastLaneQR = "FASTLANE_QR",
  SicemQR = "SICEM_QR",
}

export type ScannedData = {
  type: number;
  bundle: CommonPassInfo | SICEMPassInfo | undefined;
};
