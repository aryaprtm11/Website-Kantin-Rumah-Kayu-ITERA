<template>
  <div class="min-h-screen">
    <Navbar />
    <HeroSection />
    <HowToOrder />
    <TenantList />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Navbar from '../components/Navbar.vue';
import HeroSection from '../components/HeroSection.vue';
import HowToOrder from '../components/HowToOrder.vue';
import TenantList from '../components/TenantList.vue';
import Footer from '../components/Footer.vue';
</script>

<style scoped>
/* No custom styles needed - using Tailwind */
</style>



