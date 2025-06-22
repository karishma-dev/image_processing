import fs from "fs";
import sharp from "sharp";

export const flipImageService = async (
	inputPath: string,
	outputPath: string
): Promise<{
	success: boolean;
	message: string;
}> => {
	const fileBuffer = fs.readFileSync(inputPath);

	sharp(fileBuffer)
		.flip() // Flip the image vertically
		.toBuffer()
		.then((data) => {
			fs.writeFileSync(outputPath, data);
			return {
				success: true,
				message: "Image flipped successfully",
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
