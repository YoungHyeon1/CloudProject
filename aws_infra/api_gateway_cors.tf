# 권한부여자 접근시 Preflight Request를 위한 CORS 설정 입니다.
# Option 베이스에 동작합니다.
resource "aws_api_gateway_method" "options_method" {
  rest_api_id   = aws_api_gateway_rest_api.stream_api.id
  resource_id   = aws_api_gateway_resource.stream_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Option 베이스에 접근시 200 응답을 내려주기 위한 설정입니다.
resource "aws_api_gateway_method_response" "response_200" {
  rest_api_id = aws_api_gateway_rest_api.stream_api.id
  resource_id = aws_api_gateway_resource.stream_resource.id
  http_method = aws_api_gateway_method.options_method.http_method
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

# option과 연결되는 integration 설정입니다.
resource "aws_api_gateway_integration" "options_integration" {
  rest_api_id          = aws_api_gateway_rest_api.stream_api.id
  resource_id          = aws_api_gateway_resource.stream_resource.id
  http_method          = aws_api_gateway_method.options_method.http_method
  type                 = "MOCK"
  passthrough_behavior = "WHEN_NO_MATCH"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# option과 연결되는 integration response 설정입니다.
resource "aws_api_gateway_integration_response" "integration_response_options" {
  rest_api_id = aws_api_gateway_rest_api.stream_api.id
  resource_id = aws_api_gateway_resource.stream_resource.id
  http_method = aws_api_gateway_method.options_method.http_method
  status_code = aws_api_gateway_method_response.response_200.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Methods" = "'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}
