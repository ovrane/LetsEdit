/**
 * Form Fields Tool
 * Supports Text Field, Checkbox, Radio Button, and Dropdown (Select Menu)
 */

import { store } from '../core/state-store.js';
import { uid } from '../utils/helpers.js';
import { Toast } from '../components/toast.js';

export class FormTool {
  static addField(formType = 'text', pageNum = 1) {
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
    store.addAnnotation(target, {
      id: uid('form'),
      type: 'form',
      formType,
      x: 0.35,
      y: 0.5,
      width: isBox ? 0.04 : (isDropdown ? 0.32 : 0.28),
      height: isBox ? 0.03 : 0.045,
      placeholder: formType === 'text' ? 'Interactive input...' : undefined,
      options: isDropdown ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      value: isDropdown ? 'Option 1' : '',
      checked: false
    });

    Toast.success(`Added ${formType} field! Drag to position.`);
  }
}
