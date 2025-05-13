<script>
export default {
  name: "OperationExecutionView",
  data() {
    return {
      itemsToScan: [
        //E X A M P L E S
        {
          id: 1,
          name: 'Pencil Small Package',
          qr: null,
          photo: null
        },
        {
          id: 2,
          name: 'Eraser Small Package',
          qr: null,
          photo: null
        },
        {
          id: 3,
          name: 'Ruler Medium Package',
          qr: null,
          photo: null
        }
      ],
      containerForm: {
        name: '',
        contentType: ''
      },
      containers: [],
      currentContainer: null,
      //currentContainerPhoto: null, UNUSED
      showCreateContainerModal: false,
      containerItems: [],
      editingContainer: false,
      //showSwapContainerModal: false, UNUSED
    }
  },
  methods: {
    addItemToContainer(item) {
      this.containerItems.push(item);
      this.itemsToScan.pop(item);
    },
    removeItemFromContainer(item) {
      this.itemsToScan.push(item);
      this.containerItems.pop(item);
    },

    enableEditingContainer(container) {
      this.currentContainer = container;
      this.containerForm = {...container};
      this.showCreateContainerModal = true;
    },
    createContainer() {
      this.currentContainer = {
        id: Date.now(),
        ...this.containerForm,
        status: 'activo'
      }
      this.containers.push(this.currentContainer);

      this.showCreateContainerModal = false;
      //reset form
      this.containerForm = {
        name: '',
        contentType: ''
      }
    },

    editContainer() {
      const index = this.containers.findIndex(v => v.id === this.currentContainer.id)
      this.containers[index] = { ...this.currentContainer, ...this.containerForm }

      this.showCreateContainerModal = false;
      //reset form
      this.containerForm = {
        name: '',
        contentType: ''
      }
    },

    finalizeContainer() {
      this.currentContainer.status = 'finalizado';
      this.containers.push(this.currentContainer);
      this.currentContainer = null;
    }
  }
}
</script>

<template>
  <div class="operation-execution">
    <!-- TABLA DE ITEMS A ESCANEAR -->
    <div class="items-table">
      <div class="items-table-preheader">
        <h1>Items a Escanear</h1>
      </div>
      <table>
        <thead>
          <tr> <!-- HEADER COLUMNS -->
            <th>Imagen</th>
            <th>ID</th>
            <th>Nombre</th>
            <th>QR</th>
            <th>Accion</th>
          </tr>
        </thead>
        <tbody> <!-- TABLE BODY -->
          <tr v-for="item in itemsToScan" :key="item.id">
            <td> <!-- IMAGEN -->
              <img :src="item.photo" :alt="item.name" class="table-image">
            </td>
            <td> <!-- ID -->
              {{item.id}}
            </td>
            <td> <!-- NOMBRE -->
              {{item.name}}
            </td>
            <td> <!-- QR -->
              <img :src="item.qr" :alt="item.name" class="table-image">
            </td>
            <td class="table-actions">
              <button @click="addItemToContainer(item)" class="btn-primary">
                Añadir a Contenedor
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- TABLA DE ITEMS EN CONTENEDOR (CURRENT-CONTAINER) -->
    <div class="items-table">
      <div class="items-table-preheader">
        <div v-if="currentContainer === null">
          <h1>Items en Contenedor</h1>
          <button @click="showCreateContainerModal=true" class="btn-primary">
            Crear Contenedor
          </button>
        </div>
        <div v-else>
          <h1>Items en Contenedor: {{currentContainer.name}}</h1>
          <button @click="enableEditingContainer()" class="btn-primary">
            Editar Contenedor
          </button>
          <button @click="finalizeContainer()" class="btn-secondary">
            Finalizar Contenedor
          </button>
        </div>
      </div>
      <table>
        <thead>
        <tr> <!-- HEADER COLUMNS -->
          <th>Imagen</th>
          <th>ID</th>
          <th>Nombre</th>
          <th>QR</th>
        </tr>
        </thead>
        <tbody> <!-- TABLE BODY -->
        <tr v-for="item in containerItems" :key="item.id">
          <td> <!-- IMAGEN -->
            <img :src="item.photo" :alt="item.name" class="table-image">
          </td>
          <td> <!-- ID -->
            {{item.id}}
          </td>
          <td> <!-- NOMBRE -->
            {{item.name}}
          </td>
          <td> <!-- QR -->
            <img :src="item.qr" :alt="item.name" class="table-image">
          </td>
          <td class="table-actions">
            <button @click="removeItemFromContainer(item)" class="btn-secondary">
              Quitar de Contenedor
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL PARA CREACION DE CONTAINER -->
    <div v-if="showCreateContainerModal" class="modal">
      <div class="modal-content">
        <h2>{{currentContainer ? 'Editar Container' : 'Crear Container'}}}</h2>
        <form @submit.prevent="(currentContainer ? editContainer : createContainer)">
          <div class="form-group">
            <label>Nombre Contenedor</label>
            <input v-model="containerForm.name" type="text" required>
          </div>
          <div class="form-group">
            <label>Tipo de Contenido</label>
            <input v-model="containerForm.contentType" type="text" required>
          </div>
          <div class="form-actions">
            <button type="button" @click="showCreateContainerModal = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.operation-execution {
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f9fafa;
  color: #000;
}

.btn-primary {
  background-color: #00bcd4;
  color: #000;
  border: 1px solid black;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-secondary {
  background-color: #f44336;
  color: white;
  border: 1px solid black;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.items-table {
  width: 100%;
  overflow-x: auto;
  border: 2px solid black;
  border-radius: 8px;
  margin-top: 1rem;
}

.items-table-preheader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 2px solid black;
}

.items-table-preheader div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  color: #000;
}

th {
  background-color: #e0f7fa;
  font-weight: bold;
}

.table-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #333;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  z-index: 10;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  border: 2px solid black;
  color: #000;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #000;
}

.form-group input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid black;
  border-radius: 6px;
  font-size: 1rem;
  color: #000;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}
</style>
