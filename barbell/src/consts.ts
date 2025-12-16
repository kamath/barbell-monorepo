export const ENVIRONMENT = process.env.ENVIRONMENT || "DEVELOPMENT";
export const AWS_SECRET = `solaris_garage_${ENVIRONMENT}`;

export const PARKING_CHANNEL_ID = process.env.PARKING_CHANNEL_ID || "";
export const JACOB_SLACK_ID = process.env.JACOB_SLACK_ID || "";
export const ALERT_CHANNEL_ID = process.env.ALERT_CHANNEL_ID || "";
export const MISSION_ST_SWITCH_URL = process.env.MISSION_ST_SWITCH_URL || "";
export const OTIS_ST_SWITCH_URL = process.env.OTIS_ST_SWITCH_URL || "";
