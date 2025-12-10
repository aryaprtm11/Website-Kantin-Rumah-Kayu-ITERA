<template>
  <section class="hero">
    <div class="hero-container">
      <div class="hero-content">
        <h1 class="hero-title">
          {{ HERO_TITLE }} <br />
          <span class="highlight">{{ HERO_HIGHLIGHT }}</span>
        </h1>
        <p class="hero-description">
          {{ HERO_DESCRIPTION }}
        </p>
        <div class="hero-buttons w-full">
          <button class="btn-hero-primary w-full" @click="handleViewMenu">
            🍽️ Lihat Menu
          </button>
        </div>
        <div class="hero-stats">
          <div 
            v-for="stat in stats" 
            :key="stat.label" 
            class="stat-item"
          >
            <div class="stat-number">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
      <div class="hero-image">
        <div class="image-placeholder">
          <span 
            v-for="(emoji, index) in foodEmojis" 
            :key="index" 
            class="emoji"
          >
            {{ emoji }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * HeroSection Component
 * Main hero/banner section with call-to-actions
 * Displays app title, description, stats, and illustration
 */

// Configuration
const HERO_TITLE = 'Selamat Datang di';
const HERO_HIGHLIGHT = 'Kantin Rumah Kayu ITERA';
const HERO_DESCRIPTION = 
  'Pesan makanan dan minuman favorit Anda dengan mudah dan cepat. ' +
  'Nikmati berbagai pilihan menu dari kantin-kantin terbaik di kampus ITERA.';

// Statistics
const stats = [
  { number: '10+', label: 'Kantin' },
  { number: '50+', label: 'Menu' },
  { number: '1000+', label: 'Pesanan' },
];

// Food emojis for illustration
const foodEmojis = ['🍜', '🍔', '🍕', '🥗', '☕', '🍰'];

/**
 * Handle view menu button click
 */
const handleViewMenu = () => {
  // Scroll to tenants section
  document.getElementById('tenants')?.scrollIntoView({ behavior: 'smooth' });
};
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 4rem 0;
}

.w-full {
  width: 100% !important;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.hero-content {
  animation: fadeInLeft 0.8s ease-out;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.2rem;
  color: #4a5568;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-hero-primary,
.btn-hero-secondary {
  padding: 1rem 2rem;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-hero-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-hero-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-hero-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-hero-secondary:hover {
  background: #667eea;
  color: white;
}

.hero-stats {
  display: flex;
  gap: 3rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.9rem;
  color: #718096;
  margin-top: 0.5rem;
}

.hero-image {
  animation: fadeInRight 0.8s ease-out;
}

.image-placeholder {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
}

.emoji {
  font-size: 4rem;
  text-align: center;
  animation: float 3s ease-in-out infinite;
}

.emoji:nth-child(2) {
  animation-delay: 0.5s;
}

.emoji:nth-child(3) {
  animation-delay: 1s;
}

.emoji:nth-child(4) {
  animation-delay: 1.5s;
}

.emoji:nth-child(5) {
  animation-delay: 2s;
}

.emoji:nth-child(6) {
  animation-delay: 2.5s;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }

  .hero-stats {
    justify-content: center;
    gap: 2rem;
  }

  .image-placeholder {
    grid-template-columns: repeat(2, 1fr);
  }

  .emoji {
    font-size: 3rem;
  }
}
</style>

