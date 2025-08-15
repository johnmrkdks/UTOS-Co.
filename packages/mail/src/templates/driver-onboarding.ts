import type { EmailTemplate } from "../types";

export function generateDriverOnboardingTemplate(
	driverName: string,
	loginUrl: string
): EmailTemplate {
	return {
		subject: "Welcome to Down Under Chauffeur - Driver Access Approved!",
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Welcome to Our Driver Team</title>
			</head>
			<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
				<div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
					<div style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 40px 20px; text-align: center;">
						<h1 style="color: white; margin: 0; font-size: 28px;">Welcome to the Team!</h1>
						<p style="color: #cccccc; margin: 10px 0 0 0; font-size: 16px;">Down Under Chauffeur Driver Portal</p>
					</div>
					<div style="padding: 40px 20px;">
						<h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Welcome, ${driverName}!</h2>
						<p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
							Congratulations! Your driver application has been approved. You're now part of the Down Under Chauffeur family.
						</p>
						<p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
							You can now access your driver portal to:
						</p>
						<ul style="color: #666; font-size: 16px; line-height: 1.8; margin: 0 0 30px 20px;">
							<li>View and accept booking requests</li>
							<li>Update your availability</li>
							<li>Track your earnings</li>
							<li>Manage your profile and vehicle information</li>
						</ul>
						<div style="text-align: center; margin: 30px 0;">
							<a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
								Access Driver Portal
							</a>
						</div>
						<div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 30px 0;">
							<h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Next Steps:</h3>
							<ol style="color: #666; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
								<li>Log in to your driver portal</li>
								<li>Complete your profile setup</li>
								<li>Upload required documents</li>
								<li>Set your availability preferences</li>
								<li>Start accepting bookings!</li>
							</ol>
						</div>
						<p style="color: #999; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
							If you have any questions, please don't hesitate to contact our support team.
						</p>
					</div>
				</div>
			</body>
			</html>
		`,
	};
}