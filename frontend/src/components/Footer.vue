<template>
  <footer class="footer">
    <Divider />
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <div class="footer-brand">
            <img src="/logo.png" alt="Kantin RK" class="brand-logo" />
            <div>
              <h3 class="footer-title">Kantin RK</h3>
              <p class="footer-subtitle">ITERA</p>
            </div>
          </div>
          <p class="footer-description">
            Platform pemesanan makanan dan minuman untuk mahasiswa dan civitas akademika ITERA.
          </p>
        </div>

        <div class="footer-section">
          <h4 class="footer-heading">Menu Cepat</h4>
          <ul class="footer-links">
            <li><a href="#home"><i class="pi pi-home"></i> Home</a></li>
            <li><a href="#tenants"><i class="pi pi-building"></i> Kantin</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4 class="footer-heading">Hubungi Kami</h4>
          <ul class="footer-contact">
            <li><i class="pi pi-map-marker"></i> Kampus ITERA, Lampung Selatan</li>
            <li><i class="pi pi-envelope"></i> info@kantinrk.itera.ac.id</li>
            <li><i class="pi pi-phone"></i> +62 812 3456 7890</li>
          </ul>
        </div>
      </div>

      <Divider />
      
      <div class="footer-bottom">
        <p>&copy; 2025 Kantin Rumah Kayu ITERA. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import Divider from 'primevue/divider';
</script>

<style scoped>
.footer {
  background: #ffffff;
  padding: 3rem 2rem 2rem;
  border-top: 1px solid #e5e7eb;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 2rem;
}

.footer-section {
  animation: fadeIn 0.8s ease-out;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.brand-logo {
  height: 48px;
  width: auto;
  object-fit: contain;
}

.footer-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1;
}

.footer-subtitle {
  font-size: 0.875rem;
  font-weight: 600;
  color: #22c55e;
  letter-spacing: 0.05em;
}

.footer-description {
  color: #6b7280;
  line-height: 1.6;
  font-size: 0.875rem;
}

.footer-heading {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
}

.footer-links,
.footer-contact {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li,
.footer-contact li {
  margin-bottom: 0.75rem;
}

.footer-links a {
  color: #6b7280;
  text-decoration: none;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.footer-links a:hover {
  color: #22c55e;
}

.footer-contact li {
  color: #6b7280;
  line-height: 1.8;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.footer-contact li i {
  color: #22c55e;
}

.footer-bottom {
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  padding-top: 1rem;
}

:deep(.p-divider) {
  margin: 2rem 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 2rem 1rem 1rem;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>



