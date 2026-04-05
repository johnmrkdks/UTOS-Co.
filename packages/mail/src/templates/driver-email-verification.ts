import type { EmailTemplate } from "../types";

export function generateDriverEmailVerificationTemplate(
	driverName: string,
	verificationUrl: string,
	adminContactEmail = "contact@utosandco.com",
): EmailTemplate {
	return {
		subject: "Verify Your Email - Utos & Co. Driver Account",
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Verify Your Driver Account Email</title>
			</head>
			<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
				<div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
					<div style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 40px 20px; text-align: center;">
						<h1 style="color: white; margin: 0; font-size: 28px;">Email Verification Required</h1>
						<p style="color: #cccccc; margin: 10px 0 0 0; font-size: 16px;">Utos & Co. Driver Portal</p>
					</div>
					<div style="padding: 40px 20px;">
						<h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Welcome, ${driverName}!</h2>
						<p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
							Your driver account has been created by our admin team. To complete your account setup and begin the onboarding process, please verify your email address.
						</p>
						
						<div style="background-color: #e8f4f8; border-left: 4px solid #1a1a1a; padding: 20px; margin: 30px 0;">
							<h3 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">🔐 Security Notice</h3>
							<p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
								This email verification ensures the security of your account and enables us to send you important updates about your driver status and bookings.
							</p>
						</div>

						<div style="text-align: center; margin: 30px 0;">
							<a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
								Verify Email Address
							</a>
						</div>

						<div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 30px 0;">
							<h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">What Happens Next?</h3>
							<ol style="color: #666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
								<li><strong>Verify your email</strong> by clicking the button above</li>
								<li><strong>Complete your driver profile</strong> with personal information</li>
								<li><strong>Upload required documents</strong> (license, insurance, background check)</li>
								<li><strong>Wait for admin approval</strong> of your application</li>
								<li><strong>Start accepting bookings</strong> once approved!</li>
							</ol>
						</div>

						<div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 30px 0;">
							<p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
								<strong>⏰ Time Sensitive:</strong> This verification link will expire in 24 hours. If you need a new verification email, please contact our admin team.
							</p>
						</div>

						<div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
							<h4 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">Need Help?</h4>
							<p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
								If you have questions about the driver onboarding process or need assistance, contact our admin team at:
								<br><strong>Email:</strong> <a href="mailto:${adminContactEmail}" style="color: #1a1a1a;">${adminContactEmail}</a>
							</p>
						</div>

						<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
						
						<p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0;">
							This email was sent to verify your driver account with Utos & Co. If you did not request this account, please ignore this email or contact our support team.
						</p>
					</div>
				</div>
			</body>
			</html>
		`,
	};
}
