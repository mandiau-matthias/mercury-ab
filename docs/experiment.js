export const experiment = {
	key: "signup-v1",
	status: "running",
	variants: [
		{ key: "control", weight: 50 },
		{ key: "invitation", weight: 50 },
	],
};
export const labels = {
	control: "Create an account",
	invitation: "Get my invitation",
};
