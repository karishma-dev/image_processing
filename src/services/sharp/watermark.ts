// // watermark logic here
// const fileBuffer = fs.readFileSync(file.path);

// const waterMarkImageFromBody = files?.watermarkImage?.[0];
// if (!waterMarkImageFromBody) {
// 	res.status(400).json({ error: "No watermark image provided." });
// 	return;
// }

// const watermarkBuffer = fs.readFileSync(waterMarkImageFromBody.path);
// sharp(fileBuffer)
// 	.composite([{ input: watermarkBuffer, gravity: "southeast" }]) // Example position
// 	.toBuffer()
// 	.then((data) => {
// 		fs.unlinkSync(file.path); // Clean up the uploaded file

// 		// save the watermarked image to a new file or return it in the response
// 		const watermarkedFilePath = `uploads/watermarked-${file.originalname}`;
// 		fs.writeFileSync(watermarkedFilePath, data);

// 		res.status(200).json({
// 			message: "Image watermarked successfully.",
// 			file: {
// 				filename: file.originalname,
// 				size: data.length,
// 				mimetype: file.mimetype,
// 			},
// 		});
// 	})
// 	.catch((err) => {
// 		res
// 			.status(500)
// 			.json({ error: "Error applying watermark.", details: err.message });
// 	});
