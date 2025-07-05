<template>
  <div class="user-management">
    <div class="header">
      <h1 class="title">{{ $t('userManagement.title') }}</h1>
      <p class="subtitle">{{ $t('userManagement.subtitle') }}</p>
    </div>

    <!-- Barra de búsqueda y filtros -->
    <div class="filters">
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('userManagement.searchPlaceholder')"
          class="search-input"
          @input="handleSearch"
        />
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>
      
      <select v-model="roleFilter" class="role-select" @change="handleFilter">
        <option value="">{{ $t('userManagement.table.roles') }}</option>
        <option v-for="role in availableRoles" :key="role.name" :value="role.name">
          {{ $t(`userManagement.roles.${role.name}`) }}
        </option>
      </select>
      
      <button class="add-user-btn" @click="showAddUserModal = true">
        {{ $t('userManagement.addUser') }}
      </button>
    </div>

    <!-- Tabla de usuarios -->
    <div class="users-table-container">
      <div v-if="loading" class="loading">
        {{ $t('userManagement.loading') }}
      </div>
      
      <div v-else-if="filteredUsers.length === 0" class="no-users">
        {{ $t('userManagement.noUsers') }}
      </div>
      
      <table v-else class="users-table">
        <thead>
          <tr>
            <th>{{ $t('userManagement.table.id') }}</th>
            <th>{{ $t('userManagement.table.username') }}</th>
            <th>{{ $t('userManagement.table.fullName') }}</th>
            <th>{{ $t('userManagement.table.email') }}</th>
            <th>{{ $t('userManagement.table.roles') }}</th>
            <th>{{ $t('userManagement.table.status') }}</th>
            <th>{{ $t('userManagement.table.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.getFullName() }}</td>
            <td>{{ user.email }}</td>
            <td>
              <div class="roles-container">
                <span 
                  v-for="role in user.roles" 
                  :key="role" 
                  class="role-badge"
                  :class="getRoleClass(role)"
                >
                  {{ $t(`userManagement.roles.${role}`) }}
                </span>
              </div>
            </td>
            <td>
              <span 
                class="status-badge" 
                :class="user.active ? 'active' : 'inactive'"
              >
                {{ $t(`userManagement.status.${user.active ? 'active' : 'inactive'}`) }}
              </span>
            </td>
            <td class="actions">
              <button 
                class="action-btn edit-btn" 
                @click="editUser(user)"
                :title="$t('userManagement.table.edit')"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button 
                class="action-btn toggle-status-btn" 
                @click="toggleUserStatus(user)"
                :title="user.active ? $t('userManagement.table.deactivate') : $t('userManagement.table.activate')"
              >
                <svg v-if="user.active" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5,4 15,12 5,20"></polygon>
                </svg>
              </button>
              <button 
                class="action-btn delete-btn" 
                @click="confirmDelete(user)"
                :disabled="user.isAdmin()"
                :title="$t('userManagement.table.delete')"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3,6 5,6 21,6"></polyline>
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Componente de crear/editar usuario -->
    <CreateUserComponent
      :visible="showAddUserModal"
      :editing-user="editingUser"
      @close="closeModal"
      @user-saved="handleUserSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { userService } from '@/features/iam/services/user.service'
import { User } from '@/features/iam/models/user.model'
import { Role } from '@/features/iam/models/roles.enum.js'
import { UxService } from '@/core/services/ux.service'
import CreateUserComponent from '@/features/iam/components/create-user.component.vue'

const { t } = useI18n()

// Reactive data
const users = ref([])
const loading = ref(false)
const searchQuery = ref('')
const roleFilter = ref('')
const showAddUserModal = ref(false)
const editingUser = ref(null)

// Available roles from enum
const availableRoles = computed(() => Role.getAllRoles())

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.getFullName().toLowerCase().includes(query) ||
      user.roles.some(role => role.toLowerCase().includes(query))
    )
  }

  // Filter by role
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.roles.includes(roleFilter.value))
  }

  return filtered
})

