# Creating an ACM certificate for HTTPS
resource "aws_acm_certificate" "bolt_cert" {
  domain_name       = "bolt-backend.barbell.dev"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "bolt_cert" {
  certificate_arn = aws_acm_certificate.bolt_cert.arn
}


# Creating a load balancer
resource "aws_alb" "bolt-backend-lb" {
  name               = "bolt-backend-lb" # Naming our load balancer
  load_balancer_type = "application"
  subnets            = [for subnet in aws_subnet.main_backend_public_subnet : subnet.id] # Use public subnets
  idle_timeout       = 300                                                               # Setting the idle timeout to 400 seconds
  # Referencing the security group
  security_groups = [aws_security_group.alb_sg.id]
}

# Creating a target group for the load balancer
resource "aws_lb_target_group" "bolt-backend-target_group" {
  name        = "bolt-backend-target"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main_backend_vpc.id # Referencing the VPC
  health_check {
    matcher = "200,301,302"
    path    = "/"
    port    = 3000
  }
}

# Creating a listener for the load balancer
resource "aws_lb_listener" "bolt-backend-listener" {
  load_balancer_arn = aws_alb.bolt-backend-lb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate.bolt_cert.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.bolt-backend-target_group.arn
  }
}

# Creating an ECR repository
resource "aws_ecr_repository" "bolt-backend-ecr" {
  name                 = "bolt-backend-ecr-repo" # Naming the repository
  force_delete         = true                    # allowing to delete the repository even if it contains an image
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_cloudwatch_log_group" "bolt-backend-log-group" {
  name = "/ecs/bolt-backend-ecs-task"
}

# Creating an ECS cluster
resource "aws_ecs_cluster" "bolt-backend-ecs-cluster" {
  name = "bolt-backend-ecs-cluster" # Naming the cluster
}

# Creating the task definition
resource "aws_ecs_task_definition" "bolt-backend-ecs-task" {
  family = "bolt-backend-ecs-task"
  container_definitions = jsonencode(
    [
      {
        "name" : "bolt-backend-ecr-container",
        "image" : "${aws_ecr_repository.bolt-backend-ecr.repository_url}:latest",
        "environment" : [
          {
            "name" : "ECS_ENABLE_CONTAINER_METADATA",
            "value" : "true"
          }
        ],
        "essential" : true,
        "portMappings" : [
          {
            "containerPort" : 3000,
            "hostPort" : 3000
          }
        ],
        "memory" : 1024,
        "cpu" : 512,
        "logConfiguration" : {
          "logDriver" : "awslogs",
          "options" : {
            "awslogs-group" : "${aws_cloudwatch_log_group.bolt-backend-log-group.name}",
            "awslogs-region" : var.aws_region,
            "awslogs-stream-prefix" : "ecs"
          }
        }
      }
    ],
  )
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = 1024
  cpu                      = 512
  execution_role_arn       = aws_iam_role.ecsTaskExecutionRole.arn
  task_role_arn            = aws_iam_role.ecsTaskExecutionRole.arn
}

output "bolt_backend_ecs_task_definition_json" {
  value = jsonencode({
    family                  = aws_ecs_task_definition.bolt-backend-ecs-task.family,
    containerDefinitions    = jsondecode(aws_ecs_task_definition.bolt-backend-ecs-task.container_definitions),
    requiresCompatibilities = aws_ecs_task_definition.bolt-backend-ecs-task.requires_compatibilities,
    networkMode             = aws_ecs_task_definition.bolt-backend-ecs-task.network_mode,
    memory                  = aws_ecs_task_definition.bolt-backend-ecs-task.memory,
    cpu                     = aws_ecs_task_definition.bolt-backend-ecs-task.cpu,
    executionRoleArn        = aws_ecs_task_definition.bolt-backend-ecs-task.execution_role_arn,
    taskRoleArn             = aws_ecs_task_definition.bolt-backend-ecs-task.task_role_arn,
  })
}

# Creating the service
resource "aws_ecs_service" "bolt-backend-service" {
  name            = "bolt-backend-service"
  cluster         = aws_ecs_cluster.bolt-backend-ecs-cluster.id
  task_definition = aws_ecs_task_definition.bolt-backend-ecs-task.arn
  launch_type     = "FARGATE"
  desired_count   = 1
  depends_on      = [aws_lb_listener.bolt-backend-listener]

  load_balancer {
    target_group_arn = aws_lb_target_group.bolt-backend-target_group.arn
    container_name   = "bolt-backend-ecr-container"
    container_port   = 3000
  }

  network_configuration {
    subnets          = [for subnet in aws_subnet.main_backend_private_subnet : subnet.id] # Use private subnets
    assign_public_ip = false                                                              # ECS tasks do not need public IPs; they are accessed via the ALB
    security_groups  = [aws_security_group.ecs_tasks_sg.id]                               # Update to a new or existing SG configured for RDS access
  }
}
