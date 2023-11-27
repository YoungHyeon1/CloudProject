# Variables
variable "myregion" {
  type        = string
  description = "Resion"
}

variable "accountId" {
  type        = string
  description = "AccountID"
}

resource "aws_api_gateway_rest_api" "stream_api" {
  name        = "StreamAPI"
  description = "API for Stream application"
}

#/public
resource "aws_api_gateway_resource" "RootPublicResource" {
  rest_api_id = aws_api_gateway_rest_api.stream_api.id
  parent_id   = aws_api_gateway_rest_api.stream_api.root_resource_id
  path_part   = "public"
}

#/stream
resource "aws_api_gateway_resource" "RootStreamResource" {
  rest_api_id = aws_api_gateway_rest_api.stream_api.id
  parent_id   = aws_api_gateway_rest_api.stream_api.root_resource_id
  path_part   = "stream"
}

#/{proxy+}
resource "aws_api_gateway_resource" "stream_resource" {
  rest_api_id = aws_api_gateway_rest_api.stream_api.id
  parent_id   = aws_api_gateway_resource.RootStreamResource.id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_resource" "public_stream_resource" {
  rest_api_id = aws_api_gateway_rest_api.stream_api.id
  parent_id   = aws_api_gateway_resource.RootPublicResource.id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "public_stream_get_method" {
  rest_api_id   = aws_api_gateway_rest_api.stream_api.id
  resource_id   = aws_api_gateway_resource.public_stream_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}


resource "aws_api_gateway_integration" "public_stream_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.stream_api.id
  resource_id = aws_api_gateway_resource.public_stream_resource.id
  http_method = aws_api_gateway_method.public_stream_get_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.public_stream_handler.invoke_arn
}

resource "aws_lambda_function" "public_stream_handler" {
  filename      = "lambda_file/public_stream_handler.zip"
  function_name = "PublicStreamHandler"
  role          = aws_iam_role.stream_role.arn
  handler       = "public_stream_handler.public_stream_handler"
  runtime       = "python3.8"

  source_code_hash = filebase64sha256("lambda_file/public_stream_handler.zip")
}

# ------------------------------

resource "aws_api_gateway_method" "stream_get_method" {
  rest_api_id   = aws_api_gateway_rest_api.stream_api.id
  resource_id   = aws_api_gateway_resource.stream_resource.id
  http_method   = "ANY"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito_authorizer.id
}

resource "aws_api_gateway_integration" "stream_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.stream_api.id
  resource_id = aws_api_gateway_resource.stream_resource.id
  http_method = aws_api_gateway_method.stream_get_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.stream_handler.invoke_arn
}


# Lambda
resource "aws_lambda_permission" "api_gw_rest_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stream_handler.function_name
  principal     = "apigateway.amazonaws.com"
  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:execute-api:${var.myregion}:${var.accountId}:${aws_api_gateway_rest_api.stream_api.id}/*/${aws_api_gateway_method.stream_get_method.http_method}${aws_api_gateway_resource.stream_resource.path}"
}

resource "aws_lambda_permission" "api_gw_rest_lambda_public" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.public_stream_handler.function_name
  principal     = "apigateway.amazonaws.com"
  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:execute-api:${var.myregion}:${var.accountId}:${aws_api_gateway_rest_api.stream_api.id}/*/${aws_api_gateway_method.public_stream_get_method.http_method}${aws_api_gateway_resource.public_stream_resource.path}"
}

resource "aws_lambda_function" "stream_handler" {
  filename      = "lambda_file/stream_handler.zip"
  function_name = "StreamHandler"
  role          = aws_iam_role.stream_role.arn
  handler       = "stream_handler.stream_handler"
  runtime       = "python3.8"

  source_code_hash = filebase64sha256("lambda_file/stream_handler.zip")
}

# IAM
data "aws_iam_policy_document" "stream_role_document" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "stream_policy_document" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "cognito-idp:ListUsers",
      "cognito-idp:ListUsers",
      "cognito-idp:AdminGetUser",
      "ivs:ListChannels",
      "ivs:ListStreams",
      "ivs:GetChannel",
      "ivschat:GetRoom",
      "dynamodb:PutItem",
      "dynamodb:GetItem",
      "dynamodb:UpdateItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:DeleteItem"
    ]

    resources = [
      "*",
      "arn:aws:ivs:ap-northeast-2:${var.accountId}:channel/*",
      "arn:aws:ivschat:ap-northeast-2:${var.accountId}:room/*",
      aws_dynamodb_table.cognito_ivs_integration.arn
    ]
  }
}

resource "aws_iam_policy" "stream_policy_iam" {
  name        = "lambda_stream_policy"
  path        = "/"
  description = "IAM policy for logging from a lambda"
  policy      = data.aws_iam_policy_document.stream_policy_document.json
}

resource "aws_iam_role" "stream_role" {
  name               = "StreamLambda"
  assume_role_policy = data.aws_iam_policy_document.stream_role_document.json
}

resource "aws_cloudwatch_log_group" "lambda_stream_group" {
  name              = "/aws/lambda/${aws_lambda_function.stream_handler.function_name}"
  retention_in_days = 14
}
resource "aws_cloudwatch_log_group" "lambda_public_stream_group" {
  name              = "/aws/lambda/${aws_lambda_function.public_stream_handler.function_name}"
  retention_in_days = 14
}
resource "aws_iam_role_policy_attachment" "lambda_stream" {
  role       = aws_iam_role.stream_role.name
  policy_arn = aws_iam_policy.stream_policy_iam.arn
}


resource "aws_api_gateway_deployment" "stream_api_deployment" {
  depends_on = [
    aws_api_gateway_integration.stream_lambda_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.stream_api.id
  stage_name  = "develop"
}
resource "aws_api_gateway_authorizer" "cognito_authorizer" {
  name            = "cognito_authorizer"
  type            = "COGNITO_USER_POOLS"
  rest_api_id     = aws_api_gateway_rest_api.stream_api.id
  identity_source = "method.request.header.Authorization"
  provider_arns   = [aws_cognito_user_pool.cognito_pool.arn]
}
