<script>
import SidebarSubmenu from './sidebar-submenu.component.vue';

export default {
    name: 'SidebarMenuItem',
    components: {
        SidebarSubmenu
    },
    props: {
        item: {
            type: Object,
            required: true
        },
        isOpen: {
            type: Boolean,
            required: true
        }
    },
    methods: {
        navigateTo(route) {
            if (route) {
                this.$router.push(route);
            }
        },
        hasChildren() {
            return this.item.children && this.item.children.length > 0;
        },
        toggleSubmenu() {
            this.$emit('toggle-submenu', this.item);
        }
    }
}
</script>

<template>
    <li class="sidebar__menu-item">
        <!-- Regular menu item without children -->
        <div 
            v-if="!hasChildren()"
            class="sidebar__menu-link" 
            :class="{ 'active': $route.path === item.route }"
            @click="navigateTo(item.route)"
        >
            <i class="sidebar__menu-icon" :class="item.icon"></i>
            <span class="sidebar__menu-label" v-if="isOpen">{{ item.label }}</span>
        </div>
        
        <!-- Item with children -->
        <div v-else class="sidebar__menu-parent" :class="{ 'expanded': item.expanded }">
            <div class="sidebar__menu-parent-header" @click="toggleSubmenu">
                <i class="sidebar__menu-icon" :class="item.icon"></i>
                <span class="sidebar__menu-label" v-if="isOpen">{{ item.label }}</span>
                <i v-if="isOpen" class="sidebar__menu-expand pi" :class="item.expanded ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
            </div>
            
            <sidebar-submenu 
                v-if="item.expanded && isOpen" 
                :children="item.children"
                @navigate="navigateTo"
            />
        </div>
    </li>
</template>

<style scoped>
.sidebar__menu-item {
    width: 100%;
    margin-bottom: var(--spacing-sm, 8px);
}

.sidebar__menu-link,
.sidebar__menu-parent-header {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
    color: var(--text-primary, #333);
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sidebar__menu-link:hover,
.sidebar__menu-parent-header:hover,
.sidebar__menu-link.active {
    background-color: var(--surface, #f5f5f5);
    color: var(--primary, #3098ed);
}

.sidebar__menu-link.active {
    border-left: 3px solid var(--primary, #3098ed);
}

.sidebar__menu-parent.expanded {
    background-color: var(--surface, #f5f5f5);
}

.sidebar__menu-icon {
    margin-right: var(--spacing-sm, 8px);
    font-size: 1.2rem;
    min-width: 20px;
}

.sidebar__menu-label {
    flex: 1;
    font-size: 0.9rem;
}

.sidebar__menu-expand {
    font-size: 1rem;
}
</style> 