# Lambda 함수 리소스
resource "aws_lambda_function" "ivs_lambda" {
  filename      = "lambda_file/ivs_status_handler.zip"
  function_name = "ivs_status_change"
  role          = aws_iam_role.eb_role.arn
  handler       = "ivs_status_handler.ivs_status_handler"
  runtime       = "python3.8"
}

# IAM 역할
data "aws_iam_policy_document" "eb_role_document" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

# EventBridge 규칙
resource "aws_cloudwatch_event_rule" "ivs_event_rule" {
  name        = "ivs-event-rule"
  description = "Trigger on IVS broadcast status change"

  event_pattern = jsonencode({
    "source" : ["aws.ivs"],
    "detail-type" : ["IVS Stream State Change"]
  })
}

data "aws_iam_policy_document" "ivs_eb_policy_document" {
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
      "dynamodb:DeleteItem"
    ]

    resources = [
      "*",
      aws_dynamodb_table.cognito_ivs_integration.arn
    ]
  }
}


resource "aws_iam_policy" "eb_policy_iam" {
  name        = "lambda_eventbridge_policy"
  path        = "/"
  description = "IAM policy for event bridge a lambda"
  policy      = data.aws_iam_policy_document.ivs_eb_policy_document.json
}

resource "aws_iam_role" "eb_role" {
  name               = "EventBridgeLambda"
  assume_role_policy = data.aws_iam_policy_document.eb_role_document.json
}


# EventBridge 규칙과 Lambda 함수 연결
resource "aws_cloudwatch_event_target" "ivs_lambda_target" {
  rule      = aws_cloudwatch_event_rule.ivs_event_rule.name
  target_id = "TargetFunction"
  arn       = aws_lambda_function.ivs_lambda.arn
}

# Lambda 권한
resource "aws_lambda_permission" "allow_cloudwatch_to_call" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ivs_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.ivs_event_rule.arn
}

resource "aws_cloudwatch_log_group" "lambda_ivs_eb_group" {
  name              = "/aws/lambda/${aws_lambda_function.ivs_lambda.function_name}"
  retention_in_days = 14
}

resource "aws_iam_role_policy_attachment" "lambda_eb_ivs" {
  role       = aws_iam_role.eb_role.name
  policy_arn = aws_iam_policy.eb_policy_iam.arn
}
