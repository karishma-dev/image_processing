import { Queue } from "bullmq";

const connection = {
	connection: {
		url: process.env.REDIS_URL,
	},
};

// INFO: Create and export the Queue instance
export const imageQueue = new Queue("image-queue", connection);

// INFO: It's a helper to add a resize job with retry/backoff and cleanup policy
export const addResizeJob = async (payload: any) => {
	return imageQueue.add("image:resize", payload, {
		attempts: 3,
		/*
			INFO: When a job a job fails, and we want to retry, backoff controls how long to wait before each try
			If type is 'fixed', waits same delay every time
			else if 'exponential', delay grows: 500ms, 1000ms, 2000ms.
		*/
		backoff: { type: "exponential", delay: 500 },
		// INFO: If true, then the job will be removed automatically on complete to save redis space, else kept for inspection
		removeOnComplete: true,
		// INFO: If the job fails (it exhausted it's retry attempts also), then if this is true, it will be removed, else kep.
		removeOnFail: false,
	});
};

export const rotateImageJob = async (payload: any) => {
	return imageQueue.add("image:rotate", payload, {
		attempts: 3,
		backoff: {
			type: "exponential",
			delay: 500,
		},
		removeOnComplete: true,
		removeOnFail: false,
	});
};

export const mirrorImageJob = async (payload: any) => {
	return imageQueue.add("image:mirror", payload, {
		attempts: 3,
		backoff: {
			type: "exponential",
			delay: 500,
		},
		removeOnComplete: true,
		removeOnFail: false,
	});
};

export const flipImageJob = async (payload: any) => {
	return imageQueue.add("image:flip", payload, {
		attempts: 3,
		backoff: {
			type: "exponential",
			delay: 500,
		},
		removeOnComplete: true,
		removeOnFail: false,
	});
};

export const changeImageFormatJob = async (payload: any) => {
	return imageQueue.add("image:format", payload, {
		attempts: 3,
		backoff: {
			type: "exponential",
			delay: 500,
		},
		removeOnComplete: true,
		removeOnFail: false,
	});
};

export const allOperationsOnImageJob = async (payload: any) => {
	return imageQueue.add("image:allOperations", payload, {
		attempts: 3,
		backoff: {
			type: "exponential",
			delay: 500,
		},
		removeOnComplete: true,
		removeOnFail: false,
	});
};
