import sharp from "sharp";

export const mirrorImageService = async (
	fileBuffer: Buffer<ArrayBufferLike>
): Promise<{
	success: boolean;
	message: string;
	data?: Buffer;
}> => {
	try {
		const data = await sharp(fileBuffer)
			.flop() // Flip the image vertically
			.toBuffer();
		return {
			success: true,
			message: "Image flipped successfully",
			data,
		};
	} catch (error: any) {
		return {
			success: false,
			message: error.message,
		};
	}
};
