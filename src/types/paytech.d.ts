declare class PayTech {
  static OPEN_IN_POPUP: string;
  constructor(options: { idTransaction?: string });
  withOption(options: {
    requestTokenUrl: string;
    method?: string;
    headers?: Record<string, string>;
    presentationMode?: string;
    didReceiveError?: (error: string) => void;
    didReceiveNonSuccessResponse?: (jsonResponse: any) => void;
  }): PayTech;
  send(): void;
}

interface Window {
  PayTech: typeof PayTech;
}
