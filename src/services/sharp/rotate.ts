import sharp from "sharp";

export const rotateImageService = async (
	fileBuffer: Buffer<ArrayBufferLike>,
	degree: number
): Promise<{
	success: boolean;
	message: string;
	data?: Buffer;
}> => {
	try {
		const data = await sharp(fileBuffer).rotate(degree).toBuffer();
		return {
			success: true,
			message: "Image rotated successfully",
			data: data,
		};
	} catch (error: any) {
		return {
			success: false,
			message: error.message,
		};
	}
};