// Methods
const loadUsers = async () => {
  loading.value = true
  try {
    users.value = await userService.getUsers()
  } catch (error) {
    console.error('Error loading users:', error)
    UxService.showSnackbar({
      message: t('userManagement.messages.errorLoading'),
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // La búsqueda se maneja automáticamente por el computed
}

const handleFilter = () => {
  // El filtro se maneja automáticamente por el computed
}

const editUser = (user) => {
  editingUser.value = user
  showAddUserModal.value = true
}

const closeModal = () => {
  showAddUserModal.value = false
  editingUser.value = null
}

const handleUserSaved = (savedUser) => {
  if (editingUser.value) {
    // Update existing user in the list
    const index = users.value.findIndex(u => u.id === savedUser.id)
    if (index !== -1) {
      users.value[index] = savedUser
    }
  } else {
    // Add new user to the list
    users.value.push(savedUser)
  }
}

const toggleUserStatus = async (user) => {
  try {
    const action = user.active ? 'deactivate' : 'activate'
    const actionText = user.active ? t('userManagement.table.deactivate') : t('userManagement.table.activate')
    
    // Show confirmation dialog
    const confirmed = await UxService.showConfirmDialog({
      title: t('userManagement.confirmStatusChange'),
      message: t('userManagement.confirmStatusChangeMessage', { 
        action: actionText.toLowerCase(),
        name: user.getFullName() 
      }),
      confirmText: t('userManagement.confirm'),
      cancelText: t('userManagement.cancel')
    })
    
    if (!confirmed) return
    
    let updatedUser
    if (user.active) {
      updatedUser = await userService.deactivateUser(user.id)
    } else {
      updatedUser = await userService.activateUser(user.id)
    }
    
    // Update user in the list
    const index = users.value.findIndex(u => u.id === updatedUser.id)
    if (index !== -1) {
      users.value[index] = updatedUser
    }
    
    // Show success message
    UxService.showSnackbar({
      message: user.active 
        ? t('userManagement.messages.userDeactivated')
        : t('userManagement.messages.userActivated'),
      type: 'success'
    })
  } catch (error) {
    console.error('Error toggling user status:', error)
    UxService.showSnackbar({
      message: t('userManagement.messages.errorUpdating'),
      type: 'error'
    })
  }
}

const confirmDelete = async (user) => {
  try {
    // Show confirmation dialog
    const confirmed = await UxService.showConfirmDialog({
      title: t('userManagement.confirmDelete'),
      message: t('userManagement.confirmDeleteMessage', { name: user.getFullName() }),
      confirmText: t('userManagement.deleteUser'),
      cancelText: t('userManagement.cancel')
    })
    
    if (!confirmed) return
    
    await userService.deleteUser(user.id)
    
    // Remove user from the list
    users.value = users.value.filter(u => u.id !== user.id)
    
    // Show success message
    UxService.showSnackbar({
      message: t('userManagement.messages.userDeleted'),
      type: 'success'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    UxService.showSnackbar({
      message: t('userManagement.messages.errorDeleting'),
      type: 'error'
    })
  }
}

const getRoleClass = (role) => {
  const roleClasses = {
    'ROLE_ADMIN': 'admin',
    'ROLE_OPERATOR': 'operator',
    'ROLE_SUPERVISOR': 'supervisor',
    'ROLE_CLIENT': 'client',
    'ROLE_PROVIDER': 'provider'
  }
  return roleClasses[role] || 'default'
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-management {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
  text-align: center;
}

.title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #666;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  flex: 2;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  color: #333;
  background-color: white;
}

.search-input::placeholder {
  color: #999;
}

.search-input:focus {
  outline: none;
  border-color: #4FC3F7;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  width: 1.2rem;
  height: 1.2rem;
}

.role-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  min-width: 150px;
  color: #333;
}

.role-select option {
  color: #333;
  background-color: white;
}

.add-user-btn {
  padding: 0.75rem 1.5rem;
  background-color: #4FC3F7;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-user-btn:hover {
  background-color: #039BE5;
}

.users-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading, .no-users {
  padding: 3rem;
  text-align: center;
  color: #666;
  font-size: 1.1rem;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.users-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.user-row:hover {
  background-color: #f8f9fa;
}

.roles-container {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.role-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid;
}

.role-badge.admin {
  background-color: #ffebee;
  color: #c62828;
  border-color: #ffcdd2;
}

.role-badge.operator {
  background-color: #e3f2fd;
  color: #1565c0;
  border-color: #bbdefb;
}

.role-badge.supervisor {
  background-color: #f3e5f5;
  color: #7b1fa2;
  border-color: #e1bee7;
}

.role-badge.client {
  background-color: #e8f5e8;
  color: #2e7d32;
  border-color: #c8e6c9;
}

.role-badge.provider {
  background-color: #fff3e0;
  color: #ef6c00;
  border-color: #ffcc02;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.status-badge.inactive {
  background-color: #ffebee;
  color: #c62828;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn svg {
  width: 1rem;
  height: 1rem;
}

.edit-btn {
  background-color: #e3f2fd;
  color: #1565c0;
}

.edit-btn:hover {
  background-color: #bbdefb;
}

.toggle-status-btn {
  background-color: #fff3e0;
  color: #ef6c00;
}

.toggle-status-btn:hover {
  background-color: #ffcc02;
}

.delete-btn {
  background-color: #ffebee;
  color: #c62828;
}

.delete-btn:hover {
  background-color: #ffcdd2;
}

.delete-btn:disabled {
  background-color: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}



/* Responsive design */
@media (max-width: 768px) {
  .user-management {
    padding: 1rem;
  }
  
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    min-width: auto;
  }
  
  .users-table {
    font-size: 0.9rem;
  }
  
  .users-table th,
  .users-table td {
    padding: 0.5rem;
  }
}
</style>
