<template>
  <section class="how-to-order">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Cara Pemesanan</h2>
        <p class="section-description">
          Pesan makanan favorit Anda dengan mudah dalam 4 langkah sederhana
        </p>
      </div>

      <div class="steps-grid">
        <Card v-for="(step, index) in steps" :key="index" class="step-card">
          <template #header>
            <div class="step-icon-wrapper">
              <div class="step-number">{{ index + 1 }}</div>
              <i :class="step.icon" class="step-icon"></i>
            </div>
          </template>
          
          <template #title>
            {{ step.title }}
          </template>
          
          <template #content>
            <p class="step-description">{{ step.description }}</p>
          </template>
        </Card>
      </div>

      <div class="cta-section">
        <Message severity="success" :closable="false">
          <template #icon>
            <i class="pi pi-check-circle"></i>
          </template>
          Mudah, cepat, dan praktis! Mulai pesan sekarang juga.
        </Message>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import Message from 'primevue/message';

const steps = [
  {
    icon: 'pi pi-user-plus',
    title: 'Daftar/Login',
    description: 'Buat akun baru atau login dengan akun yang sudah ada untuk mulai memesan.'
  },
  {
    icon: 'pi pi-building',
    title: 'Pilih Kantin',
    description: 'Jelajahi kantin-kantin yang tersedia dan pilih kantin favorit Anda.'
  },
  {
    icon: 'pi pi-shopping-cart',
    title: 'Pesan Menu',
    description: 'Pilih menu yang Anda inginkan, tambahkan ke keranjang, dan checkout.'
  },
  {
    icon: 'pi pi-check',
    title: 'Ambil Pesanan',
    description: 'Lakukan pembayaran di kantin dan ambil pesanan Anda yang sudah siap.'
  }
];
</script>

<style scoped>
.how-to-order {
  padding: 5rem 2rem;
  background: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.5rem;
}

.section-description {
  font-size: 1.125rem;
  color: #6b7280;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

:deep(.step-card) {
  text-align: center;
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
  position: relative;
  overflow: visible;
}

:deep(.step-card:hover) {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(34, 197, 94, 0.15);
  border-color: #22c55e;
}

:deep(.step-card .p-card-header) {
  padding: 2rem 1rem 1rem;
}

:deep(.step-card .p-card-body) {
  padding: 0 1.5rem 1.5rem;
}

:deep(.step-card .p-card-title) {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.step-icon-wrapper {
  position: relative;
  display: inline-block;
}

.step-number {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.step-icon {
  font-size: 3rem;
  color: #22c55e;
  display: block;
}

.step-description {
  color: #6b7280;
  line-height: 1.6;
  font-size: 0.9375rem;
}

.cta-section {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

:deep(.p-message) {
  font-size: 1rem;
  font-weight: 500;
}

:deep(.p-message .p-message-icon) {
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .how-to-order {
    padding: 3rem 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .section-header {
    margin-bottom: 2rem;
  }

  .steps-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .step-icon {
    font-size: 2.5rem;
  }
}
</style>
