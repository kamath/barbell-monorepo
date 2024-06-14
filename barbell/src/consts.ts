import { getSecret } from "./utils/aws"

export const ENVIRONMENT = process.env.ENVIRONMENT || "DEVELOPMENT"
export const AWS_SECRET = `solaris_garage_${ENVIRONMENT}`

export const { PARKING_CHANNEL_ID, JACOB_SLACK_ID, ALERT_CHANNEL_ID, MISSION_ST_SWITCH_URL, OTIS_ST_SWITCH_URL } = await getSecret(AWS_SECRET)