resource "aws_iam_role" "iam_for_lambda" {
  name = "simple-lambda-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_lambda_function" "google_aws_user_sync" {
  filename = var.lambda_function_source_zip_file_path
  function_name = "google-to-aws-user-provision"
  role = aws_iam_role.iam_for_lambda.arn
  handler = "exports.test"
  source_code_hash = filebase64sha256(var.lambda_function_source_zip_file_path)
  runtime = "nodejs12.x"

  environment {
    variables = {
      AWS_SCIM_TOKEN = var.aws_scim_token
      AWS_SCIM_URL = var.aws_scim_url
      GOOGLE_AUTHENTICATION_SUBJECT = var.google_authentication_subject
      GOOGLE_SERVICE_ACCOUNT_BASE64_KEY_FILE = var.google_base64_encoded_key_file
      GOOGLE_APP_ORGANISATION_ID = var.google_app_organisation_id
    }
  }
}

/*resource "aws_cloudwatch_event_rule" "trigger_aws_user_sync" {
  name        = "trigger-google-aws-user-sync"
  description = "Capture each AWS Console Sign In"

  event_pattern = <<EOF
{
  "detail-type": [
    "AWS Console Sign In via CloudTrail"
  ]
}
EOF
}

resource "aws_cloudwatch_event_target" "sns" {
  rule      = aws_cloudwatch_event_rule.console.name
  target_id = "SendToSNS"
  arn       = aws_sns_topic.aws_logins.arn
}*/
