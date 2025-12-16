<template>
  <Card class="stats-card" :style="{ '--accent-color': color }">
    <template #content>
      <div class="card-layout">
        <div class="card-icon">
          <component :is="getIcon(icon)" :size="32" />
        </div>
        <div class="card-content">
          <h3 class="card-value">{{ value }}</h3>
          <p class="card-label">{{ label }}</p>
          <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
        </div>
        <Tag 
          v-if="trend" 
          :value="trend"
          :severity="trendUp ? 'success' : 'danger'"
          :icon="trendUp ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"
          class="card-trend"
        />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import {
  Package,
  DollarSign,
  Store,
  Users,
  CheckCircle,
  Bell,
  ClipboardList,
} from 'lucide-vue-next';

defineProps<{
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
</script>

<style scoped>
:deep(.stats-card) {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.1);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

:deep(.stats-card::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--accent-color, #22c55e);
}

:deep(.stats-card:hover) {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.3);
}

:deep(.stats-card .p-card-body) {
  padding: 1.5rem;
}

:deep(.stats-card .p-card-content) {
  padding: 0;
}

.card-layout {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-color, #22c55e) 0%, rgba(22, 163, 74, 0.8) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.card-label {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
  font-weight: 500;
}

.card-subtitle {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0;
}

.card-trend {
  align-self: flex-start;
}

@media (max-width: 768px) {
  .card-layout {
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

