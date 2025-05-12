<script>
export default {
    name: 'SidebarSubmenu',
    props: {
        children: {
            type: Array,
            required: true
        }
    },
    methods: {
        onItemClick(route) {
            this.$emit('navigate', route);
        }
    }
}
</script>

<template>
    <transition name="submenu">
        <ul class="sidebar__submenu">
            <li v-for="child in children" :key="child.id" class="sidebar__submenu-item">
                <div 
                    class="sidebar__submenu-link"
                    :class="{ 'active': $route.path === child.route }"
                    @click="onItemClick(child.route)"
                >
                    <i class="sidebar__submenu-icon" :class="child.icon"></i>
                    <span class="sidebar__submenu-label">{{ child.label }}</span>
                </div>
            </li>
        </ul>
    </transition>
</template>

<style scoped>
.sidebar__submenu {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow: hidden;
}

.submenu-enter-active,
.submenu-leave-active {
    transition: all 0.3s ease;
    max-height: 300px;
    opacity: 1;
}

.submenu-enter-from,
.submenu-leave-to {
    opacity: 0;
    max-height: 0;
    overflow: hidden;
}

.sidebar__submenu-item {
    width: 100%;
}

.sidebar__submenu-link {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px) var(--spacing-sm, 8px) var(--spacing-lg, 24px);
    color: var(--text-secondary, #666);
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sidebar__submenu-link:hover,
.sidebar__submenu-link.active {
    background-color: var(--surface, #f5f5f5);
    color: var(--primary, #3098ed);
}

.sidebar__submenu-link.active {
    border-left: 3px solid var(--primary, #3098ed);
}

.sidebar__submenu-icon {
    margin-right: var(--spacing-sm, 8px);
    font-size: 1rem;
}

.sidebar__submenu-label {
    flex: 1;
}
</style> 