import sharp from "sharp";

export const resizeImageService = async (
	fileBuffer: Buffer<ArrayBufferLike>,
	width: number,
	height: number
): Promise<{
	success: boolean;
	message: string;
	data?: Buffer;
}> => {
	try {
		const data = await sharp(fileBuffer).resize(width, height).toBuffer();
		return {
			success: true,
			message: "Image resized successfully",
			data: data,
		};
	} catch (error: any) {
		return {
			success: false,
			message: error.message,
		};
	}
};
