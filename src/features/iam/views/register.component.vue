<template>
  <div class="register-container">
    <div class="register-header">
      <div class="logo-section">
        <img src="@/assets/logo.svg" alt="TrackLab Logo" class="register-logo" />
        <h1 class="register-brand">TrackLab</h1>
        <p class="register-slogan">{{ $t('register.subtitle') }}</p>
      </div>
    </div>

    <!-- Progress indicator -->
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressWidth }"></div>
      </div>
      <div class="progress-steps">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="progress-step"
          :class="{ 
            active: currentStep === index + 1,
            completed: currentStep > index + 1
          }"
        >
          <span class="step-number">{{ index + 1 }}</span>
          <span class="step-label">{{ step.label }}</span>
        </div>
      </div>
    </div>

    <!-- Tab content -->
    <div class="tab-content">
      <!-- Step 1: Tenant Type Selection -->
      <div v-if="currentStep === 1" class="step-content">
        <h2 class="step-title">{{ $t('register.step1.title') }}</h2>
        <p class="step-description">{{ $t('register.step1.description') }}</p>
        
        <div class="tenant-type-grid">
          <div
            v-for="tenantType in tenantTypes"
            :key="tenantType.value"
            class="tenant-type-card"
            :class="{ selected: formData.tenantType === tenantType.value }"
            @click="selectTenantType(tenantType.value)"
          >
            <div class="card-icon">
              <svg v-if="tenantType.value === 'CLIENT'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <svg v-else-if="tenantType.value === 'PROVIDER'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 7l10 3 10-3-10-3L2 7z"></path>
                <path d="M12 17l-10-3v6l10 3 10-3v-6l-10 3z"></path>
              </svg>
              <svg v-else-if="tenantType.value === 'LOGISTIC'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 3h15v13H1z"></path>
                <path d="M16 8h4l3 3v5h-7V8z"></path>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <h3 class="card-title">{{ $t(`register.tenantTypes.${tenantType.value.toLowerCase()}.title`) }}</h3>
            <p class="card-description">{{ $t(`register.tenantTypes.${tenantType.value.toLowerCase()}.description`) }}</p>
            <div class="card-features">
              <div
                v-for="feature in tenantType.features"
                :key="feature"
                class="feature-item"
              >
                <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                <span>{{ $t(`register.features.${feature}`) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Company Information -->
      <div v-if="currentStep === 2" class="step-content">
        <h2 class="step-title">{{ $t('register.step2.title') }}</h2>
        <p class="step-description">{{ $t('register.step2.description') }}</p>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="ruc">{{ $t('register.company.ruc') }} *</label>
            <input
              id="ruc"
              v-model="formData.ruc"
              type="text"
              class="form-input"
              :placeholder="$t('register.company.rucPlaceholder')"
              :class="{ 'error': fieldErrors.ruc }"
              required
            />
            <small v-if="fieldErrors.ruc" class="error-message">{{ fieldErrors.ruc }}</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="legalName">{{ $t('register.company.legalName') }} *</label>
            <input
              id="legalName"
              v-model="formData.legalName"
              type="text"
              class="form-input"
              :placeholder="$t('register.company.legalNamePlaceholder')"
              :class="{ 'error': fieldErrors.legalName }"
              required
            />
            <small v-if="fieldErrors.legalName" class="error-message">{{ fieldErrors.legalName }}</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="commercialName">{{ $t('register.company.commercialName') }}</label>
            <input
              id="commercialName"
              v-model="formData.commercialName"
              type="text"
              class="form-input"
              :placeholder="$t('register.company.commercialNamePlaceholder')"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="tenantEmail">{{ $t('register.company.email') }}</label>
            <input
              id="tenantEmail"
              v-model="formData.tenantEmail"
              type="email"
              class="form-input"
              :placeholder="$t('register.company.emailPlaceholder')"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="tenantPhone">{{ $t('register.company.phone') }}</label>
            <input
              id="tenantPhone"
              v-model="formData.tenantPhone"
              type="tel"
              class="form-input"
              :placeholder="$t('register.company.phonePlaceholder')"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="website">{{ $t('register.company.website') }}</label>
            <input
              id="website"
              v-model="formData.website"
              type="url"
              class="form-input"
              :placeholder="$t('register.company.websitePlaceholder')"
            />
          </div>

          <div class="form-group full-width">
            <label class="form-label" for="address">{{ $t('register.company.address') }}</label>
            <input
              id="address"
              v-model="formData.address"
              type="text"
              class="form-input"
              :placeholder="$t('register.company.addressPlaceholder')"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="city">{{ $t('register.company.city') }}</label>
            <input
              id="city"
              v-model="formData.city"
              type="text"
              class="form-input"
              :placeholder="$t('register.company.cityPlaceholder')"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="country">{{ $t('register.company.country') }}</label>
            <input
              id="country"
              v-model="formData.country"
              type="text"
              class="form-input"
              :placeholder="$t('register.company.countryPlaceholder')"
            />
          </div>
        </div>
      </div>

      <!-- Step 3: User Information -->
      <div v-if="currentStep === 3" class="step-content">
        <h2 class="step-title">{{ $t('register.step3.title') }}</h2>
        <p class="step-description">{{ $t('register.step3.description') }}</p>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="firstName">{{ $t('register.user.firstName') }}</label>
            <input
              id="firstName"
              v-model="formData.firstName"
              type="text"
              class="form-input"
              :placeholder="$t('register.user.firstNamePlaceholder')"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="lastName">{{ $t('register.user.lastName') }}</label>
            <input
              id="lastName"
              v-model="formData.lastName"
              type="text"
              class="form-input"
              :placeholder="$t('register.user.lastNamePlaceholder')"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="email">{{ $t('register.user.email') }} *</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-input"
              :placeholder="$t('register.user.emailPlaceholder')"
              :class="{ 'error': fieldErrors.email }"
              required
            />
            <small v-if="fieldErrors.email" class="error-message">{{ fieldErrors.email }}</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="username">{{ $t('register.user.username') }} *</label>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              class="form-input"
              :placeholder="$t('register.user.usernamePlaceholder')"
              :class="{ 'error': fieldErrors.username }"
              required
            />
            <small v-if="fieldErrors.username" class="error-message">{{ fieldErrors.username }}</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">{{ $t('register.user.password') }} *</label>
            <div class="input-wrapper">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :placeholder="$t('register.user.passwordPlaceholder')"
                :class="{ 'error': fieldErrors.password }"
                required
              />
              <button
                type="button"
                class="password-toggle"
                @click="togglePasswordVisibility"
              >
                <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94l13.88 13.88z"></path>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-6.65-6.65z"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
            <small v-if="fieldErrors.password" class="error-message">{{ fieldErrors.password }}</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="passwordConfirmation">{{ $t('register.user.passwordConfirmation') }} *</label>
            <div class="input-wrapper">
              <input
                id="passwordConfirmation"
                v-model="formData.passwordConfirmation"
                :type="showPasswordConfirmation ? 'text' : 'password'"
                class="form-input"
                :placeholder="$t('register.user.passwordConfirmationPlaceholder')"
                :class="{ 'error': fieldErrors.passwordConfirmation }"
                required
              />
              <button
                type="button"
                class="password-toggle"
                @click="togglePasswordConfirmationVisibility"
              >
                <svg v-if="showPasswordConfirmation" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94l13.88 13.88z"></path>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19l-6.65-6.65z"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
            <small v-if="fieldErrors.passwordConfirmation" class="error-message">{{ fieldErrors.passwordConfirmation }}</small>
          </div>
        </div>

        <!-- Terms and conditions -->
        <div class="form-group terms-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="formData.acceptTerms"
              class="checkbox-input"
              required
            />
            <span class="checkbox-custom"></span>
            {{ $t('register.acceptTerms') }}
          </label>
        </div>

        <!-- Error and success messages -->
        <div v-if="errorMessage" class="error-alert">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <div v-if="successMessage" class="success-alert">
          <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
          <span>{{ successMessage }}</span>
        </div>
      </div>
    </div>

    <!-- Navigation buttons -->
    <div class="step-navigation">
      <BaseButton
        v-if="currentStep > 1"
        type="button"
        :label="$t('register.back')"
        color="secondary"
        @click="previousStep"
        :disabled="isLoading"
        class="nav-button"
      />
      
      <BaseButton
        v-if="currentStep < 3"
        type="button"
        :label="$t('register.next')"
        color="primary"
        @click="nextStep"
        :disabled="!canProceed"
        class="nav-button"
      />
      
      <BaseButton
        v-if="currentStep === 3"
        type="button"
        :label="$t('register.submit')"
        color="primary"
        @click="handleSubmit"
        :loading="isLoading"
        :disabled="!canSubmit"
        class="nav-button"
      />
    </div>

    <!-- Login link -->
    <div class="login-link">
      <p>{{ $t('register.hasAccount') }} 
        <button 
          type="button" 
          class="link-button"
          @click="$router.push('/auth/login')"
        >
          {{ $t('register.loginLink') }}
        </button>
      </p>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/shared/components/BaseButton.vue';
import { AuthService } from '../services/auth.service';
import { TenantType } from '../models/tenant-type.enum';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.store';

export default {
  name: 'RegisterView',
  components: {
    BaseButton
  },
  setup() {
    const { t } = useI18n();
    const authStore = useAuthStore();
    return { t, authStore };
  },
  data() {
    return {
      currentStep: 1,
      isLoading: false,
      showPassword: false,
      showPasswordConfirmation: false,
      errorMessage: '',
      successMessage: '',
      fieldErrors: {},
      formData: {
        // Company data
        tenantType: '',
        ruc: '',
        legalName: '',
        commercialName: '',
        address: '',
        city: '',
        country: '',
        tenantPhone: '',
        tenantEmail: '',
        website: '',
        // User data
        username: '',
        password: '',
        passwordConfirmation: '',
        email: '',
        firstName: '',
        lastName: '',
        acceptTerms: false
      }
    };
  },
  computed: {
    steps() {
      return [
        { label: this.$t('register.steps.selectType') },
        { label: this.$t('register.steps.companyInfo') },
        { label: this.$t('register.steps.userInfo') }
      ];
    },
    progressWidth() {
      return `${(this.currentStep / 3) * 100}%`;
    },
         tenantTypes() {
       return [
         {
           value: TenantType.Client.value,
           features: ['orderTracking', 'realTimeUpdates', 'reportGeneration']
         },
         {
           value: TenantType.Provider.value,
           features: ['inventoryManagement', 'orderFulfillment', 'clientCommunication']
         },
         {
           value: TenantType.Logistic.value,
           features: ['routeOptimization', 'fleetManagement', 'operationMonitoring']
         }
       ];
     },
    canProceed() {
      switch (this.currentStep) {
        case 1:
          return this.formData.tenantType !== '';
        case 2:
          return this.formData.ruc && this.formData.legalName;
        case 3:
          return this.formData.username && this.formData.password && this.formData.email;
        default:
          return false;
      }
    },
    canSubmit() {
      return this.canProceed && this.formData.acceptTerms && this.formData.password === this.formData.passwordConfirmation;
    }
  },
  methods: {
    selectTenantType(type) {
      this.formData.tenantType = type;
    },

    nextStep() {
      if (this.canProceed) {
        if (this.currentStep === 2) {
          this.validateStep2();
        }
        if (Object.keys(this.fieldErrors).length === 0) {
          this.currentStep++;
        }
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
        this.clearMessages();
      }
    },

    validateStep2() {
      this.fieldErrors = {};

      if (!this.formData.ruc) {
        this.fieldErrors.ruc = this.$t('register.errors.rucRequired');
      } else if (this.formData.ruc.length < 8) {
        this.fieldErrors.ruc = this.$t('register.errors.rucInvalid');
      }

      if (!this.formData.legalName) {
        this.fieldErrors.legalName = this.$t('register.errors.legalNameRequired');
      }
    },

    validateStep3() {
      this.fieldErrors = {};

      if (!this.formData.username) {
        this.fieldErrors.username = this.$t('register.errors.usernameRequired');
      } else if (this.formData.username.length < 3) {
        this.fieldErrors.username = this.$t('register.errors.usernameMinLength');
      }

      if (!this.formData.email) {
        this.fieldErrors.email = this.$t('register.errors.emailRequired');
      } else if (!this.isValidEmail(this.formData.email)) {
        this.fieldErrors.email = this.$t('register.errors.emailInvalid');
      }

      if (!this.formData.password) {
        this.fieldErrors.password = this.$t('register.errors.passwordRequired');
      } else if (this.formData.password.length < 6) {
        this.fieldErrors.password = this.$t('register.errors.passwordMinLength');
      }

      if (!this.formData.passwordConfirmation) {
        this.fieldErrors.passwordConfirmation = this.$t('register.errors.passwordConfirmationRequired');
      } else if (this.formData.password !== this.formData.passwordConfirmation) {
        this.fieldErrors.passwordConfirmation = this.$t('register.errors.passwordMismatch');
      }
    },

    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },

    togglePasswordConfirmationVisibility() {
      this.showPasswordConfirmation = !this.showPasswordConfirmation;
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    async handleSubmit() {
      this.clearMessages();
      this.validateStep3();

      if (Object.keys(this.fieldErrors).length > 0) {
        return;
      }

      if (!this.formData.acceptTerms) {
        this.errorMessage = this.$t('register.errors.acceptTermsRequired');
        return;
      }

      this.isLoading = true;

      try {
        await this.authStore.register(this.formData);
        
        this.successMessage = this.$t('register.success');
        
        // Redirect to login after successful registration
        setTimeout(() => {
          this.$router.push('/auth/login');
        }, 1500);

      } catch (error) {
        this.handleRegistrationError(error);
      } finally {
        this.isLoading = false;
      }
    },

    handleRegistrationError(error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            this.errorMessage = data?.message || this.$t('register.errors.invalidData');
            break;
          case 409:
            this.errorMessage = this.$t('register.errors.userExists');
            break;
          case 422:
            this.errorMessage = this.$t('register.errors.validationFailed');
            // Handle field-specific errors
            if (data.errors) {
              this.fieldErrors = data.errors;
            }
            break;
          case 500:
            this.errorMessage = this.$t('register.errors.serverError');
            break;
          default:
            this.errorMessage = data?.message || this.$t('register.errors.generic');
        }
      } else if (error.request) {
        this.errorMessage = this.$t('register.errors.networkError');
      } else {
        this.errorMessage = this.$t('register.errors.generic');
      }
    },

    clearMessages() {
      this.errorMessage = '';
      this.successMessage = '';
    }
  }
};
</script>

