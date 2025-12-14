<template>
  <aside class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <div class="sidebar-header">
      <div v-if="!isCollapsed" class="sidebar-title">
        <Home :size="20" />
        <span>Kantin RK</span>
      </div>
      <button @click="toggleSidebar" class="btn-toggle">
        <ChevronLeft v-if="!isCollapsed" :size="20" />
        <ChevronRight v-else :size="20" />
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
      >
        <component :is="getIcon(item.icon)" :size="20" class="nav-icon" />
        <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div v-if="!isCollapsed" class="user-info">
        <div class="user-avatar">{{ userInitial }}</div>
        <div class="user-details">
          <p class="user-name">{{ userName }}</p>
          <p class="user-role">{{ userRole }}</p>
        </div>
      </div>
      <button @click="handleLogout" class="btn-logout">
        <LogOut :size="20" class="nav-icon" />
        <span v-if="!isCollapsed">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../../composables/useAuth";
import {
  Home,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Package,
  Store,
  User,
  Users,
  UtensilsCrossed,
} from "lucide-vue-next";

const router = useRouter();
const { currentUser, logout } = useAuth();

const isCollapsed = ref(false);

defineProps<{
  menuItems: Array<{
    path: string;
    icon: string;
    label: string;
  }>;
}>();

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Package,
  Store,
  User,
  Users,
  UtensilsCrossed,
};

const getIcon = (iconName: string) => {
  return iconMap[iconName] || User;
};

const userName = computed(() => currentUser.value?.name || "User");
const userRole = computed(() => currentUser.value?.role || "customer");
const userInitial = computed(() => userName.value.charAt(0).toUpperCase());

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const handleLogout = async () => {
  await logout();
  router.push("/login");
};
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  transition: width 0.3s;
  z-index: 1000;
}

.sidebar-collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.btn-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* Vue Router otomatis menambahkan class ini */
.nav-item.router-link-active {
  background: rgba(102, 126, 234, 0.2);
  color: white;
  border-left: 4px solid #667eea;
}

.nav-icon {
  min-width: 20px;
  flex-shrink: 0;
}

.nav-label {
  font-weight: 500;
  white-space: nowrap;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

.user-details {
  flex: 1;
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  margin: 0;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  margin: 0;
  opacity: 0.7;
  text-transform: capitalize;
}

.btn-logout {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  justify-content: center;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}

.sidebar-collapsed .nav-item {
  justify-content: center;
  padding: 1rem;
}

.sidebar-collapsed .user-info {
  justify-content: center;
}

.sidebar-collapsed .btn-logout {
  justify-content: center;
}

@media (max-width: 768px) {
  .sidebar {
    width: 80px;
  }
}
</style>