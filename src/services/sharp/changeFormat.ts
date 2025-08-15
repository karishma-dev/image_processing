import sharp, { AvailableFormatInfo, FormatEnum } from "sharp";

export const changeImageFormatService = async (
	fileBuffer: Buffer<ArrayBufferLike>,
	desiredFormat: keyof FormatEnum | AvailableFormatInfo
): Promise<{
	success: boolean;
	message: string;
	data?: Buffer;
}> => {
	try {
		const data = await sharp(fileBuffer).toFormat(desiredFormat).toBuffer();
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
