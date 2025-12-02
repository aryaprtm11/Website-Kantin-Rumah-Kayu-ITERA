variable "project_id" {
  description = "The Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "The Google Cloud region"
  type        = string
  default     = "asia-southeast2"
}

variable "db_password" {
  description = "The password for the database user"
  type        = string
  sensitive   = true
}

variable "app_key" {
  description = "Laravel APP_KEY"
  type        = string
  sensitive   = true
}

variable "backend_image" {
  description = "Docker image URL for the backend"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder default
}

variable "frontend_image" {
  description = "Docker image URL for the frontend"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder default
}
