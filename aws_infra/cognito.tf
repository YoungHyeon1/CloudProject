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

  auto_verified_attributes = ["email"]
}


resource "aws_cognito_user_pool_client" "client" {
  name                = "stream-app-client"
  user_pool_id        = aws_cognito_user_pool.cognito_pool.id
  generate_secret     = false
  explicit_auth_flows = ["ADMIN_NO_SRP_AUTH", "USER_PASSWORD_AUTH"]
}
