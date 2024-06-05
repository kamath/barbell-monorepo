// This data object is going to be
// holding all the available availability
// zones in our defined region
data "aws_availability_zones" "available" {
  state = "available"
}

// Create a VPC named "main_backend_vpc"
resource "aws_vpc" "main_backend_vpc" {
  // Here we are setting the CIDR block of the VPC
  // to the "vpc_cidr_block" variable
  cidr_block = var.vpc_cidr_block
  // We want DNS hostnames enabled for this VPC
  enable_dns_hostnames = true

  // We are tagging the VPC with the name "mbe_vpc"
  tags = {
    Name = "mbe_vpc"
  }
}

// Create an internet gateway named "main_backend_igw"
// and attach it to the "main_backend_vpc" VPC
resource "aws_internet_gateway" "main_backend_igw" {
  // Here we are attaching the IGW to the
  // main_backend_vpc VPC
  vpc_id = aws_vpc.main_backend_vpc.id

  // We are tagging the IGW with the name main_backend_igw
  tags = {
    Name = "mbe_igw"
  }
}

// Create a group of public subnets based on the variable subnet_count.public
resource "aws_subnet" "main_backend_public_subnet" {
  // count is the number of resources we want to create
  // here we are referencing the subnet_count.public variable which
  // current assigned to 1 so only 1 public subnet will be created
  count = var.subnet_count.public

  // Put the subnet into the "main_backend_vpc" VPC
  vpc_id = aws_vpc.main_backend_vpc.id

  // We are grabbing a CIDR block from the "public_subnet_cidr_blocks" variable
  // since it is a list, we need to grab the element based on count,
  // since count is 1, we will be grabbing the first cidr block
  // which is going to be 10.0.1.0/24
  cidr_block = var.public_subnet_cidr_blocks[count.index]

  // We are grabbing the availability zone from the data object we created earlier
  // Since this is a list, we are grabbing the name of the element based on count,
  // so since count is 1, and our region is us-east-2, this should grab us-east-2a
  availability_zone = data.aws_availability_zones.available.names[count.index]

  // We are tagging the subnet with a name of "main_backend_public_subnet_" and
  // suffixed with the count
  tags = {
    Name = "mbe_public_subnet_${count.index}"
  }
}

// Create a group of private subnets based on the variable subnet_count.private
resource "aws_subnet" "main_backend_private_subnet" {
  // count is the number of resources we want to create
  // here we are referencing the subnet_count.private variable which
  // current assigned to 2, so 2 private subnets will be created
  count = var.subnet_count.private

  // Put the subnet into the "main_backend_vpc" VPC
  vpc_id = aws_vpc.main_backend_vpc.id

  // We are grabbing a CIDR block from the "private_subnet_cidr_blocks" variable
  // since it is a list, we need to grab the element based on count,
  // since count is 2, the first subnet will grab the CIDR block 10.0.101.0/24
  // and the second subnet will grab the CIDR block 10.0.102.0/24
  cidr_block = var.private_subnet_cidr_blocks[count.index]

  // We are grabbing the availability zone from the data object we created earlier
  // Since this is a list, we are grabbing the name of the element based on count,
  // since count is 2, and our region is us-east-2, the first subnet should
  // grab us-east-2a and the second will grab us-east-2b
  availability_zone = data.aws_availability_zones.available.names[count.index]

  // We are tagging the subnet with a name of "main_backend_private_subnet_" and
  // suffixed with the count
  tags = {
    Name = "mbe_private_subnet_${count.index}"
  }
}

// Create a public route table named "main_backend_public_rt"
resource "aws_route_table" "main_backend_public_rt" {
  // Put the route table in the "main_backend_vpc" VPC
  vpc_id = aws_vpc.main_backend_vpc.id

  // Since this is the public route table, it will need
  // access to the internet. So we are adding a route with
  // a destination of 0.0.0.0/0 and targeting the Internet
  // Gateway "main_backend_igw"
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main_backend_igw.id
  }
}

// Here we are going to add the public subnets to the
// "main_backend_public_rt" route table
resource "aws_route_table_association" "public" {
  // count is the number of subnets we want to associate with
  // this route table. We are using the subnet_count.public variable
  // which is currently 1, so we will be adding the 1 public subnet
  count = var.subnet_count.public

  // Here we are making sure that the route table is
  // "main_backend_public_rt" from above
  route_table_id = aws_route_table.main_backend_public_rt.id

  // This is the subnet ID. Since the "main_backend_public_subnet" is a
  // list of the public subnets, we need to use count to grab the
  // subnet element and then grab the id of that subnet
  subnet_id = aws_subnet.main_backend_public_subnet[count.index].id
}

