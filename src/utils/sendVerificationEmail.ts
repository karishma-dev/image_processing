import { sendEmail } from "./sendEmail";

const sendVerificationEmail = async (
	email: string,
	verificationToken: string
): Promise<void> => {
	const verificationURL = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
	const html = `
        <p>Hi,</p>
        <p>Thank you for registering. Please click the link below to verify your email address:</p>
        <p><a href="${verificationURL}">Verify Email</a></p>
        <p>If you did not register, please ignore this email.</p>
        <p>Best regards,</p>
        <p>Your Team</p>
    `;

	try {
		await sendEmail(email, "Email Verification", html);
	} catch (error) {
		console.error("Error sending verification email:", error);
		throw new Error("Failed to send verification email");
	}
};

export default sendVerificationEmail;
