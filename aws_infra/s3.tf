resource "aws_s3_bucket" "s3_app" {
  bucket = "project-app-prod-silla" # 여기서 버킷 이름을 지정합니다.

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  # 정적 웹 호스팅을 위한 설정
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_ownership_controls" "s3_app_owner" {
  bucket = aws_s3_bucket.s3_app.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "s3_app_access_block" {
  bucket = aws_s3_bucket.s3_app.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "s3_app_acl" {
  depends_on = [
    aws_s3_bucket_ownership_controls.s3_app_owner,
    aws_s3_bucket_public_access_block.s3_app_access_block,
  ]

  bucket = aws_s3_bucket.s3_app.id
  acl    = "public-read"
}
