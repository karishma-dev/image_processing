import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { resizeImageService } from "../services/sharp/resize";
import prisma from "../utils/client";
import { rotateImageService } from "../services/sharp/rotate";
import { mirrorImageService } from "../services/sharp/mirror";
import { flipImageService } from "../services/sharp/flip";
import { changeImageFormatService } from "../services/sharp/changeFormat";
import sharp from "sharp";
import { allImageChangesService } from "../services/sharp/allImageChanges";

sharp.concurrency(2); // Meaning???

const s3 = new S3Client({
	region: process.env.AWS_REGION,
});
const connection = new IORedis({
	maxRetriesPerRequest: null,
});

const worker = new Worker(
	"image-queue",
	async (job) => {
		console.log("Processing job: ", job.data);
		const { key, imageId, operationData, userId } = job.data;

		// INFO: Download image from s3 as a stream, it returns s3Response.Body, which is a readable stream
		const s3Response = await s3.send(
			new GetObjectCommand({
				Bucket: process.env.S3_BUCKET_NAME,
				Key: key,
			})
		);

		// INFO: Converts stream to buffer, so it can be used in sharp
		const originalBuffer = await streamToBuffer(s3Response.Body);
		let optimizedBuffer = null;
		let updatedData: {
			width?: number;
			height?: number;
		} = {};

		switch (job.name) {
			case "image:resize":
				optimizedBuffer = await resizeImageService(
					originalBuffer,
					operationData.width,
					operationData.height
				);
				updatedData.width = operationData.width;
				updatedData.height = operationData.height;
				break;
			case "image:rotate":
				optimizedBuffer = await rotateImageService(
					originalBuffer,
					operationData.degree
				);
				break;
			case "image:mirror":
				optimizedBuffer = await mirrorImageService(originalBuffer);
				break;
			case "image:flip":
				optimizedBuffer = await flipImageService(originalBuffer);
				break;
			case "image:format":
				optimizedBuffer = await changeImageFormatService(
					originalBuffer,
					operationData.desiredFormat
				);
				break;
			case "image:allOperations":
				optimizedBuffer = await allImageChangesService(
					originalBuffer,
					operationData.desiredFormat,
					operationData.width,
					operationData.height,
					operationData.degree
				);
				break;
			default:
				break;
		}

		if (!optimizedBuffer) {
			throw new Error("Out of scope job");
		}
		if (!optimizedBuffer.success || !optimizedBuffer.data) {
			throw new Error(optimizedBuffer.message);
		}

		// INFO: Upload the resized image buffer back to S3
		await s3.send(
			new PutObjectCommand({
				Bucket: process.env.S3_BUCKET_NAME,
				Key: key,
				Body: optimizedBuffer.data,
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
				...updatedData,
				status: "processed",
			},
		});

		console.log(`${key} resized successfully`);
	},
	{
		connection,
		concurrency: 3,
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
