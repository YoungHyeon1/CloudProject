resource "aws_dynamodb_table" "terraform_state_lock" {
  name           = "TerraformStateLock"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}


resource "aws_s3_bucket" "terraform-state" {
  bucket = "web.stream.silla.terraform.state"

  lifecycle {
    prevent_destroy = true
  }
}
