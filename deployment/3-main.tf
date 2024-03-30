terraform {
  backend "s3" {
    bucket  = "chatty-application-terraform-state"
    key     = "develop/chattyapp.tfstate"
    region  = "ap-southeast-1"
    encrypt = true
  }
}

locals {
  prefix = "${var.prefix}-${terraform.workspace}"

  common_tags = {
    Environment = terraform.workspace
    Project     = var.project
    ManagedBy   = "Terraform"
    Owner       = "Joestar"
  }
}
