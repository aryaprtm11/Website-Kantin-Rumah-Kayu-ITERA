resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "kantin-repo-tf"
  description   = "Docker repository for Kantin App"
  format        = "DOCKER"

  depends_on = [google_project_service.apis]
}
