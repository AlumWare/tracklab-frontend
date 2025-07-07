<template>
    <div v-if="open" class="qr-modal-overlay">
      <div class="qr-modal">
        <button class="close-btn" @click="close">&times;</button>
        <h2>{{ t('qrScanner.title') }}</h2>
        <div class="qr-modal-tabs">
          <button :class="{active: tab==='camera'}" @click="tab='camera'">{{ t('qrScanner.useCamera') }}</button>
          <button :class="{active: tab==='file'}" @click="tab='file'">{{ t('qrScanner.uploadFile') }}</button>
        </div>
        <div v-if="tab==='camera'">
          <div v-if="!scanning && !scannedValue">
            <button @click="startScan">{{ t('qrScanner.startScan') }}</button>
          </div>
          <div v-if="scanning" class="scanner-area">
            <video ref="video" autoplay playsinline></video>
            <div class="scanner-message">{{ t('qrScanner.scanning') }}</div>
            <button @click="stopScan">{{ t('qrScanner.cancel') }}</button>
          </div>
          <div v-if="scannedValue" class="result-area">
            <div class="success-message">{{ t('qrScanner.success') }}: <strong>{{ scannedValue }}</strong></div>
            <button @click="resetScan">{{ t('qrScanner.scanAgain') }}</button>
          </div>
        </div>
        <div v-if="tab==='file'">
          <input type="file" accept="image/*" @change="onFileChange" />
          <div v-if="filePreview" class="file-preview">
            <img :src="filePreview" alt="QR preview" />
            <img ref="imgElement" :style="{display:'none'}" />
          </div>
          <div v-if="fileReady && !fileScanResult">
            <button @click="processFileScan">{{ t('qrScanner.processImage') }}</button>
          </div>
          <div v-if="fileScanResult" class="result-area">
            <div class="success-message">{{ t('qrScanner.success') }}: <strong>{{ fileScanResult }}</strong></div>
            <button @click="resetFileScan">{{ t('qrScanner.scanAgain') }}</button>
          </div>
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'
  
  const props = defineProps({
    open: { type: Boolean, default: false }
  })
  const emit = defineEmits(['update:open', 'scanned'])
  const { t } = useI18n()
  const video = ref(null)
  const scanning = ref(false)
  const scannedValue = ref(null)
  const error = ref(null)
  const tab = ref('camera')
  let codeReader = null
  let stream = null
  
  // File scan
  const filePreview = ref(null)
  const fileScanResult = ref(null)
  const imgElement = ref(null)
  const fileReady = ref(false)
  
  watch(() => props.open, (val) => {
    if (!val) {
      stopScan()
      resetScan()
      resetFileScan()
    }
  })
  
  function close() {
    emit('update:open', false)
    stopScan()
    resetScan()
    resetFileScan()
  }
  function startScan() {
    scanning.value = true
    error.value = null
    scannedValue.value = null
    codeReader = new BrowserMultiFormatReader()
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => {
        stream = s
        video.value.srcObject = stream
        codeReader.decodeFromVideoDevice(null, video.value, (result, err) => {
          if (result) {
            const value = result.getText()
            if (/^\d+$/.test(value)) {
              scannedValue.value = value
              scanning.value = false
              stopScan()
              emitScanned(value)
              close()
            } else {
              error.value = t('qrScanner.invalidQR')
            }
          } else if (err && !(err instanceof NotFoundException)) {
            error.value = t('qrScanner.error')
          }
        })
      })
      .catch(() => {
        error.value = t('qrScanner.cameraError')
        scanning.value = false
      })
  }
  function stopScan() {
    scanning.value = false
    if (codeReader) codeReader.reset()
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      stream = null
    }
  }
  function resetScan() {
    scannedValue.value = null
    error.value = null
  }
  function emitScanned(value) {
    emit('scanned', value)
  }
  // File scan logic
  function onFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    filePreview.value = URL.createObjectURL(file)
    error.value = null
    fileScanResult.value = null
    fileReady.value = true
    if (imgElement.value) imgElement.value.src = filePreview.value
  }
  async function processFileScan() {
    if (!imgElement.value) return
    // Si la imagen aún no está cargada, esperar a onload
    if (imgElement.value.naturalWidth === 0 || imgElement.value.naturalHeight === 0) {
      imgElement.value.onload = async () => {
        await processFileScan() // Llama recursivamente cuando cargue
      }
      // Si no tiene src, asignarlo (por si acaso)
      if (!imgElement.value.src) imgElement.value.src = filePreview.value
      return
    }
    try {
      // Debug: mostrar dimensiones de la imagen
      console.log('Imagen cargada:', {
        width: imgElement.value.naturalWidth,
        height: imgElement.value.naturalHeight,
        src: imgElement.value.src
      })
      codeReader = new BrowserMultiFormatReader()
      const result = await codeReader.decodeFromImageElement(imgElement.value)
      const value = result.getText()
      if (/^\d+$/.test(value)) {
        fileScanResult.value = value
        emitScanned(value)
        close()
      } else {
        error.value = t('qrScanner.invalidQR')
        console.error('QR encontrado pero no numérico:', value)
      }
    } catch (e) {
      error.value = t('qrScanner.invalidQR') + (e && e.message ? `\n[${e.message}]` : '')
      console.error('Error ZXing al procesar imagen:', e)
    }
  }
  function resetFileScan() {
    fileScanResult.value = null
    filePreview.value = null
    error.value = null
    fileReady.value = false
    if (imgElement.value) imgElement.value.src = ''
  }
  </script>
  
  <style scoped>
  .qr-modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.45);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .qr-modal {
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.18);
    padding: 2rem 2.5rem 2rem 2.5rem;
    min-width: 320px;
    max-width: 95vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 2rem;
    color: #888;
    cursor: pointer;
  }
  .qr-modal-tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .qr-modal-tabs button {
    background: #f5f5f5;
    border: none;
    border-radius: 8px 8px 0 0;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .qr-modal-tabs button.active {
    background: #1976d2;
    color: #fff;
  }
  .scanner-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.7rem;
  }
  video {
    width: 320px;
    max-width: 100%;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  .result-area {
    color: #1976d2;
    font-size: 1.2rem;
    font-weight: 600;
  }
  .success-message {
    color: #388e3c;
  }
  .error-message {
    color: #d32f2f;
    font-weight: 600;
    margin-top: 1rem;
  }
  .file-preview img {
    max-width: 220px;
    margin: 1rem auto;
    display: block;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  button {
    background: #1976d2;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0.6rem 1.2rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 1rem;
  }
  button:hover {
    background: #125ea2;
  }
  </style> 