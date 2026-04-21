declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_BASE_URL: string;
    NEXT_PUBLIC_API_URL?: string;
    FRONTEND_URL?: string;
    JWT_SECRET?: string;
    DB_HOST?: string;
    DB_USER?: string;
    DB_PASSWORD?: string;
    DB_NAME?: string;
    DB_PORT?: string;
    NODE_ENV?: 'development' | 'production' | 'test';
  }
}

export {};
