// Test script to reproduce the createDriverUser 500 error
const testDriverCreation = async () => {
	try {
		console.log("Testing createDriverUser endpoint...");

		const response = await fetch(
			"http://localhost:3000/trpc/admin.createDriverUser",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					email: "test-driver@example.com",
					name: "Test Driver",
					password: "changeme",
				}),
			},
		);

		console.log("Response status:", response.status);
		console.log("Response headers:", Object.fromEntries(response.headers));

		const responseText = await response.text();
		console.log("Response body:", responseText);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${responseText}`);
		}

		const data = JSON.parse(responseText);
		console.log("Parsed response:", data);
	} catch (error) {
		console.error("Test failed:", error.message);
		console.error("Full error:", error);
	}
};

testDriverCreation();
