import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
	...defaultStatements,
	booking: ["list", "create", "update", "delete", "cancel"],
	car: ["list", "create", "update", "delete"],
	rating: ["list", "create", "update", "delete"],
	package: ["list", "create", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const userRole = ac.newRole({
	booking: ["list", "create", "update", "cancel"],
	rating: ["list", "create", "update", "delete"],
	package: ["list"],
});

export const driverRole = ac.newRole({
	booking: ["list", "update"],
	car: ["list"],
	rating: ["list"],
	package: ["list"],
});

export const adminRole = ac.newRole({
	user: ["list", "ban", "impersonate", "delete", "set-password"],
	booking: ["list", "create", "update", "delete"],
	car: ["list", "create", "update", "delete"],
	rating: ["list", "create", "update", "delete"],
	package: ["list", "create", "update", "delete"],
});

export const superAdminRole = ac.newRole({
	user: [
		"create",
		"list",
		"set-role",
		"ban",
		"impersonate",
		"delete",
		"set-password",
	],
	booking: ["list", "create", "update", "delete"],
	car: ["list", "create", "update", "delete"],
	rating: ["list", "create", "update", "delete"],
	package: ["list", "create", "update", "delete"],
});
