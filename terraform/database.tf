resource "google_sql_database_instance" "instance" {
  name             = "kantin-db-instance-tf"
  region           = var.region
  database_version = "POSTGRES_17" # Menggunakan PostgreSQL sesuai setup terakhir

  depends_on = [google_service_networking_connection.private_vpc_connection]

  settings {
    tier = "db-f1-micro"
    
    ip_configuration {
      ipv4_enabled    = false # Disable Public IP for security (VPC only)
      private_network = google_compute_network.vpc_network.id
    }
  }

  deletion_protection = false # Set to true for production
}

resource "google_sql_database" "database" {
  name     = "kantin_db"
  instance = google_sql_database_instance.instance.name
}

resource "google_sql_user" "users" {
  name     = "postgres" # Default user
  instance = google_sql_database_instance.instance.name
  password = var.db_password
}
