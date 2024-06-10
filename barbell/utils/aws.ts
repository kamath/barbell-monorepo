// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

import {
	SecretsManagerClient,
	GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { AWS_REGION } from "../consts";

export async function getSecret(secretName: string): Promise<string | undefined> {
	const client = new SecretsManagerClient({
		region: AWS_REGION,
	});

	let response;

	try {
		response = await client.send(
			new GetSecretValueCommand({
				SecretId: secretName,
				VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
			})
		);
	} catch (error) {
		// For a list of exceptions thrown, see
		// https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
		throw error;
	}

	const secret = response.SecretString;
	return secret;
}