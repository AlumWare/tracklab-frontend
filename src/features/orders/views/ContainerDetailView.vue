<script>
export default {
  name: 'ContainerDetailView',
  data() {
    return {
      containers: [
        {
          id: 1,
          name: 'CONTAINER 1',
          contentType: 'UTILES ESCOLARES',
          items: [
            {
              id: 5,
              name: 'Lapices LANDSTALKER',
              photo: '/path/to/photo.jpg',
              status: 'Disponible'
            },
            {
              id: 6,
              name: 'Borradores Navarrete',
              photo: '/path/to/photo.jpg',
              status: 'Disponible'
            },
            {
              id: 7,
              name: 'Tajadores Navarrete',
              photo: '/path/to/photo.jpg',
              status: 'Disponible'
            }
          ],
          status: 'En Procesamiento',
          nodes: [
            {
              id: 1,
              name: 'NODO 1',
              description: 'PROVEEDOR ABC',
              visited: true
            },
            {
              id: 2,
              name: 'NODO 2',
              description: 'PROVEEDOR DEF',
              visited: false
            },
            {
              id: 3,
              name: 'NODO 3',
              description: 'PROVEEDOR GHI',
              visited: false
            }
          ]
        },
        {
          id: 2,
          name: 'CONTAINER 2',
          contentType: 'JUGUETES',
          items: [
            {
              id: 8,
              name: 'Pelotas',
              photo: '/path/to/photo.jpg',
              status: 'Disponible'
            }
          ],
          status: 'En Almacen',
          nodes: []
        }
      ],
      container: null,
      containerStatuses: [
        { id: 1, description: 'En Almacen' },
        { id: 2, description: 'En Procesamiento' },
        { id: 3, description: 'En Camino' },
        { id: 4, description: 'Entregado' }
      ],
      removedItems: [],
      viewMoveDetailsModal: false,
      viewRemovedItemsModal: false,
      selectedContainerId: ''
    }
  },
  methods: {
    removeFromContainer(item) {
      this.removedItems.push(item);
      this.container.items = this.container.items.filter(IT => IT.id !== item.id);
    },
    reassignItemToContainer(item) {
      if (!this.container.items.some(i => i.id === item.id)) {
        this.container.items.push(item);
      }
      this.removedItems = this.removedItems.filter(IT => IT.id !== item.id);
    },
    closeAndSaveContainer() {
      if (!this.container) return;
      if (this.container.status === 'Cerrado') {
        alert('Este contenedor ya ha sido cerrado.');
        return;
      }
      const index = this.containers.findIndex(c => c.id === this.container.id);
      if (index !== -1) {
        this.containers[index] = { ...this.container };
        this.containers[index].status = 'Cerrado';
        this.container.status = 'Cerrado';
      }
    },
    loadContainer(containerId) {
      const selected = this.containers.find(i => i.id === Number(containerId));
      if (selected) {
        this.container = selected;
        this.selectedContainerId = selected.id;
        this.removedItems = [];
      } else {
        this.container = null;
      }
    },
    showMovementDetails(node) {
      alert(`Detalles del nodo: ${node.name} - ${node.description}`);
    }
  }
}
</script>

<template>
  <div class="container-detail">
    <select class="container-select" v-model="selectedContainerId" @change="loadContainer($event.target.value)">
      <option disabled value="">Selecciona un contenedor</option>
      <option v-for="cont in containers" :key="cont.id" :value="cont.id">
        {{ cont.name }}
      </option>
    </select>

    <div v-if="container">
      <h2>{{ container.name }} - {{ container.contentType }}</h2>
      <div class="container-items-grid">
        <div v-for="cItem in container.items" :key="cItem.id" class="container-item-card">
          <div class="item-image">
            <img :src="cItem.photo" :alt="cItem.name">
          </div>
          <div class="item-info">
            <h3>{{ cItem.name }}</h3>
            <span class="badge">{{ cItem.status }}</span>
            <div class="item-actions">
              <button class="negative-btn" @click="removeFromContainer(cItem)">Eliminar</button>
            </div>
          </div>
        </div>
      </div>

      <div class="container-actions">
        <button class="info-btn" @click="viewRemovedItemsModal = true">Ver Items Eliminados</button>
        <button class="negative-btn" @click="closeAndSaveContainer">Cerrar Contenedor</button>
      </div>

      <div class="container-nodes">
        <h3>Línea de Tiempo</h3>
        <ul>
          <li v-for="node in container.nodes" :key="node.id">
            <span :class="{ visited: node.visited }">
              {{ node.name }} - {{ node.description }}
            </span>
            <button class="info-btn" @click="showMovementDetails(node)">Ver Detalles</button>
          </li>
        </ul>
      </div>

      <div v-if="viewRemovedItemsModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="viewRemovedItemsModal = false">&times;</span>
          <h3>Items Eliminados</h3>
          <div v-if="removedItems.length === 0">
            <p>No hay ítems eliminados.</p>
          </div>
          <div v-else>
            <ul>
              <li v-for="item in removedItems" :key="item.id">
                {{ item.name }}
                <button class="positive-btn" @click="reassignItemToContainer(item)">Reasignar</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container-detail {
  padding: 1.5rem;
}
.container-select {
  margin-bottom: 1rem;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  color: #333;
  width: 100%;
  max-width: 300px;
  box-sizing: border-box;
}
.container-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  border: 1px dashed #aaa;
  padding: 1rem;
  border-radius: 8px;
  background: #f4f4f4;
}
.container-item-card {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.item-image img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}
.badge {
  display: inline-block;
  background-color: #007ad9;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}
.item-actions {
  margin-top: 0.75rem;
}

.info-btn {
  background-color: #007ad9;
  color: white;
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.info-btn:hover {
  background-color: #0069b3;
}

.positive-btn {
  background-color: #28a745;
  color: white;
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.positive-btn:hover {
  background-color: #218838;
}

.negative-btn {
  background-color: #dc3545;
  color: white;
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.negative-btn:hover {
  background-color: #c82333;
}

.container-nodes {
  padding: 1rem;
}
.container-nodes ul {
  list-style: none;
  padding-left: 0;
}
.container-nodes li {
  padding: 0.5rem 0;
  margin-bottom: 0.75rem;
}
.container-nodes .visited {
  font-weight: bold;
  color: green;
}

.container-actions button {
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 1rem;
  margin-top: 1rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-sizing: border-box;
}
.close {
  float: right;
  font-size: 1.2rem;
  cursor: pointer;
}
</style>
