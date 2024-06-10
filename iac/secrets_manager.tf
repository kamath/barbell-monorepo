variable "environments" {
  type    = list(string)
  default = ["DEVELOPMENT", "PROD"]
}

resource "aws_secretsmanager_secret" "slack_verification_token" {
  for_each    = toset(var.environments)
  name        = "slack_verification_token_${each.key}"
  description = "Slack verification token secret for ${each.key} purposes"
  tags        = { "Environment" = each.key }
}

resource "aws_secretsmanager_secret" "send_webhook_url" {
  for_each    = toset(var.environments)
  name        = "send_webhook_url_${each.key}"
  description = "Send webhook URL secret for ${each.key} purposes"
  tags        = { "Environment" = each.key }
}

resource "aws_secretsmanager_secret" "slack_oauth_token" {
  for_each    = toset(var.environments)
  name        = "slack_oauth_token_${each.key}"
  description = "Slack OAuth token secret for ${each.key} purposes"
  tags        = { "Environment" = each.key }
}

resource "aws_secretsmanager_secret" "alert_channel_id" {
  for_each    = toset(var.environments)
  name        = "alert_channel_id_${each.key}"
  description = "Alert channel ID secret for ${each.key} purposes"
  tags        = { "Environment" = each.key }
}

resource "aws_secretsmanager_secret" "parking_channel_id" {
  for_each    = toset(var.environments)
  name        = "parking_channel_id_${each.key}"
  description = "Parking channel ID secret for ${each.key} purposes"
  tags        = { "Environment" = each.key }
}

resource "aws_secretsmanager_secret" "jacob_slack_id" {
  for_each    = toset(var.environments)
  name        = "jacob_slack_id_${each.key}"
  description = "Jacob Slack ID secret for ${each.key} purposes"
  tags        = { "Environment" = each.key }
}

resource "aws_secretsmanager_secret" "anirudh_slack_id" {
  for_each    = toset(var.environments)
  name        = "anirudh_slack_id_${each.key}"
  description = "Anirudh Slack ID secret for ${each.key} purposes"
  tags        = { "Environment" = each.key }
}
