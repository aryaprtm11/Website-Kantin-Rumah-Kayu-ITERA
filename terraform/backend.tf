resource "google_cloud_run_v2_service" "backend" {
  name     = "kantin-backend-tf"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "ALL_TRAFFIC"
    }

    containers {
      image = var.backend_image
      
      ports {
        container_port = 8080
      }

      env {
        name  = "APP_KEY"
        value = var.app_key
      }
      env {
        name  = "APP_DEBUG"
        value = "false"
      }
      env {
        name  = "LOG_CHANNEL"
        value = "stderr"
      }
      env {
        name  = "DB_CONNECTION"
        value = "pgsql"
      }
      env {
        name  = "DB_HOST"
        value = google_sql_database_instance.instance.private_ip_address
      }
      env {
        name  = "DB_PORT"
        value = "5432"
      }
      env {
        name  = "DB_DATABASE"
        value = google_sql_database.database.name
      }
      env {
        name  = "DB_USERNAME"
        value = google_sql_user.users.name
      }
      env {
        name  = "DB_PASSWORD"
        value = var.db_password
      }
      env {
        name  = "FRONTEND_URL"
        value = "https://kantin-frontend-tf-..." # Akan diupdate setelah frontend deploy atau gunakan variable
      }
    }
  }

  depends_on = [google_sql_database_instance.instance]
}

# Allow unauthenticated access to backend
resource "google_cloud_run_service_iam_member" "backend_public" {
  location = google_cloud_run_v2_service.backend.location
  service  = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
