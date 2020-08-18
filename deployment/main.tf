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
  function_name = var.lambda_function_name
  role = aws_iam_role.iam_for_lambda.arn
  handler = "index.handler"
  source_code_hash = filebase64sha256(var.lambda_function_source_zip_file_path)
  runtime = "nodejs12.x"
  timeout = 300


  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_cloudwatch_log_group.create_user_sync_lambda_log_group,
  ]

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

resource "aws_cloudwatch_log_group" "create_user_sync_lambda_log_group" {
  name              = "/aws/lambda/${var.lambda_function_name}"
  retention_in_days = 14
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_cloudwatch_event_rule" "trigger_aws_user_sync" {
  name        = "trigger-google-aws-user-sync"
  description = "Trigger the google to AWS user provisioning lambda function"
  schedule_expression = "cron(0 2 * * ? *)"
}

resource "aws_cloudwatch_event_target" "trigger_google_to_aws_sync_lambda" {
  rule      = aws_cloudwatch_event_rule.trigger_aws_user_sync.name
  target_id = "trigger-google-aws-user-sync-lambda"
  arn       = aws_lambda_alias.trigger_latest_alias.arn
}

resource "aws_lambda_alias" "trigger_latest_alias" {
  name             = "latest-google-to-aws-lambda-alias"
  description      = "The latest version of the google aws user sync function"
  function_name    = aws_lambda_function.google_aws_user_sync.function_name
  function_version = "$LATEST"
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.google_aws_user_sync.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.trigger_aws_user_sync.arn
  qualifier     = aws_lambda_alias.trigger_latest_alias.name
}
