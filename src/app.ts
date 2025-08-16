import "dotenv/config";
import http from "http";
import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

import { specs, swaggerUi } from "./swagger";
import notFound from "./middleware/not-found";
import { sanitizeMiddleware } from "./middleware/sanitize";
import errorHandlerMiddleware from "./middleware/error-handler";

import authRouter from "./routes/authRoutes";
import imageRouter from "./routes/imageRoutes";
import { imageQueue } from "./queues/imageQueue";
import { initializeWebsocket } from "./websockets";

const port = process.env.PORT || 3000;
const s3Domain =
	process.env.S3_BUCKET_NAME && process.env.AWS_REGION
		? `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`
		: undefined;

const app = express();
const serverAdapter = new ExpressAdapter();
const server = http.createServer(app);
initializeWebsocket(server);

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: "Too many requests from this IP, please try again later.",
});
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: "Too many login attempts, please try again later.",
});

app.disable("x-powered-by");
app.set("trust proxy", 1); // Trust first proxy for rate limiting

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(limiter);
app.use("/api/v1/auth/login", authLimiter);
app.use(
	cors({
		origin:
			process.env.NODE_ENV === "production"
				? process.env.ALLOWED_ORIGINS?.split(",")
				: "*",
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				imgSrc: ["'self'", "data:", "blob:", ...(s3Domain ? [s3Domain] : [])],
			},
		},
		referrerPolicy: {
			policy: "no-referrer",
		},
	})
);
app.use(hpp());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(sanitizeMiddleware);
app.use(compression());

createBullBoard({
	queues: [new BullMQAdapter(imageQueue)],
	serverAdapter,
});
serverAdapter.setBasePath("/admin/queues");
app.use("/admin/queues", serverAdapter.getRouter());
app.use(
	"/api-docs",
	swaggerUi.serve,
	swaggerUi.setup(specs, {
		explorer: true,
		customCss: ".swagger-ui .topbar { display: none }",
		customSiteTitle: "Image Processing API Docs",
		customfavIcon: "/favicon.ico",
	})
);
app.get("/", (req, res) => {
	res.send("Hello, World!");
});
app.get("/health", (req, res) => {
	res.status(200).json({
		status: "ok",
		uptime: process.uptime(),
	});
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/images", imageRouter);

app.use(notFound);
app.use(errorHandlerMiddleware);

server.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
