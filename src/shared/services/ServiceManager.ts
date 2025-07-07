export class ServiceManager {
  private static instance: ServiceManager;
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('ServiceManager already initialized');
      return;
    }

    console.log('🚀 Initializing ServiceManager...');
    this.isInitialized = true;
    console.log('✅ All services initialized successfully');
  }

  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up services...');
    this.isInitialized = false;
  }

  // Service notifications simple
  get notifications() {
    return {
      success: (title: string, message: string) => {
        console.log('🟢 SUCCESS:', title, message);
      },
      error: (title: string, message: string) => {
        console.log('🔴 ERROR:', title, message);
      },
      warning: (title: string, message: string) => {
        console.log('🟡 WARNING:', title, message);
      },
      info: (title: string, message: string) => {
        console.log('🔵 INFO:', title, message);
      }
    };
  }

  isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

export const serviceManager = ServiceManager.getIn