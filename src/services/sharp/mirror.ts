import fs from "fs";
import sharp from "sharp";

export const mirrorImageService = async (
	inputPath: string,
	outputPath: string
): Promise<{
	success: boolean;
	message: string;
}> => {
	const fileBuffer = fs.readFileSync(inputPath);

	sharp(fileBuffer)
		.flop() // Flip the image vertically
		.toBuffer()
		.then((data) => {
			fs.writeFileSync(outputPath, data);
			return {
				success: true,
				message: "Image flopped successfully",
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
