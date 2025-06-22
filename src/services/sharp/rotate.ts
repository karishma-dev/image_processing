import fs from "fs";
import sharp from "sharp";

export const rotateImageService = async (
	inputPath: string,
	outputPath: string,
	degree: number
): Promise<{
	success: boolean;
	message: string;
}> => {
	const fileBuffer = fs.readFileSync(inputPath);

	sharp(fileBuffer)
		.rotate(degree)
		.toBuffer()
		.then((data) => {
			fs.writeFileSync(outputPath, data);
			return {
				success: true,
				message: "Image rotated successfully",
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
