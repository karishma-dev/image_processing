import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { resizeImageService } from "../services/sharp/resize";
import prisma from "../utils/client";

const s3 = new S3Client({
	region: process.env.AWS_REGION,
});
const connection = new IORedis({
	maxRetriesPerRequest: null,
});

const worker = new Worker(
	"image-queue",
	async (job) => {
		const { key, imageId, width, height, userId } = job.data;
		console.log("Processing job: ", job.data);

		// INFO: Download image from s3 as a stream, it returns s3Response.Body, which is a readable stream
		const s3Response = await s3.send(
			new GetObjectCommand({
				Bucket: process.env.S3_BUCKET_NAME,
				Key: key,
			})
		);

		// INFO: Converts stream to buffer, so it can be used in sharp
		const originalBuffer = await streamToBuffer(s3Response.Body);

		const resizedBuffer = await resizeImageService(
			originalBuffer,
			width,
			height
		);

		if (!resizedBuffer.success || !resizedBuffer.data) {
			throw new Error(resizedBuffer.message);
		}

		const resizedKey = `uploads/${imageId}/resized-${width}*${height}.jpg`;

		// INFO: Upload the resized image buffer back to S3
		await s3.send(
			new PutObjectCommand({
				Bucket: process.env.S3_BUCKET_NAME,
				Key: resizedKey,
				Body: resizedBuffer.data,
				ContentType: "image/jpeg",
				Metadata: {
					userId: userId,
				},
			})
		);

		await prisma.image.update({
			where: {
				id: imageId,
			},
			data: {
				key: resizedKey,
				width,
				height,
				status: "processed",
			},
		});

		console.log(`${resizedKey} resized successfully`);
	},
	{
		connection,
	}
);

async function streamToBuffer(stream: any): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		stream.on("data", (chunk: Buffer) => chunks.push(chunk));
		stream.on("end", () => resolve(Buffer.concat(chunks)));
		stream.on("error", reject);
	});
}

worker.on("completed", (job) => {
	console.log(`${job.data.key} has completed!`);
});

worker.on("failed", (job, err) => {
	console.log(`${job?.data.key} has failed with ${err.message}`);
});
