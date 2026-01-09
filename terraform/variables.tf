variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "service_type" {
  description = "Service type: order, payment, or cook-to-order"
  type        = string
  default     = "payment"
  validation {
    condition     = contains(["order", "payment", "cook-to-order"], var.service_type)
    error_message = "Service type must be order, payment, or cook-to-order."
  }
}

variable "database_type" {
  description = "Database type: rds or dynamodb"
  type        = string
  default     = "rds"
  validation {
    condition     = contains(["rds", "dynamodb"], var.database_type)
    error_message = "Database type must be rds or dynamodb."
  }
}

# Lambda variables
variable "lambda_function_name" {
  description = "Name of the Lambda function"
  type        = string
  default     = "fast-food-payment"
}

variable "lambda_handler" {
  description = "Lambda function handler"
  type        = string
  default     = "index.handler"
}

variable "lambda_runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "nodejs18.x"
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 60
}

variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
  default     = 256
}

variable "lambda_filename" {
  description = "Path to the Lambda deployment package"
  type        = string
  default     = "../lambda-deployment.zip"
}

# API Gateway variables
variable "api_gateway_name" {
  description = "Name of the API Gateway"
  type        = string
  default     = "fast-food-payment-api"
}

variable "api_resource_path" {
  description = "API resource path (e.g., 'orders', 'payments', 'cook-to-order')"
  type        = string
  default     = "payments"
}