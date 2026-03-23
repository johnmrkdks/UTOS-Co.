import type { EmailTemplate } from "../types";

export function generateDriverOnboardingTemplate(
	driverName: string,
	loginUrl: string,
	googleLinkingUrl?: string,
	adminContactEmail = "admin@downunderchauffeur.com",
): EmailTemplate {
	const googleLinkingSection = googleLinkingUrl
		? `
		<div style="background-color: #e8f5e8; border: 1px solid #c3e6c3; padding: 20px; border-radius: 5px; margin: 30px 0;">
			<h3 style="color: #2d5a2d; margin: 0 0 15px 0; font-size: 18px;">🔗 Optional: Link Your Google Account</h3>
			<p style="color: #2d5a2d; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
				For easier access and enhanced security, you can link your Google account to your driver profile. This will allow you to sign in using Google in the future.
			</p>
			<div style="text-align: center;">
				<a href="${googleLinkingUrl}" style="display: inline-block; background: #4285f4; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold; font-size: 14px;">
					Link Google Account
				</a>
			</div>
		</div>
	`
		: "";

	return {
		subject: "🚗 Complete Your Driver Onboarding - Down Under Chauffeur",
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Complete Your Driver Onboarding</title>
			</head>
			<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
				<div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
					<div style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 40px 20px; text-align: center;">
						<h1 style="color: white; margin: 0; font-size: 28px;">📧 Email Verified Successfully!</h1>
						<p style="color: #cccccc; margin: 10px 0 0 0; font-size: 16px;">Time to Complete Your Driver Profile</p>
					</div>
					<div style="padding: 40px 20px;">
						<h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Great Job, ${driverName}! 🎉</h2>
						<p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
							Your email has been successfully verified! Now it's time to complete your driver onboarding process to start accepting luxury chauffeur bookings.
						</p>

						<div style="text-align: center; margin: 30px 0;">
							<a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
								Complete Driver Profile
							</a>
						</div>

						${googleLinkingSection}

						<div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0;">
							<h3 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">📋 Your Onboarding Checklist</h3>
							
							<div style="margin: 20px 0;">
								<h4 style="color: #1a1a1a; margin: 0 0 10px 0; font-size: 16px;">✅ Step 1: Personal Information</h4>
								<ul style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 15px 20px;">
									<li>Full name and contact details</li>
									<li>Date of birth and address</li>
									<li>Emergency contact information</li>
									<li>Professional photo upload</li>
								</ul>
							</div>

							<div style="margin: 20px 0;">
								<h4 style="color: #1a1a1a; margin: 0 0 10px 0; font-size: 16px;">📄 Step 2: License Information</h4>
								<ul style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 15px 20px;">
									<li>Driver's license number and expiry date</li>
									<li>Upload clear photo of your license (front and back)</li>
									<li>Ensure license is valid for commercial driving</li>
								</ul>
							</div>

							<div style="margin: 20px 0;">
								<h4 style="color: #1a1a1a; margin: 0 0 10px 0; font-size: 16px;">🛡️ Step 3: Required Documents</h4>
								<ul style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 15px 20px;">
									<li><strong>Insurance Certificate:</strong> Valid commercial vehicle insurance</li>
									<li><strong>Background Check:</strong> Recent criminal background check report</li>
									<li><strong>Driving Record:</strong> Clean driving record from past 3 years</li>
								</ul>
							</div>

							<div style="margin: 20px 0;">
								<h4 style="color: #1a1a1a; margin: 0 0 10px 0; font-size: 16px;">⏰ Step 4: Admin Review & Approval</h4>
								<p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
									Our admin team will review your application within 2-3 business days. You'll receive an email notification once approved.
								</p>
							</div>
						</div>

						<div style="background-color: #e8f4f8; border-left: 4px solid #1a1a1a; padding: 20px; margin: 30px 0;">
							<h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">💰 What You'll Earn</h3>
							<ul style="color: #666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
								<li>Competitive hourly rates and trip-based earnings</li>
								<li>Luxury vehicle allowance and fuel reimbursement</li>
								<li>Performance bonuses for high ratings</li>
								<li>Flexible scheduling to fit your lifestyle</li>
								<li>Professional development and training opportunities</li>
							</ul>
						</div>

						<div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 30px 0;">
							<p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
								<strong>📞 Need Help?</strong> Our onboarding team is here to help! If you encounter any issues or have questions, contact us at <a href="mailto:${adminContactEmail}" style="color: #856404;">${adminContactEmail}</a>
							</p>
						</div>

						<div style="margin: 30px 0; text-align: center;">
							<h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Ready to Start Your Journey?</h3>
							<a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 5px; font-weight: bold; font-size: 16px; margin: 10px 0;">
								Begin Onboarding Process
							</a>
						</div>

						<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
						
						<p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0;">
							Welcome to Down Under Chauffeur! We're excited to have you join our team of professional drivers. This email was sent because your driver account was created by our admin team.
						</p>
					</div>
				</div>
			</body>
			</html>
		`,
	};
}
