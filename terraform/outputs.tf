# Lambda Function outputs
output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.main.arn
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.main.function_name
}

output "lambda_function_invoke_arn" {
  description = "Invoke ARN of the Lambda function"
  value       = aws_lambda_function.main.invoke_arn
}

# API Gateway outputs
output "api_gateway_id" {
  description = "ID of the API Gateway"
  value       = aws_api_gateway_rest_api.main.id
}

output "api_gateway_url" {
  description = "URL of the API Gateway"
  value       = aws_api_gateway_deployment.main.invoke_url
}

output "api_gateway_endpoint" {
  description = "Full API Gateway endpoint with resource path"
  value       = "${aws_api_gateway_deployment.main.invoke_url}/${var.api_resource_path}"
}

output "api_gateway_stage_name" {
  description = "Stage name of the API Gateway deployment"
  value       = aws_api_gateway_deployment.main.stage_name
}

# CloudWatch Log Group
output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.lambda_logs.name
}

# RDS Database info (específico para payment)
output "rds_endpoint" {
  description = "RDS endpoint for payment database"
  value       = data.aws_db_instance.fastfood_payment.endpoint
  sensitive   = true
}

output "database_name" {
  description = "Database name"
  value       = "fastfood_payment"
}

# Environment variables (sensível por conter credenciais RDS)
output "environment_variables" {
  description = "Environment variables set in Lambda (excluding sensitive data)"
  value = {
    DB_NAME    = "fastfood_payment"
    DB_PORT    = "3306"
    NODE_ENV   = var.environment
  }
  sensitive = false
}

# S3 Deployment Bucket outputs
output "s3_deployment_bucket_name" {
  description = "Name of the S3 bucket used for Lambda deployment packages"
  value       = aws_s3_bucket.lambda_deployments.bucket
}

output "s3_deployment_bucket_arn" {
  description = "ARN of the S3 bucket used for Lambda deployment packages"
  value       = aws_s3_bucket.lambda_deployments.arn
}

output "lambda_package_s3_key" {
  description = "S3 key of the current Lambda deployment package"
  value       = aws_s3_object.lambda_package.key
}

output "deployment_method" {
  description = "Method used for Lambda deployment"
  value       = "S3 Upload - Always uses S3 regardless of package size"
}