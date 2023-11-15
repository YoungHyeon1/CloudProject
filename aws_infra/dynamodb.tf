resource "aws_dynamodb_table" "chat_messages" {
  name           = "ChatMessages"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "MessageId"
  range_key      = "Timestamp" // 정렬 키로 사용될 필드

  attribute {
    name = "MessageId"
    type = "S" // String 타입
  }

  attribute {
    name = "Timestamp"
    type = "N" // Number 타입
  }

  // 기타 필요한 설정 추가...
}
