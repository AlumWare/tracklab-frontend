<template>
  <div class="file-uploader">
    <label 
      :for="id" 
      class="file-uploader__label"
      :class="{ 'file-uploader__label--dragging': isDragging }"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <div class="file-uploader__content">
        <span v-if="!hasFiles">
          {{ $t('fileUploader.dragAndDrop') }}
          <span class="file-uploader__browse">{{ $t('fileUploader.browse') }}</span>
        </span>
        <div v-else class="file-uploader__files">
          <div v-for="(file, index) in files" :key="index" class="file-uploader__file">
            <img v-if="isImage(file)" :src="getPreviewUrl(file)" class="file-uploader__preview" />
            <span class="file-uploader__filename">{{ file.name }}</span>
            <button 
              type="button" 
              class="file-uploader__remove" 
              @click.stop="removeFile(index)"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </label>
    <input
      :id="id"
      ref="fileInput"
      type="file"
      class="file-uploader__input"
      :multiple="multiple"
      :accept="accept"
      @change="handleFileSelect"
    >
    <span v-if="error" class="file-uploader__error">{{ error }}</span>
  </div>
</template>

<script>
export default {
  name: 'FileUploader',
  props: {
    modelValue: {
      type: [File, Array],
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: false
    },
    accept: {
      type: String,
      default: '*'
    },
    maxSize: {
      type: Number,
      default: 5 * 1024 * 1024 // 5MB por defecto
    },
    maxFiles: {
      type: Number,
      default: 5
    }
  },
  emits: ['update:modelValue', 'error'],
  data() {
    return {
      isDragging: false,
      error: '',
      id: `file-uploader-${Math.random().toString(36).substr(2, 9)}`
    }
  },
  computed: {
    files() {
      return Array.isArray(this.modelValue) ? this.modelValue : [this.modelValue].filter(Boolean)
    },
    hasFiles() {
      return this.files.length > 0
    }
  },
  methods: {
    handleDrop(event) {
      this.isDragging = false
      this.processFiles(event.dataTransfer.files)
    },
    handleFileSelect(event) {
      this.processFiles(event.target.files)
    },
    processFiles(fileList) {
      const files = Array.from(fileList)
      
      // Validaciones
      if (!this.multiple && files.length > 1) {
        this.setError(this.$t('fileUploader.errors.singleFile'))
        return
      }

      if (this.multiple && files.length + this.files.length > this.maxFiles) {
        this.setError(this.$t('fileUploader.errors.tooManyFiles', { max: this.maxFiles }))
        return
      }

      const invalidFiles = files.filter(file => file.size > this.maxSize)
      if (invalidFiles.length) {
        this.setError(this.$t('fileUploader.errors.fileTooBig', { maxSize: this.formatSize(this.maxSize) }))
        return
      }

      // Actualizar valor
      const newFiles = this.multiple 
        ? [...this.files, ...files]
        : files[0]
      
      this.$emit('update:modelValue', newFiles)
      this.error = ''
    },
    removeFile(index) {
      const newFiles = [...this.files]
      newFiles.splice(index, 1)
      this.$emit('update:modelValue', this.multiple ? newFiles : null)
    },
    setError(message) {
      this.error = message
      this.$emit('error', message)
    },
    isImage(file) {
      return file.type.startsWith('image/')
    },
    getPreviewUrl(file) {
      return URL.createObjectURL(file)
    },
    formatSize(bytes) {
      const units = ['B', 'KB', 'MB', 'GB']
      let size = bytes
      let unitIndex = 0
      
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      
      return `${Math.round(size)} ${units[unitIndex]}`
    }
  }
}
</script>

<style lang="scss" scoped>
.file-uploader {
  width: 100%;

  &__label {
    display: block;
    padding: 2rem;
    border: 2px dashed var(--color-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--color-primary);
    }

    &--dragging {
      border-color: var(--color-primary);
      background-color: var(--color-background-soft);
    }
  }

  &__content {
    text-align: center;
  }

  &__browse {
    color: var(--color-primary);
    text-decoration: underline;
    margin-left: 0.5rem;
  }

  &__input {
    display: none;
  }

  &__files {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1rem;
  }

  &__file {
    position: relative;
    width: 100px;
    height: 100px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    overflow: hidden;
  }

  &__preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__filename {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 0.75rem;
    padding: 0.25rem;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  &__remove {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    line-height: 1;
    padding: 0;

    &:hover {
      background: rgba(0, 0, 0, 0.9);
    }
  }

  &__error {
    display: block;
    color: var(--color-error);
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
}
</style> 