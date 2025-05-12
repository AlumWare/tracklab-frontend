<script>
export default {
    name: 'HeaderComponent',
    props: {
        title: {
            type: String,
            required: false,
            default: 'TrackLab'
        }
    },
    methods: {
        toggleSidebar() {
            this.$emit('toggle-sidebar')
        }
    }
}
</script>

<template>
    <header class="header">
        <div class="header__left">
            <button class="header__menu-toggle" @click="toggleSidebar" aria-label="Toggle menu">
                <span class="hamburger-icon"></span>
            </button>
            <h1 class="header__title">{{ title }}</h1>
        </div>
        
        <div class="header__right">
            <!-- Puedes agregar componentes adicionales aquí, como perfil de usuario, notificaciones, etc. -->
        </div>
    </header>
</template>

<style scoped>
.header {
    height: 64px;
    background-color: var(--surface);
    border-bottom: 1px solid var(--secondary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 var(--spacing-md);
    width: 100%;
}

.header__left {
    display: flex;
    align-items: center;
}

.header__title {
    font-size: 1.25rem;
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    margin: 0;
    margin-left: var(--spacing-md);
}

.header__menu-toggle {
    background: none;
    border: none;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
}

.hamburger-icon,
.hamburger-icon:before,
.hamburger-icon:after {
    width: 24px;
    height: 2px;
    background-color: var(--text-primary);
    position: relative;
    transition: all 0.3s ease;
}

.hamburger-icon:before,
.hamburger-icon:after {
    content: '';
    position: absolute;
    left: 0;
}

.hamburger-icon:before {
    top: -8px;
}

.hamburger-icon:after {
    top: 8px;
}

.header__right {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

@media (min-width: 1024px) {
    /* En pantallas grandes podemos ocultar el botón de hamburguesa si queremos */
    /* .header__menu-toggle {
        display: none;
    } */
}
</style>

