# Variables
variable "myregion" {
  type        = string
  description = "ap-northeast-2"
}

variable "accountId" {
  type        = string
  description = "652832981770"
}

resource "aws_api_gateway_rest_api" "chat_api" {
  name        = "ChatAPI"
  description = "API for chat application"
}

resource "aws_api_gateway_resource" "chat_resource" {
  rest_api_id = aws_api_gateway_rest_api.chat_api.id
  parent_id   = aws_api_gateway_rest_api.chat_api.root_resource_id
  path_part   = "chat"
}

resource "aws_api_gateway_method" "chat_post_method" {
  rest_api_id   = aws_api_gateway_rest_api.chat_api.id
  resource_id   = aws_api_gateway_resource.chat_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "chat_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.chat_api.id
  resource_id = aws_api_gateway_resource.chat_resource.id
  http_method = aws_api_gateway_method.chat_post_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.chat_handler.invoke_arn
}


# Lambda
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.chat_handler.function_name
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:execute-api:${var.myregion}:${var.accountId}:${aws_api_gateway_rest_api.chat_api.id}/*/${aws_api_gateway_method.chat_post_method.http_method}${aws_api_gateway_resource.chat_resource.path}"
}

resource "aws_lambda_function" "chat_handler" {
  filename      = "lambda_file/chat_handler.zip"
  function_name = "ChatHandler"
  role          = aws_iam_role.role.arn
  handler       = "chat_handler.chat_handler"
  runtime       = "python3.7"

  source_code_hash = filebase64sha256("lambda_file/chat_handler.zip")
}

# IAM
data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "role" {
  name               = "ChatLambda"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}
