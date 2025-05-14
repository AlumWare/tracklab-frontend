<template>
  <div class="admin-user-management">
    <h2 class="title">Administración de Usuarios</h2>

    <!-- Barra de búsqueda y filtros -->
    <div class="filters">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar por nombre, email o rol"
        class="search-input"
      />
      <select v-model="roleFilter" class="role-select">
        <option value="">Todos los roles</option>
        <option value="OPERATOR">OPERATOR</option>
        <option value="ADMIN">ADMIN</option>
        <option value="MANAGER">MANAGER</option>
      </select>
      <button class="add-user-btn" @click="showAddUserModal = true">
        Agregar Usuario
      </button>
    </div>

    <!-- Tabla de usuarios -->
    <div class="users-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role">
                {{ user.role }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="user.status">
                {{ user.status }}
              </span>
            </td>
            <td class="actions">
              <button class="edit-btn" @click="editUser(user)">
                Editar
              </button>
              <button
                class="delete-btn"
                @click="confirmDelete(user)"
                :disabled="user.role === 'admin'"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para agregar/editar usuario -->
    <div v-if="showAddUserModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ editingUser ? 'Editar Usuario' : 'Agregar Usuario' }}</h3>
        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="userForm.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="userForm.email" type="email" required />
          </div>
          <div class="form-group">
            <label>Rol</label>
            <select v-model="userForm.role" required>
              <option value="ADMIN">Administrador</option>
              <option value="OPERATOR">Operator</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
          <div class="form-group">
            <label>Estado</label>
            <select v-model="userForm.status" required>
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showAddUserModal = false">
              Cancelar
            </button>
            <button type="submit" class="save-btn">
              {{ editingUser ? 'Guardar Cambios' : 'Agregar Usuario' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <h3>Confirmar Eliminación</h3>
        <p>¿Estás seguro de que deseas eliminar al usuario {{ userToDelete?.name }}?</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false">Cancelar</button>
          <button class="delete-btn" @click="deleteUser">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const users = ref([])

const search = ref('')
const roleFilter = ref('')
const showAddUserModal = ref(false)
const showDeleteModal = ref(false)
const editingUser = ref(null)
const userToDelete = ref(null)

const userForm = ref({
  name: '',
  email: '',
  role: 'admin',
  status: 'ACTIVE'
})

onMounted(() => {
  InvocaEmployee()
})

// Computed: Filtra los usuarios según búsqueda y rol
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesRole = roleFilter.value ? user.role === roleFilter.value : true
    const searchText = search.value.toLowerCase()
    const matchesSearch =
      user.name.toLowerCase().includes(searchText) ||
      user.email.toLowerCase().includes(searchText) ||
      user.role.toLowerCase().includes(searchText)
    return matchesRole && matchesSearch
  })
})

// Métodos

function InvocaEmployee() {
  axios.get('http://localhost:3000/employee')
    .then(res => {
      users.value = res.data
    })
}

function editUser(user) {
  editingUser.value = user
  userForm.value = { ...user }
  showAddUserModal.value = true
}

function confirmDelete(user) {
  userToDelete.value = user
  showDeleteModal.value = true
}

function saveUser() {
  const userData = {
    name: userForm.value.name,
    email: userForm.value.email,
    role: userForm.value.role,
    status: userForm.value.status
  }

  if (editingUser.value) {
    axios.put(`http://localhost:3000/employee/${editingUser.value.id}`, userData)
      .then(res => {
        users.value = res.data;
      })
    InvocaEmployee();
  } else {
    axios.post('http://localhost:3000/employee', userData)
      .then(res => {
        // Agregamos el nuevo usuario a la lista de users
        users.value.push(res.data) // Usamos res.data ya que es el usuario creado
      })
  }

  // Cerramos el modal y reseteamos el formulario
  showAddUserModal.value = false
  editingUser.value = null
  userForm.value = {
    name: '',
    email: '',
    role: 'user',
    status: 'active'
  }
}

function deleteUser() {
  if (userToDelete.value) {
    axios.delete(`http://localhost:3000/employee/${userToDelete.value.id}`)
      .then(() => {
        // Eliminamos el usuario de la lista
        users.value = users.value.filter(u => u.id !== userToDelete.value.id)
        showDeleteModal.value = false
        userToDelete.value = null
      })
  }
}
</script>

<style scoped>
:root {
  --primary-color: #4FC3F7; /* Celeste */
  --primary-dark: #039BE5;
  --text-color: #000;
  --border-color: #000;
}

.admin-user-management {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 2rem;
  color: var(--text-color);
  margin-bottom: 2rem;
  text-align: center;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input,
.role-select {
  padding: 0.5rem;
  border: 1px solid #000; /* Borde negro */
  border-radius: 4px;
  font-size: 1rem;
  color: #000;
  background-color: #fff;
}

.search-input {
  flex: 2;
}

.role-select {
  flex: 1;
}

.add-user-btn {
  padding: 0.5rem 1rem;
  background-color: #b2ebf2;
  color: black;
  border: 1px solid var(black);
  border-radius: 4px;
  cursor: pointer;
}

.add-user-btn:hover {
  background-color: #b2ebf2;
}

.users-table {
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
}

th {
  background-color: #E1F5FE;
  font-weight: 600;
}

.role-badge,
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  border: 1px solid var(--border-color);
}

.role-badge.admin {
  background-color: #b3e5fc;
  color: #01579b;
}

.role-badge.user {
  background-color: #e1bee7;
  color: #6a1b9a;
}

.role-badge.client {
  background-color: #c8e6c9;
  color: #2e7d32;
}

.status-badge.active {
  background-color: #b2ebf2;
  color: #00796b;
}

.status-badge.inactive {
  background-color: #ffcdd2;
  color: #c62828;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn,
.delete-btn {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn {
  background-color: #b2ebf2;
  color: black;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 400px;
  border: 2px solid #000; /* Borde negro para el modal */
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(black);
  font-weight: 600;
  border-left: 4px solid var(--border-color);
  padding-left: 0.5rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #000; /* Borde negro para inputs/selects */
  border-radius: 4px;
  font-size: 1rem;
  background-color: #fff;
  color: #000;
}
.form-group label {
  color: #000;
  font-weight: bold;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.save-btn {
  background-color: var(black);
  color: black;
  border: 1px solid var(black);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:hover {
  background-color: var(--primary-dark);
}
</style>
