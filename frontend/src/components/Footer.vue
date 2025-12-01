<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">🏠 Kantin RK ITERA</h3>
          <p class="footer-description">
            Platform pemesanan makanan dan minuman untuk mahasiswa dan civitas akademika ITERA.
          </p>
          <div class="social-links">
            <a href="#" class="social-link">📘</a>
            <a href="#" class="social-link">📷</a>
            <a href="#" class="social-link">🐦</a>
          </div>
        </div>

        <div class="footer-section">
          <h4 class="footer-heading">Menu Cepat</h4>
          <ul class="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#tenants">Kantin</a></li>
            <li><a href="#about">Tentang Kami</a></li>
            <li><a href="#contact">Kontak</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4 class="footer-heading">Informasi</h4>
          <ul class="footer-links">
            <li><a href="#">Cara Pemesanan</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Kebijakan Privasi</a></li>
            <li><a href="#">Syarat & Ketentuan</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4 class="footer-heading">Hubungi Kami</h4>
          <ul class="footer-contact">
            <li>📍 Kampus ITERA, Lampung Selatan</li>
            <li>📧 info@kantinrk.itera.ac.id</li>
            <li>📱 +62 812 3456 7890</li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2025 Kantin Rumah Kayu ITERA. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  color: white;
  padding: 3rem 0 1rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  margin-bottom: 2rem;
}

.footer-section {
  animation: fadeIn 0.8s ease-out;
}

.footer-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.footer-description {
  color: #cbd5e0;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  text-decoration: none;
  font-size: 1.2rem;
  transition: all 0.3s;
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.footer-heading {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.footer-links,
.footer-contact {
  list-style: none;
  padding: 0;
}

.footer-links li,
.footer-contact li {
  margin-bottom: 0.8rem;
}

.footer-links a {
  color: #cbd5e0;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: white;
}

.footer-contact li {
  color: #cbd5e0;
  line-height: 1.8;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  text-align: center;
  color: #cbd5e0;
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
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>



