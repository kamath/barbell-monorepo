type Environment = "DEVELOPMENT" | "PROD";
export const INIT_MODAL_NAME = "Barbell cURL";
export const INIT_ACTION_ID = "SOME_ACTION";
export const ENVIRONMENT: Environment =
	(process.env.ENVIRONMENT as Environment) || "DEVELOPMENT";
export const SLACK_SECRETS = {
	SLACK_OAUTH_TOKEN: process.env.SLACK_OAUTH_TOKEN || "",
};
