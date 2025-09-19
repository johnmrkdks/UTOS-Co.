// Utility function to determine what authentication methods a user has
export interface AccountInfo {
	hasGoogleAccount: boolean;
	hasPasswordAccount: boolean;
	email?: string;
}

export const getAccountInfo = (session: any): AccountInfo => {
	if (!session?.user) {
		return {
			hasGoogleAccount: false,
			hasPasswordAccount: false,
		};
	}

	const user = session.user;
	const accounts = user.accounts || [];

	// Check for Google OAuth account
	const hasGoogleAccount = accounts.some((account: any) => account.providerId === 'google');

	// Check for credential (password) account
	const hasPasswordAccount = accounts.some((account: any) => account.providerId === 'credential');

	return {
		hasGoogleAccount,
		hasPasswordAccount,
		email: user.email,
	};
};