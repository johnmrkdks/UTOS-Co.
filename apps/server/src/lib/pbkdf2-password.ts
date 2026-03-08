/**
 * PBKDF2 password hashing for Cloudflare Workers.
 * Uses Web Crypto API - no Node.js crypto, stays within free tier CPU limits.
 * Format: "pbkdf2$saltHex:hashHex" (prefix distinguishes from scrypt hashes).
 */
const PBKDF2_ITERATIONS = 100_000; // Max allowed by Cloudflare's crypto.subtle
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

export async function hashPasswordPbkdf2(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
	const encoder = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		encoder.encode(password),
		{ name: "PBKDF2" },
		false,
		["deriveBits"],
	);
	const derived = await crypto.subtle.deriveBits(
		{
			name: "PBKDF2",
			salt,
			iterations: PBKDF2_ITERATIONS,
			hash: "SHA-256",
		},
		keyMaterial,
		KEY_LENGTH * 8,
	);
	const hash = new Uint8Array(derived);
	const saltHex = Array.from(salt)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	const hashHex = Array.from(hash)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return `pbkdf2$${saltHex}:${hashHex}`;
}

export async function verifyPasswordPbkdf2({
	password,
	hash,
}: {
	password: string;
	hash: string;
}): Promise<boolean> {
	if (!hash.startsWith("pbkdf2$")) return false;
	const rest = hash.slice(7);
	const colon = rest.indexOf(":");
	if (colon === -1) return false;
	const saltHex = rest.slice(0, colon);
	const storedHashHex = rest.slice(colon + 1);
	const saltMatch = saltHex.match(/.{1,2}/g);
	if (!saltMatch || saltMatch.length !== SALT_LENGTH) return false;
	const salt = new Uint8Array(saltMatch.map((b) => parseInt(b, 16)));
	const encoder = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		encoder.encode(password),
		{ name: "PBKDF2" },
		false,
		["deriveBits"],
	);
	const derived = await crypto.subtle.deriveBits(
		{
			name: "PBKDF2",
			salt,
			iterations: PBKDF2_ITERATIONS,
			hash: "SHA-256",
		},
		keyMaterial,
		KEY_LENGTH * 8,
	);
	const attemptHash = new Uint8Array(derived);
	const attemptHex = Array.from(attemptHash)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return timingSafeEqualHex(storedHashHex, attemptHex);
}

function timingSafeEqualHex(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0;
}
