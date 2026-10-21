/**
 * Image Placement & Stamp Tool
 */

import { store } from '../core/state-store.js';
import { uid } from '../utils/helpers.js';
import { Toast } from '../components/toast.js';

export class ImageTool {
  constructor() {
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = 'image/png, image/jpeg, image/webp';
    this.fileInput.style.display = 'none';
    document.body.appendChild(this.fileInput);

    this.fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.placeImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
      this.fileInput.value = '';
    };
  }

  triggerUpload() {
    this.fileInput.click();
  }

  placeImage(dataUrl) {
    const state = store.getState();
    let targetPage = 1;
    for (let i = 1; i <= state.pageCount; i++) {
      if (!state.deletedPages.has(i)) {
        targetPage = i;
        break;
      }
    }

    store.addAnnotation(targetPage, {
      id: uid('img'),
      type: 'image',
      dataUrl,
      x: 0.3,
      y: 0.4,
      width: 0.35,
      height: 0.2
    });

    Toast.success('Image placed! Click and drag to reposition.');
  }
}
