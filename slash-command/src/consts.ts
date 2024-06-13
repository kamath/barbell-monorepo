import { getSecret } from "./utils/aws"

type Environment = 'DEVELOPMENT' | 'PROD'
export const INIT_MODAL_NAME = "Barbell cURL"
export const INIT_ACTION_ID = "INIT_BARBELL_CURL__ID__UNIQUE"

export const ENVIRONMENT: Environment = process.env.ENVIRONMENT as Environment || "DEVELOPMENT"
export const SLACK_SECRETS = await getSecret("slack_global_" + ENVIRONMENT, "us-east-1") as {
	SLACK_OAUTH_TOKEN: string
}