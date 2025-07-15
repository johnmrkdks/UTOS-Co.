import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

const plugins = [adminClient()];

console.log(import.meta.env.VITE_SERVER_URL);

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_SERVER_URL,
	plugins,
});
