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

resource "aws_api_gateway_resource" "stream_resource" {
  rest_api_id = aws_api_gateway_rest_api.stream_api.id
  parent_id   = aws_api_gateway_rest_api.stream_api.root_resource_id
  path_part   = "Stream"
}

resource "aws_api_gateway_method" "stream_get_method" {
  rest_api_id   = aws_api_gateway_rest_api.stream_api.id
  resource_id   = aws_api_gateway_resource.stream_resource.id
  http_method   = "GET"
  authorization = "NONE"
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
      "cognito-idp:*",
    ]

    resources = [
      "*"
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
resource "aws_iam_role_policy_attachment" "lambda_stream" {
  role       = aws_iam_role.stream_role.name
  policy_arn = aws_iam_policy.stream_policy_iam.arn
}
