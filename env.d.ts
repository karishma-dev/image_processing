declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: "development" | "production" | "test";
		PORT?: string;
		DATABASE_URL: string;
		JWT_SECRET: string;
		COOKIE_SECRET: string;
		SMTP_SERVICE: string;
		SMTP_SECURE: string;
		SMTP_USER: string;
		SMTP_FROM: string;
		SMTP_PASS: string;
	}
}
