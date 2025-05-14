<script>
import SidebarMenuItem from './sidebar-menu-item.component.vue';
import SidebarSubmenu from './sidebar-submenu.component.vue';

export default {
    name: 'SidebarComponent',
    components: {
        SidebarMenuItem,
        SidebarSubmenu
    },
    props: {
        isOpen: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    data() {
        return {
            menuItems: [
                {
                    id: 1,
                    icon: 'pi pi-home',
                    label: 'Home',
                    route: null,
                    expanded: false,
                    children: [
                      { id: 11, icon: 'pi pi-home', label: 'Client', route: '/tracklab/client-home' },
                      { id: 12, icon: 'pi pi-home', label: 'Company', route: '/tracklab/logistics-home' },
                    ]
                },
                {
                    id: 2,
                    icon: 'pi pi-box',
                    label: 'Orders',
                    route: null,
                    expanded: false,
                    children: [
                        { id: 21, icon: 'pi pi-box', label: 'Create Order', route: '/tracklab/orders/create' },
                        { id: 22, icon: 'pi pi-check-circle', label: 'Orders History', route: '/tracklab/orders/history' },
                        { id: 23, icon: 'pi pi-sync', label: 'Orders List', route: '/tracklab/orders' }
                    ]
                },
                {
                    id: 3,
                    icon: 'pi pi-list',
                    label: 'Users',
                    route: '/tracklab/admin-usuarios',
                    children: null
                },
                {
                    id: 4,
                    icon: 'pi pi-file',
                    label: 'Containers',
                    route: null,
                    children: [
                      { id: 41, icon: 'pi pi-box', label: 'Container Details View', route: '/tracklab/container-detail-view' },
                      { id: 42, icon: 'pi pi-check-circle', label: 'Manage container', route: '/tracklab/operation-execution-view' },
                      { id: 43, icon: 'pi pi-sync', label: 'Containers List', route: '/tracklab/ware-house-management-view' }
                    ]
                },
                {
                    id: 5,
                    icon: 'pi pi-car',
                    label: 'Vehicles',
                    route: '/tracklab/vehiculos',
                    children: null
                },
                {
                    id: 6,
                    icon: 'pi pi-palette',
                    label: 'Route Planning',
                    route: '/tracklab/route-planing-view',
                    children: null
                }
            ]
        }
    },
    methods: {
        toggleSubmenu(item) {
            if (item.children) {
                item.expanded = !item.expanded;
            }
        },
        toggleSidebar() {
            this.$emit('toggle', !this.isOpen);
        }
    }
}
</script>

<template>
    <aside class="sidebar" :class="{ 'sidebar--collapsed': !isOpen }">
        <div class="sidebar__header">
            <div class="sidebar__logo">
                <template v-if="isOpen">
                    <span class="logo-full">TrackLab</span>
                </template>
                <template v-else>
                    <span class="logo-icon">TL</span>
                </template>
            </div>
        </div>

        <div class="sidebar__content">
            <ul class="sidebar__menu">
                <sidebar-menu-item
                    v-for="item in menuItems"
                    :key="item.id"
                    :item="item"
                    :is-open="isOpen"
                    @toggle-submenu="toggleSubmenu"
                />
            </ul>
        </div>

        <div class="sidebar__footer">
            <div class="sidebar__collapse-btn" @click="toggleSidebar">
                <i class="pi" :class="isOpen ? 'pi-chevron-left' : 'pi-chevron-right'"></i>
            </div>
        </div>
    </aside>
</template>

<style scoped>
.sidebar {
    display: flex;
    flex-direction: column;
    width: 240px;
    height: 100vh;
    background-color: var(--background, white);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    transition: width 0.3s ease;
    overflow: hidden;
    color: var(--text-primary, #333);
    position: fixed;
    left: 0;
    top: 0;
    z-index: 50;
}

.sidebar--collapsed {
    width: 60px;
}

.sidebar__header {
    height: 64px;
    display: flex;
    align-items: center;
    padding: 0 var(--spacing-md, 16px);
    flex-shrink: 0;
    border-bottom: 1px solid var(--secondary, #f0f0f0);
}

.sidebar__logo {
    display: flex;
    align-items: center;
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--primary, #3098ed);
    white-space: nowrap;
    overflow: hidden;
}

.logo-icon {
    font-weight: bold;
    color: var(--primary, #3098ed);
}

.sidebar__content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-sm, 8px) 0;
}

.sidebar__menu {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar__footer {
    padding: var(--spacing-md, 16px);
    border-top: 1px solid var(--secondary, #f0f0f0);
    display: flex;
    justify-content: flex-end;
}

.sidebar__collapse-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    color: var(--text-primary, #333);
}

.sidebar__collapse-btn:hover {
    background-color: var(--surface, #f5f5f5);
    color: var(--primary, #3098ed);
}

/* Mobile styles */
@media (max-width: 767px) {
    .sidebar {
        transform: translateX(0);
        transition: transform 0.3s ease, width 0.3s ease;
    }

    .sidebar--collapsed {
        transform: translateX(-100%);
    }
}
</style>

