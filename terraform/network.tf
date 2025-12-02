# VPC Network
resource "google_compute_network" "vpc_network" {
  name                    = "kantin-network"
  auto_create_subnetworks = false
  depends_on              = [google_project_service.apis]
}

# Subnet for the region
resource "google_compute_subnetwork" "subnet" {
  name          = "kantin-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc_network.id
}

# Serverless VPC Access Connector
resource "google_vpc_access_connector" "connector" {
  name          = "kantin-connector"
  region        = var.region
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.vpc_network.name
  depends_on    = [google_project_service.apis]
}

# Private IP for Cloud SQL
resource "google_compute_global_address" "private_ip_address" {
  name          = "kantin-db-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc_network.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}
