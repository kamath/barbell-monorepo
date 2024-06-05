// This variable is to set the
// AWS region that everything will be
// created in
variable "aws_region" {
  default = "us-east-1"
}

// This variable is to set the
// CIDR block for the VPC
variable "vpc_cidr_block" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

// This variable holds the
// number of public and private subnets
variable "subnet_count" {
  description = "Number of subnets"
  type        = map(number)
  default = {
    public  = 2,
    private = 2
  }
}

// This variable contains the configuration
// settings for the EC2 and RDS instances
variable "settings" {
  description = "Configuration settings"
  type        = map(any)
  default = {
    "database" = {
      allocated_storage   = 10             // storage in gigabytes
      engine              = "postgres"     // engine type
      engine_version      = "15.5"         // engine version
      instance_class      = "db.m5d.large" // rds instance type
      db_name             = "main_backend" // database name
      skip_final_snapshot = true
    },
    "web_app" = {
      count         = 1          // the number of EC2 instances
      instance_type = "t2.micro" // the EC2 instance
    }
  }
}

// This variable contains the CIDR blocks for
// the public subnet. I have only included 4
// for this main_backend, but if you need more you
// would add them here
variable "public_subnet_cidr_blocks" {
  description = "Available CIDR blocks for public subnets"
  type        = list(string)
  default = [
    "10.0.1.0/24",
    "10.0.2.0/24",
    "10.0.3.0/24",
    "10.0.4.0/24"
  ]
}

// This variable contains the CIDR blocks for
// the public subnet. I have only included 4
// for this main_backend, but if you need more you
// would add them here
variable "private_subnet_cidr_blocks" {
  description = "Available CIDR blocks for private subnets"
  type        = list(string)
  default = [
    "10.0.101.0/24",
    "10.0.102.0/24",
    "10.0.103.0/24",
    "10.0.104.0/24",
  ]
}

variable "ec2_public_key" {
  description = "The public key that will be used to SSH into the EC2 instances"
  type        = string
}

variable "my_ip" {
  description = "My IP"
  sensitive   = true
  type        = string
}

