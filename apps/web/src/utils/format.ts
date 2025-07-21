
export function getNameInitials(name: string) {
	const parts = name.trim().split(' ').filter(part => part.length > 0);
	if (parts.length === 0) return '';
	if (parts.length === 1) return parts[0].charAt(0);
	return parts[0].charAt(0) + parts[1].charAt(0);
}