resource "aws_eip" "main_backend_web_eip_nat" {
  vpc = true

  tags = {
    Name = "mbe_web_eip_nat"
  }
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.main_backend_web_eip_nat.id
  subnet_id     = aws_subnet.main_backend_public_subnet[0].id

  tags = {
    Name = "mbe_nat_gateway"
  }
}

// Create a private route table named "main_backend_private_rt"
resource "aws_route_table" "main_backend_private_rt" {
  // Put the route table in the "main_backend_VPC" VPC
  vpc_id = aws_vpc.main_backend_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }
}

// Here we are going to add the private subnets to the
// route table "main_backend_private_rt"
resource "aws_route_table_association" "private" {
  // count is the number of subnets we want to associate with
  // the route table. We are using the subnet_count.private variable
  // which is currently 2, so we will be adding the 2 private subnets
  count = var.subnet_count.private

  // Here we are making sure that the route table is
  // "main_backend_private_rt" from above
  route_table_id = aws_route_table.main_backend_private_rt.id

  // This is the subnet ID. Since the "main_backend_private_subnet" is a
  // list of private subnets, we need to use count to grab the
  // subnet element and then grab the ID of that subnet
  subnet_id = aws_subnet.main_backend_private_subnet[count.index].id
}

// Create a security for the EC2 instances called "main_backend_web_sg"
resource "aws_security_group" "main_backend_web_sg" {
  // Basic details like the name and description of the SG
  name        = "main_backend_web_sg"
  description = "Security group for main_backend web servers"
  // We want the SG to be in the "main_backend_vpc" VPC
  vpc_id = aws_vpc.main_backend_vpc.id

  // The first requirement we need to meet is "EC2 instances should
  // be accessible anywhere on the internet via HTTP." So we will
  // create an inbound rule that allows all traffic through
  // TCP port 80.
  ingress {
    description = "Allow all traffic through HTTP"
    from_port   = "80"
    to_port     = "80"
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  // The second requirement we need to meet is "Only you should be
  // "able to access the EC2 instances via SSH." So we will create an
  // inbound rule that allows SSH traffic ONLY from your IP address
  ingress {
    description = "Allow SSH from my computer"
    from_port   = "22"
    to_port     = "22"
    protocol    = "tcp"
    cidr_blocks = ["${var.my_ip}/32"]
  }

  ingress {
    description     = "Allow HTTPS from ALB"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  // This outbound rule is allowing all outbound traffic
  // with the EC2 instances
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  // Here we are tagging the SG with the name "main_backend_web_sg"
  tags = {
    Name = "mbe_web_sg"
  }
}

// Create a security group for the RDS instances called "main_backend_db_sg"
resource "aws_security_group" "main_backend_db_sg" {
  // Basic details like the name and description of the SG
  name        = "main_backend_db_sg"
  description = "Security group for main_backend databases"
  // We want the SG to be in the "main_backend_vpc" VPC
  vpc_id = aws_vpc.main_backend_vpc.id

  // The third requirement was "RDS should be on a private subnet and
  // inaccessible via the internet." To accomplish that, we will
  // not add any inbound or outbound rules for outside traffic.

  // The fourth and finally requirement was "Only the EC2 instances
  // should be able to communicate with RDS." So we will create an
  // inbound rule that allows traffic from the EC2 security group
  // through TCP port 3306, which is the port that MySQL
  // communicates through
  ingress {
    description     = "Allow PostgreSQL traffic from only the web sg"
    from_port       = "5432"
    to_port         = "5432"
    protocol        = "tcp"
    security_groups = [aws_security_group.main_backend_web_sg.id]
  }

  ingress {
    description     = "Allow PostgreSQL traffic from ECS tasks"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks_sg.id]
  }

  ingress {
    description     = "Allow PostgreSQL traffic from Main Backend Integrations Lambdas"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.integration_lambda_sg.id]
  }

  ingress {
    description     = "Allow PostgreSQL traffic from ALB"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    description = "Allow PostgreSQL traffic from Hex"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["3.129.36.245/32", "3.18.79.139/32", "3.13.16.99/32"]
  }

  // Here we are tagging the SG with the name "main_backend_db_sg"
  tags = {
    Name = "mbe_db_sg"
  }
}

