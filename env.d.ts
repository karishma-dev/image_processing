declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: "development" | "production" | "test";
		PORT?: string;
		JWT_SECRET: string;
		DATABASE_URL: string;
	}
}
