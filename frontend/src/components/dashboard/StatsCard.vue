<template>
  <div class="stats-card" :style="{ '--accent-color': color }">
    <div class="card-icon">
      <component :is="getIcon(icon)" :size="32" />
    </div>
    <div class="card-content">
      <h3 class="card-value">{{ value }}</h3>
      <p class="card-label">{{ label }}</p>
      <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="trend" class="card-trend" :class="trendClass">
      <component :is="trendUp ? TrendingUp : TrendingDown" :size="16" class="trend-icon" />
      <span class="trend-value">{{ trend }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  Package,
  DollarSign,
  Store,
  Users,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Bell,
  ClipboardList,
} from 'lucide-vue-next';

const props = defineProps<{
  icon: string;
  value: string | number;
  label: string;
  subtitle?: string;
  color?: string;
  trend?: string;
  trendUp?: boolean;
}>();

const iconMap: Record<string, any> = {
  Package,
  DollarSign,
  Store,
  Users,
  CheckCircle,
  Bell,
  ClipboardList,
};

const getIcon = (iconName: string) => {
  return iconMap[iconName] || Package;
};

const trendClass = computed(() => {
  if (props.trendUp === undefined) return '';
  return props.trendUp ? 'trend-up' : 'trend-down';
});
</script>

<style scoped>
.stats-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--accent-color, #667eea);
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-color, #667eea) 0%, rgba(118, 75, 162, 0.8) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 2rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
}

.card-label {
  font-size: 0.9rem;
  color: #718096;
  margin: 0 0 0.25rem 0;
  font-weight: 500;
}

.card-subtitle {
  font-size: 0.8rem;
  color: #a0aec0;
  margin: 0;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.trend-up {
  background: #c6f6d5;
  color: #22543d;
}

.trend-down {
  background: #fed7d7;
  color: #742a2a;
}

.trend-icon {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .stats-card {
    flex-direction: column;
  }

  .card-icon {
    width: 50px;
    height: 50px;
  }

  .card-value {
    font-size: 1.5rem;
  }
}
</style>

