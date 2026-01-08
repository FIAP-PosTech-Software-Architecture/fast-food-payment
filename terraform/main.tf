# ===========================
# TEMPLATE TERRAFORM PARA LAMBDAS
# ===========================
# 
# Este template pode ser usado para:
# - fast-food-order (conecta com RDS order)
# - fast-food-payment (conecta com RDS payment)  
# - fast-food-cook-to-order (conecta com DynamoDB)
#
# Ajuste apenas a variável service_type e database_type

# ===========================
# DATA SOURCES - AWS RESOURCES
# ===========================

# Data source para usar a LabRole existente
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# Data source para RDS Payment (apenas para este serviço)
data "aws_db_instance" "fastfood_payment" {
  db_instance_identifier = "fastfood-payment-db"
}

# Data source para VPC padrão
data "aws_vpc" "existing" {
  default = true
}

# Subnets específicas para Lambda (se necessário VPC deployment)
data "aws_subnet" "fastfood_subnet_1a" {
  id = "subnet-0f244c624d019846b"  # us-east-1a
}

data "aws_subnet" "fastfood_subnet_1b" {
  id = "subnet-02ec0d1778295e935"  # us-east-1b
}

# Data source para buscar o security group do RDS criado no db-infra
data "aws_security_group" "rds_mysql" {
  filter {
    name   = "tag:Name"
    values = ["fastfood-rds-security-group"]
  }
  filter {
    name   = "tag:Component"
    values = ["database"]
  }
}

# ===========================
# SECURITY GROUP FOR LAMBDA
# ===========================

# Security Group para Lambda acessar RDS
resource "aws_security_group" "lambda_rds" {
  name_prefix = "fastfood-lambda-rds-payment-"
  vpc_id      = data.aws_vpc.existing.id
  description = "Security group para Lambda acessar RDS Payment"

  # Saída para DNS resolution (necessário para resolver nomes RDS)
  egress {
    description = "DNS resolution"
    from_port   = 53
    to_port     = 53
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Saída para HTTPS (para downloads de dependências se necessário)
  egress {
    description = "HTTPS outbound"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "fastfood-lambda-rds-payment"
    Service = "payment"
    Component = "security-group"
    ManagedBy = "terraform"
  }
}

# Regra adicional para permitir acesso do Lambda ao RDS
resource "aws_security_group_rule" "lambda_to_rds_mysql" {
  type                     = "ingress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.lambda_rds.id
  security_group_id        = data.aws_security_group.rds_mysql.id
  description              = "Allow Lambda Payment to connect to RDS MySQL"
}

# Regra de egress do Lambda para RDS
resource "aws_security_group_rule" "lambda_rds_egress" {
  type                     = "egress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  source_security_group_id = data.aws_security_group.rds_mysql.id
  security_group_id        = aws_security_group.lambda_rds.id
  description              = "Allow Lambda Payment to reach RDS MySQL"
}

# ===========================
# LOCALS
# ===========================

# Locals para configurações dinâmicas
locals {
  function_name = "fast-food-payment"
  api_name      = "fast-food-payment-api"
  
  # Environment variables para RDS Payment
  database_config = {
    DB_HOST     = data.aws_db_instance.fastfood_payment.address
    DB_PORT     = "3306"
    DB_NAME     = "fastfood_payment"
    DB_USER     = "admin"
    DB_PASSWORD = "admin123"
  }
}

# Lambda Function
resource "aws_lambda_function" "main" {
  filename         = var.lambda_filename
  function_name    = var.lambda_function_name
  role            = data.aws_iam_role.lab_role.arn
  handler         = var.lambda_handler
  source_code_hash = filebase64sha256(var.lambda_filename)
  runtime         = var.lambda_runtime
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory_size

  environment {
    variables = local.database_config
  }

  # VPC configuration para acessar RDS
  vpc_config {
    subnet_ids         = [data.aws_subnet.fastfood_subnet_1a.id, data.aws_subnet.fastfood_subnet_1b.id]
    security_group_ids = [aws_security_group.lambda_rds.id]
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda_logs
  ]
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.lambda_function_name}"
  retention_in_days = 14
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "main" {
  name        = var.api_gateway_name
  description = "API Gateway for ${var.service_type} service"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# API Gateway Resource
resource "aws_api_gateway_resource" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = var.api_resource_path
}

# Health check resource
resource "aws_api_gateway_resource" "health" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.main.id
  path_part   = "health"
}

# API Gateway Resource for proxy paths (ANY method support)
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.main.id
  path_part   = "{proxy+}"
}

# API Gateway Method
resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

# API Gateway Method for root resource
resource "aws_api_gateway_method" "proxy_root" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.main.id
  http_method   = "ANY"
  authorization = "NONE"
}

# API Gateway Integration
resource "aws_api_gateway_integration" "lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_method.proxy.resource_id
  http_method = aws_api_gateway_method.proxy.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.main.invoke_arn
}

# API Gateway Integration for root resource
resource "aws_api_gateway_integration" "lambda_root" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_method.proxy_root.resource_id
  http_method = aws_api_gateway_method.proxy_root.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.main.invoke_arn
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.main.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "main" {
  depends_on = [
    aws_api_gateway_integration.lambda,
    aws_api_gateway_integration.lambda_root,
    aws_api_gateway_integration.health_get
  ]

  rest_api_id = aws_api_gateway_rest_api.main.id
  stage_name  = var.environment

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.proxy.id,
      aws_api_gateway_method.proxy.id,
      aws_api_gateway_integration.lambda.id,
      aws_api_gateway_method.proxy_root.id,
      aws_api_gateway_integration.lambda_root.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# ===========================
# HEALTH CHECK ENDPOINT
# ===========================

# Health check GET method
resource "aws_api_gateway_method" "health_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.health.id
  http_method   = "GET"
  authorization = "NONE"
}

# Health check integration
resource "aws_api_gateway_integration" "health_get" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.health.id
  http_method = aws_api_gateway_method.health_get.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.main.invoke_arn
}

# ===========================
# CORS CONFIGURATION
# ===========================
resource "aws_api_gateway_method" "options_proxy" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_proxy" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.options_proxy.http_method

  type = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "options_proxy" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.options_proxy.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options_proxy" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.options_proxy.http_method
  status_code = aws_api_gateway_method_response.options_proxy.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}