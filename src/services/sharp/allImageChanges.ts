import sharp, { AvailableFormatInfo, FormatEnum } from "sharp";

export const allImageChangesService = async (
	fileBuffer: Buffer<ArrayBufferLike>,
	desiredFormat: keyof FormatEnum | AvailableFormatInfo,
	width: number,
	height: number,
	degree: number
): Promise<{
	success: boolean;
	message: string;
	data?: Buffer;
}> => {
	try {
		const data = await sharp(fileBuffer)
			.resize(width, height)
			.rotate(degree)
			.toFormat(desiredFormat)
			.toBuffer();
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
