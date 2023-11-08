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

# S3 버킷에 대한 정책 설정
resource "aws_s3_bucket_policy" "s3_app_policy" {
  bucket = aws_s3_bucket.s3_app.bucket

  policy = file("policy_file/s3_policy.json")
}
resource "aws_s3_bucket_ownership_controls" "s3_app_owners" {
  bucket = aws_s3_bucket.s3_app.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}



resource "aws_s3_bucket_acl" "s3_app_acl" {
  depends_on = [aws_s3_bucket_ownership_controls.s3_app_owners]

  bucket = aws_s3_bucket.s3_app.id
  acl    = "public-read"
}