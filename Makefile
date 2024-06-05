include .env

DEFAULT_AWS_REGION=us-east-1
BACKEND_AWS_ECR_REPO=main-backend-ecr-repo
ECS_CLUSTER=main-backend-ecs-cluster
ECS_SERVICE=main-backend-service

init:
	cd iac && terraform init

plan: init
	cd iac && terraform plan -var-file=secrets.tfvars

apply: init
	cd iac && terraform apply -var-file=secrets.tfvars

run:
	cd barbell && bun run --hot src/index.ts

build:
	cd barbell && docker build -t ${BACKEND_AWS_ECR_REPO} . --platform=linux/amd64

deploy-ecr: build
	aws ecr get-login-password --region ${DEFAULT_AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${DEFAULT_AWS_REGION}.amazonaws.com
	docker tag ${BACKEND_AWS_ECR_REPO}:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${DEFAULT_AWS_REGION}.amazonaws.com/${BACKEND_AWS_ECR_REPO}:latest
	docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${DEFAULT_AWS_REGION}.amazonaws.com/${BACKEND_AWS_ECR_REPO}:latest

deploy: deploy-ecr
	aws ecs update-service --cluster ${ECS_CLUSTER} --service ${ECS_SERVICE} --force-new-deployment --region ${DEFAULT_AWS_REGION}

