// Here is where we are defining
// our Terraform settings
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  cloud {
    organization = "Barbell"
    workspaces {
      name = "barbell-monorepo"
    }
  }

  required_version = ">= 1.2.0"
}

// Here we are configuring our aws provider.
// We are setting the region to the region of
// our variable "aws_region"
provider "aws" {
  region = var.aws_region
}
