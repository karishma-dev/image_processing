import nodemailer from "nodemailer";

const nodemailerConfig = {
	service: process.env.SMTP_SERVICE || "gmail",
	secure: process.env.SMTP_SECURE === "true",
	auth: {
		user: process.env.SMTP_USER || "",
		pass: process.env.SMTP_PASS || "",
	},
};

const transporter = nodemailer.createTransport(nodemailerConfig);

export const sendEmail = async (
	to: string,
	subject: string,
	html: string
): Promise<void> => {
	transporter
		.sendMail({
			from: process.env.SMTP_FROM,
			to,
			subject,
			html,
		})
		.catch((error) => {
			console.error("Error sending email:", error);
			throw new Error("Failed to send email");
		});
};