# Security group for ALB allowing public access and access to RDS
resource "aws_security_group" "alb_sg" {
  name        = "alb-sg"
  description = "Allow public and RDS access"
  vpc_id      = aws_vpc.main_backend_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security group for ECS tasks allowing access to RDS
resource "aws_security_group" "ecs_tasks_sg" {
  name        = "ecs-tasks-sg"
  description = "Allow ECS access to RDS"
  vpc_id      = aws_vpc.main_backend_vpc.id

  ingress {
    description     = "Allow HTTPS traffic"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.main_backend_web_sg.id]
  }

  ingress {
    description     = "Allow traffic from ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "integration_lambda_sg" {
  name        = "lambda_sg"
  description = "Security group for Lambda function"
  vpc_id      = aws_vpc.main_backend_vpc.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Assuming the RDS security group allows inbound connections from this security group
  # Add additional rules as necessary
}


// Create a db subnet group named "main_backend_db_subnet_group"
resource "aws_db_subnet_group" "main_backend_db_subnet_group" {
  // The name and description of the db subnet group
  name        = "main_backend_db_subnet_group"
  description = "DB subnet group for MBE"

  // Since the db subnet group requires 2 or more subnets, we are going to
  // loop through our private subnets in "main_backend_private_subnet" and
  // add them to this db subnet group
  subnet_ids = [for subnet in aws_subnet.main_backend_private_subnet : subnet.id]
}

// Create an Elastic IP named "main_backend_web_eip" for each
// EC2 instance
resource "aws_eip" "main_backend_web_eip" {
  // count is the number of Elastic IPs to create. It is
  // being set to the variable settings.web_app.count which
  // refers to the number of EC2 instances. We want an
  // Elastic IP for every EC2 instance
  count = var.settings.web_app.count

  // The EC2 instance. Since main_backend_web is a list of
  // EC2 instances, we need to grab the instance by the
  // count index. Since the count is set to 1, it is
  // going to grab the first and only EC2 instance
  instance = aws_instance.main_backend_web[count.index].id

  // We want the Elastic IP to be in the VPC
  vpc = true

  // Here we are tagging the Elastic IP with the name
  // "main_backend_web_eip_" followed by the count index
  tags = {
    Name = "mbe_web_eip_${count.index}"
  }
}

# Based on S/O Answer here:
# https://stackoverflow.com/questions/61265108/aws-ecs-fargate-resourceinitializationerror-unable-to-pull-secrets-or-registry
resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id             = aws_vpc.main_backend_vpc.id
  service_name       = "com.amazonaws.${var.aws_region}.ecr.api"
  vpc_endpoint_type  = "Interface"
  subnet_ids         = [for subnet in aws_subnet.main_backend_private_subnet : subnet.id]
  security_group_ids = [aws_security_group.ecs_tasks_sg.id]
}

resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id             = aws_vpc.main_backend_vpc.id
  service_name       = "com.amazonaws.${var.aws_region}.ecr.dkr"
  vpc_endpoint_type  = "Interface"
  subnet_ids         = [for subnet in aws_subnet.main_backend_private_subnet : subnet.id]
  security_group_ids = [aws_security_group.ecs_tasks_sg.id]
}

resource "aws_vpc_endpoint" "secrets_manager" {
  vpc_id             = aws_vpc.main_backend_vpc.id
  service_name       = "com.amazonaws.${var.aws_region}.secretsmanager"
  vpc_endpoint_type  = "Interface"
  subnet_ids         = [for subnet in aws_subnet.main_backend_private_subnet : subnet.id]
  security_group_ids = [aws_security_group.ecs_tasks_sg.id]
}

resource "aws_vpc_endpoint" "ssm" {
  vpc_id             = aws_vpc.main_backend_vpc.id
  service_name       = "com.amazonaws.${var.aws_region}.ssm"
  vpc_endpoint_type  = "Interface"
  subnet_ids         = [for subnet in aws_subnet.main_backend_private_subnet : subnet.id]
  security_group_ids = [aws_security_group.ecs_tasks_sg.id]
}

resource "aws_cloudwatch_log_group" "mbe_vpc_flow_log_group" {
  name = "/aws/vpc/${aws_vpc.main_backend_vpc.id}/flow-logs"
}

resource "aws_flow_log" "vpc_flow_log" {
  log_destination      = aws_cloudwatch_log_group.mbe_vpc_flow_log_group.arn
  iam_role_arn         = aws_iam_role.vpc_flow_log_role.arn
  vpc_id               = aws_vpc.main_backend_vpc.id
  traffic_type         = "ALL"
  log_destination_type = "cloud-watch-logs"
}
