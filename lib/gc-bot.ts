// Game Coordinator client wrapper
export interface GCClientConfig {
  accountName?: string;
  password?: string;
}

export class GCClient {
  private ready: boolean = false;

  constructor(config?: GCClientConfig) {
    this.ready = false;
  }

  public async connect(): Promise<boolean> {
    try {
      this.ready = true;
      return true;
    } catch (err: any) {
      console.error("[GC Connection Error]", err);
      return false;
    }
  }

  public isReady(): boolean {
    return this.ready;
  }
}

export const gcClient = new GCClient();
