variable "lambda_function_source_zip_file_path" {
  type = string
  default = "dist-zip/package.zip"
}

variable "lambda_function_name" {
  type = string
  default = "google-to-aws-user-provision"
}

variable "google_base64_encoded_key_file" {
  type = string
}

variable "google_authentication_subject" {
  type = string
}

variable "google_app_organisation_id" {
  type = string
}

variable "aws_scim_token" {
  type = string
}

variable "aws_scim_url" {
  type = string
}

variable "aws_region" {
  type = string
}
