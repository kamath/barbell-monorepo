variable "environments" {
  type    = list(string)
  default = ["DEVELOPMENT", "PROD"]
}

resource "aws_secretsmanager_secret" "slack_global" {
  for_each    = toset(var.environments)
  name        = "slack_global_${each.key}"
  description = "Slack global secrets for ${each.key} purposes"
  tags        = { "Environment" = each.key }
}

resource "aws_secretsmanager_secret" "solaris_garage" {
  for_each    = toset(var.environments)
  name        = "solaris_garage_${each.key}"
  description = "Solaris garage secrets for ${each.key} purposes"
  tags        = { "Environment" = each.key }
}

resource "aws_secretsmanager_secret" "bolt_secrets" {
  for_each    = toset(var.environments)
  name        = "bolt_secrets_${each.key}"
  description = "Bolt secrets for ${each.key} purposes"
  tags        = { "Environment" = each.key }
}