<style scoped>
.register-container {
  width: 100%;
  max-width: 600px;
  padding: 2rem;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.register-logo {
  width: 60px;
  height: auto;
}

.register-brand {
  font-size: 2rem;
  color: #4bb0fa;
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
}

.register-slogan {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.progress-container {
  margin-bottom: 2rem;
}

.progress-bar {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: #4bb0fa;
  transition: width 0.3s ease;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.step-number {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.progress-step.active .step-number {
  background: #4bb0fa;
  color: white;
}

.progress-step.completed .step-number {
  background: #4caf50;
  color: white;
}

.step-label {
  font-size: 0.8rem;
  color: #666;
  text-align: center;
  font-weight: 500;
}

.progress-step.active .step-label {
  color: #4bb0fa;
  font-weight: 600;
}

.tab-content {
  margin-bottom: 2rem;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.step-description {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.tenant-type-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.tenant-type-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.tenant-type-card:hover {
  border-color: #4bb0fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(75, 176, 250, 0.15);
}

.tenant-type-card.selected {
  border-color: #4bb0fa;
  background: rgba(75, 176, 250, 0.05);
}

.card-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  color: #4bb0fa;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.card-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.card-features {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.feature-icon {
  width: 1rem;
  height: 1rem;
  color: #4caf50;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group.terms-group {
  grid-column: 1 / -1;
  margin-top: 1rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  color: #333;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #4bb0fa;
  box-shadow: 0 0 0 3px rgba(75, 176, 250, 0.1);
}

.form-input.error {
  border-color: #e74c3c;
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  width: 1.2rem;
  height: 1.2rem;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle:hover {
  color: #4bb0fa;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background: #4bb0fa;
  border-color: #4bb0fa;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

.error-alert,
.success-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 1rem;
}

.error-alert {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.success-alert {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.error-icon,
.success-icon {
  width: 1.2rem;
  height: 1.2rem;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
}

.step-navigation {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.nav-button {
  flex: 1;
  max-width: 150px;
}

.login-link {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.link-button {
  background: none;
  border: none;
  color: #4bb0fa;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.link-button:hover {
  color: #2196f3;
}

@media (max-width: 768px) {
  .register-container {
    padding: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .progress-steps {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .progress-step {
    flex-direction: row;
    text-align: left;
  }
  
  .step-number {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.8rem;
  }
  
  .step-label {
    font-size: 0.9rem;
  }
}
</style>
