/** Format distance - value is in kilometers (DB schema, quote service) */
export function formatDistanceKm(km: number | null | undefined): string {
	if (km == null || isNaN(km)) return "—";
	return `${Number(km).toFixed(1)} km`;
}

export function getNameInitials(name: string | undefined | null): string {
	if (!name) return '';

	const parts = name.trim().split(' ').filter(part => part.length > 0);
	if (parts.length === 0) return '';
	if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
	return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
