resource "aws_dynamodb_table" "chat_messages" {
  name         = "ChatMessages"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "MessageId"

  attribute {
    name = "MessageId"
    type = "S" // String 타입
  }


  // 기타 필요한 설정 추가...
}


resource "aws_dynamodb_table" "user_connections" {
  name         = "UsesrConnection"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "MessageId"


  attribute {
    name = "MessageId"
    type = "S" // String 타입
  }

  // 기타 필요한 설정 추가...
}
