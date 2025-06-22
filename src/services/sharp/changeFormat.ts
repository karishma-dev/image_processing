import fs from "fs";
import sharp, { AvailableFormatInfo, FormatEnum } from "sharp";

export const changeImageFormatService = async (
	inputPath: string,
	outputPath: string,
	desiredFormat: keyof FormatEnum | AvailableFormatInfo
): Promise<{
	success: boolean;
	message: string;
}> => {
	const fileBuffer = fs.readFileSync(inputPath);

	sharp(fileBuffer)
		.toFormat(desiredFormat)
		.toBuffer()
		.then((data) => {
			fs.writeFileSync(outputPath, data);
			return {
				success: true,
				message: "Image resized successfully",
			};
		})
		.catch((err) => {
			return {
				success: false,
				message: err.message,
			};
		});

	return {
		success: false,
		message: "Something went wrong",
	};
};
