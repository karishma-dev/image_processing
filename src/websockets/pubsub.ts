import IORedis from "ioredis";
import { redisURL } from "../utils/redisCache";

export const pub = new IORedis(redisURL);
export const sub = new IORedis(redisURL);

pub.on("error", (err) => {
	console.error(`Redis PUB error`, err);
});

let redisRetryConnect = 0;
const MAX_REDIS_RETRIES = 3;

sub.on("error", (err) => {
	console.error(`Redis SUB error`, err);
	if (redisRetryConnect < MAX_REDIS_RETRIES) {
		const delay = Math.pow(2, redisRetryConnect) * 1000;
		setTimeout(() => {
			try {
				sub.connect();
				console.log("Redis SUB reconnected");
				redisRetryConnect = 0;
			} catch (error) {
				console.error(`Redis SUB reconnect failed`, error);
				redisRetryConnect++;
			}
		});
	} else {
		console.error(
			"Max Redis reconnect attempts reached. Manual intervention required."
		);
	}
});
