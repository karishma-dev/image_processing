import fs from "fs";
import sharp from "sharp";

export const resizeImageService = async (
	inputPath: string,
	outputPath: string,
	width: number,
	height: number
): Promise<{
	success: boolean;
	message: string;
}> => {
	const fileBuffer = fs.readFileSync(inputPath);

	sharp(fileBuffer)
		.resize(width, height)
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
