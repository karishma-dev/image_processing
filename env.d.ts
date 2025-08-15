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
		REDIS_URL: string;

		S3_BUCKET_NAME: string;
		AWS_ACCESS_KEY_ID: string;
		AWS_SECRET_ACCESS_KEY: string;
		AWS_REGION: string;
	}
}
