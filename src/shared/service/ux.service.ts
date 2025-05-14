import { reactive } from 'vue';

export const uxStore = reactive({
  snackbar: {
    visible: false,
    message: '',
    type: 'info',
    duration: 3000
  },
  confirmDialog: {
    visible: false,
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    resolve: null,
    reject: null
  }
});

export class UxService {
  static showSnackbar({ message, type = 'info', duration = 3000 }) {
    uxStore.snackbar.message = message;
    uxStore.snackbar.type = type;
    uxStore.snackbar.duration = duration;
    uxStore.snackbar.visible = true;
  }

  static showConfirmDialog({ title = '', message = '', confirmText = 'Aceptar', cancelText = 'Cancelar' }) {
    return new Promise((resolve, reject) => {
      uxStore.confirmDialog.title = title;
      uxStore.confirmDialog.message = message;
      uxStore.confirmDialog.confirmText = confirmText;
      uxStore.confirmDialog.cancelText = cancelText;
      uxStore.confirmDialog.visible = true;
      uxStore.confirmDialog.resolve = resolve;
      uxStore.confirmDialog.reject = reject;
    });
  }

  static confirm() {
    if (uxStore.confirmDialog.resolve) uxStore.confirmDialog.resolve(true);
    uxStore.confirmDialog.visible = false;
  }

  static cancel() {
    if (uxStore.confirmDialog.reject) uxStore.confirmDialog.reject(false);
    uxStore.confirmDialog.visible = false;
  }
}
