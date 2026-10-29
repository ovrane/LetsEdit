/**
 * Form Fields Tool
 * Supports Text Field, Checkbox, Radio Button, and Dropdown (Select Menu)
 */

import { store } from '../core/state-store.js';
import { uid } from '../utils/helpers.js';
import { Toast } from '../components/toast.js';

export class FormTool {
  static addField(formType = 'text', pageNum = 1, x = null, y = null) {
    const state = store.getState();
    let target = pageNum;
    if (state.deletedPages.has(target)) {
      for (let p = 1; p <= state.pageCount; p++) {
        if (!state.deletedPages.has(p)) {
          target = p;
          break;
        }
      }
    }

    const isBox = formType === 'checkbox' || formType === 'radio';
    const isDropdown = formType === 'dropdown';
    const isTextarea = formType === 'textarea';
    const posX = x !== null ? Math.max(0.02, Math.min(0.85, x)) : 0.35;
    const posY = y !== null ? Math.max(0.02, Math.min(0.9, y)) : 0.5;

    store.addAnnotation(target, {
      id: uid('form'),
      type: 'form',
      formType,
      x: posX,
      y: posY,
      width: isBox ? 0.04 : (isDropdown ? 0.32 : (isTextarea ? 0.35 : 0.28)),
      height: isBox ? 0.03 : (isTextarea ? 0.09 : 0.045),
      placeholder: formType === 'text' || formType === 'textarea' ? 'Interactive input...' : undefined,
      options: isDropdown ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      value: isDropdown ? 'Option 1' : '',
      checked: false
    });

    Toast.success(`Added ${formType} field! Drag to position.`);
  }
}
