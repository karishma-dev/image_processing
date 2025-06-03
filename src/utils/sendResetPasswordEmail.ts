import { sendEmail } from "./sendEmail";

const sendResetPasswordEmail = async (
	name: string,
	email: string,
	resetToken: string
): Promise<void> => {
	const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
	const html = `
        <p>Hi ${name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetURL}">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,</p>
        <p>Your Team</p>
    `;
	try {
		await sendEmail(email, "Password Reset Request", html);
	} catch (error) {
		console.error("Error sending reset password email:", error);
		throw new Error("Failed to send reset password email");
	}
};

export default sendResetPasswordEmail;
