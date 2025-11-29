<template>
  <div class="home">
    <Navbar />
    <HeroSection />
    <TenantList />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Navbar from '../components/Navbar.vue';
import HeroSection from '../components/HeroSection.vue';
import TenantList from '../components/TenantList.vue';
import Footer from '../components/Footer.vue';
</script>

<style scoped>
.home {
  min-height: 100vh;
}
</style>

