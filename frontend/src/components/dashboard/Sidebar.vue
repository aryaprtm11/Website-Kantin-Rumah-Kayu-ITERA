<template>
  <!-- Mobile Toggle Button -->
  <Button 
    v-if="isMobile"
    @click="toggleMobileSidebar" 
    icon="pi pi-bars"
    class="mobile-toggle"
    rounded
    text
  />

  <!-- Overlay for mobile -->
  <div 
    v-if="isMobile && showMobileSidebar" 
    class="sidebar-overlay"
    @click="closeMobileSidebar"
  ></div>

  <aside class="sidebar" :class="{ 
    'sidebar-collapsed': isCollapsed && !isMobile,
    'sidebar-mobile-open': showMobileSidebar && isMobile,
    'sidebar-mobile-closed': !showMobileSidebar && isMobile
  }">
    <Card class="sidebar-card">
      <template #header>
        <div class="sidebar-header">
          <div v-if="!isCollapsed || isMobile" class="sidebar-title">
            <img src="/logo.png" alt="Kantin RK" class="logo-img" />
            <span>Kantin RK</span>
          </div>
          <img v-else src="/logo.png" alt="Kantin RK" class="logo-img-collapsed" />
          <Button 
            v-if="!isMobile"
            @click="toggleSidebar" 
            :icon="isCollapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"
            text
            rounded
            class="btn-toggle"
          />
          <Button 
            v-else
            @click="closeMobileSidebar" 
            icon="pi pi-times"
            text
            rounded
            class="btn-toggle"
          />
        </div>
      </template>

      <template #content>
        <nav class="sidebar-nav">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            @click="handleNavClick"
          >
            <component :is="getIcon(item.icon)" :size="20" class="nav-icon" />
            <span v-if="!isCollapsed || isMobile" class="nav-label">{{ item.label }}</span>
          </router-link>
        </nav>
      </template>

      <template #footer>
        <div class="sidebar-footer">
          <div v-if="!isCollapsed || isMobile" class="user-info">
            <Avatar 
              :label="userInitial" 
              class="user-avatar"
              shape="circle"
            />
            <div class="user-details">
              <p class="user-name">{{ userName }}</p>
              <Tag :value="userRole" severity="success" class="user-role" />
            </div>
          </div>
          <Button 
            @click="handleLogout" 
            :label="(!isCollapsed || isMobile) ? 'Logout' : ''"
            icon="pi pi-sign-out"
            severity="danger"
            text
            class="btn-logout"
            :class="{ 'btn-logout-collapsed': isCollapsed && !isMobile }"
          >
            <template v-if="isCollapsed && !isMobile" #icon>
              <LogOut :size="20" />
            </template>
          </Button>
        </div>
      </template>
    </Card>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../../composables/useAuth";
import Card from 'primevue/card';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Tag from 'primevue/tag';
import {
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
const isMobile = ref(false);
const showMobileSidebar = ref(false);

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

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    showMobileSidebar.value = false;
  }
};

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const toggleMobileSidebar = () => {
  showMobileSidebar.value = !showMobileSidebar.value;
};

const closeMobileSidebar = () => {
  showMobileSidebar.value = false;
};

const handleNavClick = () => {
  if (isMobile.value) {
    closeMobileSidebar();
  }
};

const handleLogout = async () => {
  await logout();
  router.push("/login");
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: calc(100vh - 2rem);
  position: fixed;
  left: 1rem;
  top: 1rem;
  transition: all 0.3s ease;
  z-index: 1000;
}

.sidebar-collapsed {
  width: 80px;
}

:deep(.sidebar-card) {
  height: 100%;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.1);
  display: flex;
  flex-direction: column;
}

:deep(.sidebar-card .p-card-header) {
  padding: 0;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-radius: 20px 20px 0 0;
}

:deep(.sidebar-card .p-card-body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

:deep(.sidebar-card .p-card-content) {
  flex: 1;
  padding: 0;
  overflow-y: auto;
}

:deep(.sidebar-card .p-card-footer) {
  padding: 0;
  border-top: 1px solid rgba(34, 197, 94, 0.1);
  background: rgba(34, 197, 94, 0.02);
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
}

.logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.logo-img-collapsed {
  width: 32px;
  height: 32px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

:deep(.btn-toggle) {
  color: white !important;
}

:deep(.btn-toggle:hover) {
  background: rgba(255, 255, 255, 0.2) !important;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  overflow-y: auto;
}

.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(34, 197, 94, 0.2);
  border-radius: 10px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(34, 197, 94, 0.3);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.3s;
  position: relative;
  border-radius: 12px;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(34, 197, 94, 0.08);
  color: #22c55e;
  transform: translateX(4px);
}

.nav-item.router-link-active {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.1) 100%);
  color: #16a34a;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.15);
}

.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
  border-radius: 0 4px 4px 0;
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
  padding: 1rem 0.75rem;
  border-top: 1px solid rgba(34, 197, 94, 0.1);
  background: rgba(34, 197, 94, 0.02);
  border-radius: 0 0 20px 20px;
}

.sidebar-footer {
  padding: 1rem 0.75rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(34, 197, 94, 0.1);
}

:deep(.user-avatar) {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
}

.user-details {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-weight: 600;
  margin: 0;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #111827;
}

:deep(.user-role) {
  font-size: 0.7rem;
  text-transform: capitalize;
}

:deep(.btn-logout) {
  width: 100%;
  justify-content: center;
}

.btn-logout-collapsed {
  padding: 0.75rem !important;
}

.sidebar-collapsed .nav-item {
  justify-content: center;
  padding: 1rem;
}

.sidebar-collapsed .user-info {
  justify-content: center;
  padding: 0.5rem;
}

.mobile-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: white !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 280px;
    left: 0;
    top: 0;
    height: 100vh;
    margin: 0;
    transition: transform 0.3s ease;
    z-index: 1000;
  }

  .sidebar-mobile-closed {
    transform: translateX(-100%);
  }

  .sidebar-mobile-open {
    transform: translateX(0);
  }

  :deep(.sidebar-card) {
    border-radius: 0;
    height: 100%;
  }

  :deep(.sidebar-card .p-card-header) {
    border-radius: 0;
  }
}
</style>