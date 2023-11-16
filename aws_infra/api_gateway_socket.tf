resource "aws_apigatewayv2_api" "chat" {
  name                       = "chat-websocket-api"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}


# 람다, Cloud Watch

resource "aws_lambda_function" "send_lambda" {
  filename         = "lambda_file/send_chat_handler.zip"
  function_name    = "sendChat"
  role             = aws_iam_role.role.arn
  handler          = "send_chat_handler.send_chat_handler"
  runtime          = "python3.8"
  source_code_hash = filebase64sha256("lambda_file/send_chat_handler.zip")
}


resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.send_lambda.function_name}"
  retention_in_days = 14
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.role.name
  policy_arn = aws_iam_policy.lambda_logging.arn
}

data "aws_iam_policy_document" "lambda_logging" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "dynamodb:PutItem",
      "dynamodb:GetItem",
      "dynamodb:UpdateItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "dynamodb:DeleteItem",
      "execute-api:ManageConnections"
    ]

    resources = [
      "arn:aws:logs:*:*:*",
      aws_dynamodb_table.chat_messages.arn,
      aws_dynamodb_table.user_connections.arn,
      "arn:aws:execute-api:ap-northeast-2:652832981770:o0p8o0v62i/*/*/@connections/*"
    ]
  }

}


resource "aws_iam_policy" "lambda_logging" {
  name        = "lambda_logging"
  path        = "/"
  description = "IAM policy for logging from a lambda"
  policy      = data.aws_iam_policy_document.lambda_logging.json
}

#통합설정

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.chat.id
  integration_type = "AWS_PROXY"

  connection_type           = "INTERNET"
  content_handling_strategy = "CONVERT_TO_TEXT"
  description               = "Lambda example"
  integration_method        = "POST"
  integration_uri           = aws_lambda_function.send_lambda.invoke_arn
  passthrough_behavior      = "WHEN_NO_MATCH"
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


# Routing Setting
resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.chat.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"

}
resource "aws_apigatewayv2_route" "send" {
  api_id    = aws_apigatewayv2_api.chat.id
  route_key = "send_chat"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"

}

resource "aws_apigatewayv2_route" "connect" {
  api_id    = aws_apigatewayv2_api.chat.id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"

}

resource "aws_apigatewayv2_route" "disconnect" {
  api_id    = aws_apigatewayv2_api.chat.id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"

}

###########################################################



data "aws_iam_policy_document" "gateway_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "gateway_loging" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
      "logs:PutLogEvents",
      "logs:GetLogEvents",
      "logs:FilterLogEvents",
      "execute-api:Invoke"
    ]

    resources = ["*"]
  }
}

resource "aws_iam_role" "cloudwatch" {
  name               = "api_gateway_cloudwatch"
  assume_role_policy = data.aws_iam_policy_document.gateway_role.json
}

resource "aws_iam_role_policy" "gateway_iam" {
  name   = "gateway_iam_default"
  role   = aws_iam_role.cloudwatch.id
  policy = data.aws_iam_policy_document.gateway_loging.json
}



resource "aws_api_gateway_account" "gateway_count" {
  cloudwatch_role_arn = aws_iam_role.cloudwatch.arn
}


resource "aws_cloudwatch_log_group" "socket_gateway_log" {
  name              = "API-Gateway-Execution-Logs_${aws_apigatewayv2_api.chat.id}/dev"
  retention_in_days = 7
  # ... potentially other configuration ...
}
# 스테이지(배포)
resource "aws_apigatewayv2_stage" "dev_stage" {
  api_id      = aws_apigatewayv2_api.chat.id
  name        = "dev"
  auto_deploy = true


  default_route_settings {
    data_trace_enabled       = true   // 데이터 추적 활성화
    logging_level            = "INFO" // 로그 레벨 설정
    detailed_metrics_enabled = true
    throttling_burst_limit   = 10
    throttling_rate_limit    = 10
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.socket_gateway_log.arn
    format          = "{\"requestId\":\"$context.requestId\", \"ip\":\"$context.identity.sourceIp\", \"requestTime\":\"$context.requestTime\", \"httpMethod\":\"$context.httpMethod\", \"routeKey\":\"$context.routeKey\", \"status\":\"$context.status\", \"protocol\":\"$context.protocol\", \"responseLength\":\"$context.responseLength\", \"Error\":\"$context.integrationErrorMessage\"}"
  }

  depends_on = [aws_cloudwatch_log_group.socket_gateway_log]

}

resource "aws_lambda_permission" "api_gateway_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.send_lambda.arn
  principal     = "apigateway.amazonaws.com"

  // API Gateway의 소스 ARN은 선택적이며, 특정 API 또는 스테이지에 대한 권한을 제한하는 데 사용할 수 있습니다.
}

resource "aws_apigatewayv2_authorizer" "socket_authorizer" {
  api_id           = aws_apigatewayv2_api.chat.id
  authorizer_type  = "REQUEST"
  authorizer_uri   = aws_lambda_function.send_lambda.invoke_arn
  identity_sources = ["route.request.header.Auth"]
  name             = "example-authorizer"
}


# 반환값
resource "aws_apigatewayv2_route_response" "default_response" {
  api_id             = aws_apigatewayv2_api.chat.id
  route_id           = aws_apigatewayv2_route.default.id
  route_response_key = "$default"
}
