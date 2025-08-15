import type { EmailTemplate } from "../types";

export function generatePasswordResetTemplate(
	resetToken: string,
	baseUrl: string
): EmailTemplate {
	const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

	return {
		subject: "Reset Your Down Under Chauffeur Password",
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Reset Your Password</title>
			</head>
			<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
				<div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
					<div style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 40px 20px; text-align: center;">
						<h1 style="color: white; margin: 0; font-size: 28px;">Down Under Chauffeur</h1>
						<p style="color: #cccccc; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
					</div>
					<div style="padding: 40px 20px;">
						<h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
						<p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
							We received a request to reset your password. Click the button below to create a new password.
						</p>
						<div style="text-align: center; margin: 30px 0;">
							<a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
								Reset Password
							</a>
						</div>
						<p style="color: #999; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
							If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
						</p>
						<p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
							If the button doesn't work, copy and paste this link into your browser:<br>
							<a href="${resetUrl}" style="color: #666; word-break: break-all;">${resetUrl}</a>
						</p>
					</div>
				</div>
			</body>
			</html>
		`,
	};
}