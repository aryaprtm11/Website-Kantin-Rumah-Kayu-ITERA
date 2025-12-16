<template>
  <section class="hero" id="home">
    <div class="hero-container">
      <div class="hero-content">
        <Chip label="Pesan Sekarang" icon="pi pi-bolt" class="hero-chip" />
        
        <h1 class="hero-title">
          Selamat Datang di<br />
          <span class="highlight">Kantin Rumah Kayu</span>
        </h1>
        
        <p class="hero-description">
          Pesan makanan dan minuman favorit Anda dengan mudah dan cepat. 
          Nikmati berbagai pilihan menu dari kantin-kantin terbaik di kampus ITERA.
        </p>
        
        <div class="hero-actions">
          <Button 
            label="Lihat Menu" 
            icon="pi pi-arrow-right" 
            iconPos="right"
            @click="handleViewMenu"
            size="large"
            rounded
          />
        </div>
        
        <div class="hero-stats">
          <Card v-for="stat in stats" :key="stat.label" class="stat-card">
            <template #content>
              <div class="stat-number">{{ stat.number }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </template>
          </Card>
        </div>
      </div>
      
      <div class="hero-image">
        <Image 
          :src="foodImage" 
          alt="Penyetan Malang" 
          preview
          class="food-img"
          @error="onImgError"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import Chip from 'primevue/chip';
import Image from 'primevue/image';
import foodImage from '../assets/Penyetan_Malang.jpeg';

const stats = [
  { number: '10+', label: 'Kantin' },
  { number: '50+', label: 'Menu' },
  { number: '1000+', label: 'Pesanan' },
];

const onImgError = () => {
  // Image error handled by PrimeVue Image component
};

const handleViewMenu = () => {
  document.getElementById('tenants')?.scrollIntoView({ behavior: 'smooth' });
};
</script>

<style scoped>
.hero {
  background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
  padding: 8rem 2rem 4rem;
  min-height: 80vh;
  display: flex;
  align-items: center;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-content {
  animation: fadeInUp 0.6s ease-out;
}

.hero-chip {
  margin-bottom: 1.5rem;
  background: #dcfce7;
  color: #16a34a;
  font-weight: 600;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 1.5rem;
  line-height: 1.1;
}

.highlight {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.7;
}

.hero-actions {
  margin-bottom: 3rem;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

:deep(.stat-card) {
  text-align: center;
  border: 1px solid #e5e7eb;
  box-shadow: none;
  transition: all 0.3s;
}

:deep(.stat-card:hover) {
  border-color: #22c55e;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1);
}

:deep(.stat-card .p-card-content) {
  padding: 1rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: #22c55e;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.hero-image {
  animation: fadeInUp 0.8s ease-out;
}

:deep(.food-img) {
  width: 100%;
  border-radius: 1rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
}

:deep(.food-img img) {
  border-radius: 1rem;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 2rem 1rem;
    min-height: auto;
  }

  .hero-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }
}
</style>

