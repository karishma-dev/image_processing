import IORedis from "ioredis";

export const redis = new IORedis(
	process.env.REDIS_URL || "redis://localhost:6379"
);

export const getCache = async <T = any>(key: string): Promise<T | null> => {
	const cached = await redis.get(key);
	if (!cached) return null;
	try {
		return JSON.parse(cached);
	} catch (error) {
		return null;
	}
};

export const setCache = async (
	key: string,
	value: any,
	ttlSeconds = 300
): Promise<void> => {
	await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
};

export const cacheOrFetch = async <T>(
	key: string,
	fetchFn: () => Promise<T>,
	ttlSeconds = 300
): Promise<any> => {
	const cachedData = await getCache<T>(key);
	if (cachedData) return cachedData;
	const data = await fetchFn();
	await setCache(key, data, ttlSeconds);
	return data;
};

export const deleteMultipleKeys = async (key: string) => {
	const keys = await redis.keys(key);
	if (keys.length) await redis.del(...keys);
};
