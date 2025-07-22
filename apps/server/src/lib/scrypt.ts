import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Custom scrypt configuration with reduced CPU intensity
const SCRYPT_OPTIONS = {
	N: 16384,    // CPU/memory cost parameter (default is usually 32768)
	r: 8,        // Block size parameter
	p: 1,        // Parallelization parameter
	keylen: 32,  // Desired key length
	saltlen: 16, // Salt length
};

export async function customHash(password: string): Promise<string> {
	try {
		// Generate a random salt
		const salt = randomBytes(SCRYPT_OPTIONS.saltlen);

		// Hash the password with scrypt
		const derivedKey = await scryptAsync(
			password,
			salt,
			SCRYPT_OPTIONS.keylen
		) as Buffer;

		// Combine salt and derived key, encode as base64
		const combined = Buffer.concat([salt, derivedKey]);
		return combined.toString('base64');
	} catch (error) {
		throw new Error('Failed to hash password');
	}
}

export async function customVerify({ password, hash }: { password: string; hash: string }): Promise<boolean> {
	try {
		// Decode the hash
		const combined = Buffer.from(hash, 'base64');

		// Extract salt and stored key
		const salt = combined.subarray(0, SCRYPT_OPTIONS.saltlen);
		const storedKey = combined.subarray(SCRYPT_OPTIONS.saltlen);

		// Hash the provided password with the same salt
		const derivedKey = await scryptAsync(
			password,
			salt,
			SCRYPT_OPTIONS.keylen
		) as Buffer;

		// Use timing-safe comparison
		return timingSafeEqual(storedKey, derivedKey);
	} catch (error) {
		return false;
	}
}
