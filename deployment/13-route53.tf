# Get Hosted Zone from AWS Route53 that already created
data "aws_route53_zone" "main" {
  name         = var.main_api_server_domain
  private_zone = false
}
