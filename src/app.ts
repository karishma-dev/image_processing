import "dotenv/config";
import express, { Request, Response } from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import multer from "multer";

import notFound from "./middleware/not-found";
import { sanitizeMiddleware } from "./middleware/sanitize";
import errorHandlerMiddleware from "./middleware/error-handler";

import authRouter from "./routes/authRoutes";

const port = process.env.PORT || 3000;

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
	dest: "uploads/",
});
const app = express();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: "Too many requests from this IP, please try again later.",
});

app.disable("x-powered-by");
app.set("trust proxy", 1); // Trust first proxy for rate limiting

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(limiter);
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
				// imgSrc: ["'self'", "data:", "blob:", process.env.S3_BUCKET_DOMAIN],
			},
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

app.get("/", (req, res) => {
	res.send("Hello, World!");
});
app.post("/upload", upload.single("file"), (req: any, res: any) => {
	if (!req.file) {
		return res.status(400).json({ error: "No file uploaded." });
	}
	res.status(200).json({
		message: "File uploaded successfully.",
		file: {
			filename: req.file.originalname,
			size: req.file.size,
			mimetype: req.file.mimetype,
			buffer: req.file.buffer.toString("base64"), // Convert buffer to base64 string for JSON response
		},
	});
});

app.use("/api/v1/auth", authRouter);

app.use(notFound);
app.use(errorHandlerMiddleware);

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
