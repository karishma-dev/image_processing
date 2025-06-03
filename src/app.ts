import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import bodyParser from "body-parser";
import compression from "compression";
import morgan from "morgan";
import authRouter from "./routes/authRoutes";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { sanitizeMiddleware } from "./middleware/sanitize";

const port = process.env.PORT || 3000;

const app = express();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: "Too many requests from this IP, please try again later.",
});

app.disable("x-powered-by");
app.set("trust proxy", 1); // Trust first proxy for rate limiting

if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}
if (process.env.NODE_ENV === "production") {
	app.use(morgan("combined"));
}
app.use(limiter);
app.use(
	cors({
		origin: "*", // Allow all origins
		credentials: true,
	})
);
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(sanitizeMiddleware);
app.use(compression());

app.get("/", (req, res) => {
	res.send("Hello, World!");
});

app.use("/api/v1/auth", authRouter);

// custom 404
app.use((req, res, next) => {
	res.status(404).send("Sorry can't find that!");
});

// custom error handler
// app.use((err, req, res, next) => {
// 	console.error(err.stack);
// 	res.status(500).send("Something broke!");
// });

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
