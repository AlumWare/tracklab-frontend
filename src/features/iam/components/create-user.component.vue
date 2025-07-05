<template>
  <BaseForm
    :visible="visible"
    :title="editingUser ? $t('userManagement.editUser') : $t('userManagement.addUser')"
    :submit-text="editingUser ? $t('userManagement.saveChanges') : $t('userManagement.save')"
    :cancel-text="$t('userManagement.cancel')"
    :loading="loading"
    @close="closeModal"
    @submit="saveUser"
  >
    <template #form-fields>
      <BaseFormField
        v-model="userForm.username"
        :label="$t('userManagement.form.username')"
        :placeholder="$t('userManagement.form.usernamePlaceholder')"
        :disabled="editingUser"
        required
      />
      
      <BaseFormField
        v-if="!editingUser"
        v-model="userForm.password"
        type="password"
        :label="$t('userManagement.form.password')"
        :placeholder="$t('userManagement.form.passwordPlaceholder')"
        required
      />
      
      <BaseFormField
        v-model="userForm.email"
        type="email"
        :label="$t('userManagement.form.email')"
        :placeholder="$t('userManagement.form.emailPlaceholder')"
        required
      />
      
      <div class="form-row">
        <BaseFormField
          v-model="userForm.firstName"
          :label="$t('userManagement.form.firstName')"
          :placeholder="$t('userManagement.form.firstNamePlaceholder')"
          required
        />
        
        <BaseFormField
          v-model="userForm.lastName"
          :label="$t('userManagement.form.lastName')"
          :placeholder="$t('userManagement.form.lastNamePlaceholder')"
          required
        />
      </div>
      
      <div class="form-group">
        <label>{{ $t('userManagement.form.roles') }}</label>
        <div class="roles-checkboxes">
          <label v-for="role in availableRoles" :key="role.name" class="role-checkbox">
            <input 
              type="checkbox" 
              :value="role.name"
              v-model="userForm.roles"
            />
            <span>{{ $t(`userManagement.roles.${role.name}`) }}</span>
          </label>
        </div>
      </div>
      
      <BaseFormField
        v-if="editingUser"
        v-model="userForm.active"
        type="select"
        :label="$t('userManagement.form.status')"
        :options="statusOptions"
      />
    </template>
  </BaseForm>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { userService } from '@/features/iam/services/user.service'
import { User } from '@/features/iam/models/user.model'
import { CreateUserRequest } from '@/features/iam/models/create-user.request.js'
import { Role } from '@/features/iam/models/roles.enum.js'
import { UxService } from '@/core/services/ux.service'
import BaseForm from '@/shared/components/base-form.component.vue'
import BaseFormField from '@/shared/components/base-form-field.component.vue'

const { t } = useI18n()

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  editingUser: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'user-saved'])

// Reactive data
const userForm = ref({
  username: '',
  password: '',
  email: '',
  firstName: '',
  lastName: '',
  roles: [],
  active: true
})

// Available roles from enum
const availableRoles = computed(() => Role.getAllRoles())

// Status options for select
const statusOptions = computed(() => [
  { value: true, label: t('userManagement.form.active') },
  { value: false, label: t('userManagement.form.inactive') }
])

// Loading state
const loading = ref(false)

// Methods
const resetForm = () => {
  userForm.value = {
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    roles: [],
    active: true
  }
}

const closeModal = () => {
  emit('close')
  resetForm()
}

// Watch for editing user changes
watch(() => props.editingUser, (newUser) => {
  if (newUser) {
    userForm.value = {
      username: newUser.username,
      password: '',
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      roles: [...newUser.roles],
      active: newUser.active
    }
  } else {
    resetForm()
  }
}, { immediate: true })

const saveUser = async () => {
  loading.value = true
  
  try {
    if (props.editingUser) {
      // Update existing user
      const updateData = {
        email: userForm.value.email,
        firstName: userForm.value.firstName,
        lastName: userForm.value.lastName,
        roles: userForm.value.roles,
        active: userForm.value.active
      }
      
      const updatedUser = await userService.updateUser(props.editingUser.id, updateData)
      
      // Show success message
      UxService.showSnackbar({
        message: t('userManagement.messages.userUpdated'),
        type: 'success'
      })
      
      emit('user-saved', updatedUser)
    } else {
      // Create new user
      const createRequest = new CreateUserRequest(userForm.value)
      const newUser = await userService.createUser(createRequest)
      
      // Show success message
      UxService.showSnackbar({
        message: t('userManagement.messages.userCreated'),
        type: 'success'
      })
      
      emit('user-saved', newUser)
    }
    
    closeModal()
  } catch (error) {
    console.error('Error saving user:', error)
    
    // Show error message
    UxService.showSnackbar({
      message: props.editingUser 
        ? t('userManagement.messages.errorUpdating')
        : t('userManagement.messages.errorCreating'),
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.roles-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.role-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.role-checkbox input[type="checkbox"] {
  width: auto;
  margin: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .roles-checkboxes {
    grid-template-columns: 1fr;
  }
}
</style>
