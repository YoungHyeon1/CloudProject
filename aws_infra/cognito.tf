resource "aws_cognito_user_pool" "cognito_pool" {
  name = "stream_web_pool"

  schema {
    name                = "email"
    required            = true
    attribute_data_type = "String"
    string_attribute_constraints {
      min_length = 6
      max_length = 256
    }
  }
  schema {
    name                = "chanelName"
    required            = false
    mutable             = true
    attribute_data_type = "String"
    string_attribute_constraints {
      min_length = 10
      max_length = 11
    }
  }
  schema {
    name                = "playbackUrl"
    required            = false
    mutable             = true
    attribute_data_type = "String"
    string_attribute_constraints {
      min_length = 6
      max_length = 256
    }
  }
  schema {
    name                = "streamKey"
    required            = false
    mutable             = true
    attribute_data_type = "String"
    string_attribute_constraints {
      min_length = 6
      max_length = 256
    }
  }
  lambda_config {
    post_confirmation = aws_lambda_function.lambda_cognito_trigger.arn
  }

  auto_verified_attributes = ["email"]
}


resource "aws_cognito_user_pool_client" "client" {
  name                = "stream-app-client"
  user_pool_id        = aws_cognito_user_pool.cognito_pool.id
  generate_secret     = false
  explicit_auth_flows = ["ADMIN_NO_SRP_AUTH", "USER_PASSWORD_AUTH"]
}



resource "aws_lambda_function" "lambda_cognito_trigger" {
  filename      = "lambda_file/create_room_handler.zip"
  function_name = "CognitoCreateIVSRoom"
  role          = aws_iam_role.cognito_update_role.arn
  handler       = "create_room_handler.create_room_handler"
  runtime       = "python3.8"

  // Lambda 함수의 코드가 포함된 ZIP 파일의 경로
  source_code_hash = filebase64sha256("lambda_file/create_room_handler.zip")
}

resource "aws_lambda_permission" "cognito_lambda" {
  statement_id  = "AllowExecutionFromCognito"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda_cognito_trigger.arn
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.cognito_pool.arn
  // API Gateway의 소스 ARN은 선택적이며, 특정 API 또는 스테이지에 대한 권한을 제한하는 데 사용할 수 있습니다.
}

data "aws_iam_policy_document" "lambda_ivs" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "ivs:CreateStage",
      "ivs:CreateParticipantToken",
      "ivs:GetStage",
      "ivs:GetStageSession",
      "ivs:ListStages",
      "ivs:ListStageSessions",
      "lambda:InvokeFunction",
      "ivs:CreateChannel",
      "cognito-idp:AdminUpdateUserAttributes"
    ]

    resources = [
      "*",
      aws_cognito_user_pool.cognito_pool.arn
    ]
  }

}

resource "aws_iam_policy" "lambda_ivs_iam" {
  name        = "lambda_ivs"
  path        = "/"
  description = "IAM policy for logging from a lambda"
  policy      = data.aws_iam_policy_document.lambda_ivs.json
}

data "aws_iam_policy_document" "cognito_update_role_doc" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "cognito_update_role" {
  name               = "CreateIVSRoom"
  assume_role_policy = data.aws_iam_policy_document.cognito_update_role_doc.json
}


resource "aws_cloudwatch_log_group" "lambda_cognito_group" {
  name              = "/aws/lambda/${aws_lambda_function.lambda_cognito_trigger.function_name}"
  retention_in_days = 14
}
resource "aws_iam_role_policy_attachment" "lambda_cognito" {
  role       = aws_iam_role.cognito_update_role.name
  policy_arn = aws_iam_policy.lambda_ivs_iam.arn
}
