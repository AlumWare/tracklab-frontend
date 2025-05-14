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
    background: var(--glass);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 var(--spacing-md);
    width: 100%;
    box-shadow: var(--box-shadow);
}

.header__left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.header__title {
    font-size: 1.25rem;
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    margin: 0;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header__menu-toggle {
    background: rgba(0, 0, 0, 0.05);
    border: none;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    border-radius: var(--border-radius-sm);
    transition: var(--transition-fast);
}

.header__menu-toggle:hover {
    background: rgba(0, 0, 0, 0.1);
    transform: scale(1.05);
}

.hamburger-icon,
.hamburger-icon:before,
.hamburger-icon:after {
    width: 20px;
    height: 2px;
    background: var(--primary);
    position: relative;
    transition: var(--transition-base);
    border-radius: 2px;
}

.hamburger-icon:before,
.hamburger-icon:after {
    content: '';
    position: absolute;
    left: 0;
}

.hamburger-icon:before {
    top: -6px;
}

.hamburger-icon:after {
    top: 6px;
}

.header__right {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

@media (min-width: 1024px) {
    .header__menu-toggle:hover .hamburger-icon {
        background: var(--primary-dark);
    }
    .header__menu-toggle:hover .hamburger-icon:before,
    .header__menu-toggle:hover .hamburger-icon:after {
        background: var(--primary-dark);
    }
}
</style>

