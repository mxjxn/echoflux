// Type declaration for supersonic-scsynth (no official types available)
declare module 'supersonic-scsynth' {
  export class SuperSonic {
    constructor(options: {
      workerBaseURL: string;
      wasmBaseURL: string;
      synthdefBaseURL?: string;
      sampleBaseURL?: string;
    });
    init(): Promise<void>;
    loadSynthDefs(names: string[]): Promise<void>;
    send(address: string, ...args: any[]): void;
    sendOSC(oscBytes: Uint8Array, options?: any): void;
    onInitialized?: () => void;
    onError?: (error: Error) => void;
    onMessageReceived?: (msg: any) => void;
    onMessageSent?: (data: any) => void;
  }
}
