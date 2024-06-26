include .env

DEFAULT_AWS_REGION=us-east-1
PROJECT=main-backend
PROJECT_PATH=barbell
DOCKERFILE_PATH=barbell

BACKEND_AWS_ECR_REPO=${PROJECT}-ecr-repo
ECS_CLUSTER=${PROJECT}-ecs-cluster
ECS_SERVICE=${PROJECT}-service

init:
	cd iac && terraform init

plan: init
	cd iac && terraform plan -var-file=secrets.tfvars

apply: init
	cd iac && terraform apply -var-file=secrets.tfvars
	cd iac && terraform output -raw ecs_task_definition_json > task_definition.json

run:
	cd ${PROJECT_PATH} && bun run dev
	
run-ngrok:
	ngrok http --domain=${NGROK_URL} 3000

build:
	cd ${DOCKERFILE_PATH} && docker build -t ${BACKEND_AWS_ECR_REPO} . --platform=linux/amd64

deploy-ecr: build
	aws ecr get-login-password --region ${DEFAULT_AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${DEFAULT_AWS_REGION}.amazonaws.com
	docker tag ${BACKEND_AWS_ECR_REPO}:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${DEFAULT_AWS_REGION}.amazonaws.com/${BACKEND_AWS_ECR_REPO}:latest
	docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${DEFAULT_AWS_REGION}.amazonaws.com/${BACKEND_AWS_ECR_REPO}:latest

deploy: deploy-ecr
	aws ecs update-service --cluster ${ECS_CLUSTER} --service ${ECS_SERVICE} --force-new-deployment --region ${DEFAULT_AWS_REGION}

run-docker: build
	docker run -d -p 3000:3000 ${BACKEND_AWS_ECR_REPO}