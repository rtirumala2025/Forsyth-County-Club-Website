// Accessibility utilities for WCAG 2.1 AA compliance

// Generate unique IDs for form elements
export const generateId = (prefix = 'element') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create accessible form field props
export const createAccessibleField = (label, error, helpText) => {
  const id = generateId('field');
  const errorId = error ? `${id}-error` : undefined;
  const helpId = helpText ? `${id}-help` : undefined;
  
  return {
    id,
    'aria-label': label,
    'aria-describedby': [errorId, helpId].filter(Boolean).join(' ') || undefined,
    'aria-invalid': !!error,
    'aria-required': true
  };
};

// Create accessible button props
export const createAccessibleButton = (label, loading = false, disabled = false) => {
  return {
    'aria-label': label,
    'aria-disabled': disabled || loading,
    disabled: disabled || loading,
    'aria-busy': loading
  };
};

// Create accessible modal props
export const createAccessibleModal = (title, description) => {
  const id = generateId('modal');
  const titleId = `${id}-title`;
  const descId = `${id}-description`;
  
  return {
    id,
    'aria-labelledby': titleId,
    'aria-describedby': descId,
    'aria-modal': true,
    'role': 'dialog',
    titleId,
    descId
  };
};

// Create accessible table props
export const createAccessibleTable = (caption) => {
  const id = generateId('table');
  const captionId = `${id}-caption`;
  
  return {
    id,
    'aria-labelledby': captionId,
    'role': 'table',
    captionId
  };
};

// Create accessible list props
export const createAccessibleList = (label) => {
  const id = generateId('list');
  
  return {
    id,
    'aria-label': label,
    'role': 'list'
  };
};

// Create accessible list item props
export const createAccessibleListItem = (index, total) => {
  return {
    'role': 'listitem',
    'aria-posinset': index + 1,
    'aria-setsize': total
  };
};

// Create accessible search props
export const createAccessibleSearch = (label, resultsCount) => {
  const id = generateId('search');
  const resultsId = `${id}-results`;
  
  return {
    id,
    'aria-label': label,
    'aria-describedby': resultsId,
    'role': 'searchbox',
    resultsId,
    resultsCount
  };
};

// Create accessible navigation props
export const createAccessibleNav = (label) => {
  const id = generateId('nav');
  
  return {
    id,
    'aria-label': label,
    'role': 'navigation'
  };
};

// Create accessible tab props
export const createAccessibleTab = (label, selected = false, controls) => {
  const id = generateId('tab');
  
  return {
    id,
    'aria-label': label,
    'aria-selected': selected,
    'aria-controls': controls,
    'role': 'tab',
    'tabIndex': selected ? 0 : -1
  };
};

// Create accessible tab panel props
export const createAccessibleTabPanel = (labelledBy) => {
  const id = generateId('tabpanel');
  
  return {
    id,
    'aria-labelledby': labelledBy,
    'role': 'tabpanel',
    'tabIndex': 0
  };
};

// Create accessible alert props
export const createAccessibleAlert = (type = 'info') => {
  const id = generateId('alert');
  
  return {
    id,
    'role': 'alert',
    'aria-live': type === 'error' ? 'assertive' : 'polite',
    'aria-atomic': true
  };
};

// Create accessible progress props
export const createAccessibleProgress = (value, max = 100, label) => {
  const id = generateId('progress');
  
  return {
    id,
    'aria-valuenow': value,
    'aria-valuemax': max,
    'aria-valuemin': 0,
    'aria-label': label,
    'role': 'progressbar'
  };
};

// Create accessible combobox props
export const createAccessibleCombobox = (label, expanded = false, selected) => {
  const id = generateId('combobox');
  const listId = `${id}-list`;
  
  return {
    id,
    'aria-label': label,
    'aria-expanded': expanded,
    'aria-activedescendant': selected,
    'aria-autocomplete': 'list',
    'role': 'combobox',
    'aria-controls': listId,
    listId
  };
};

// Create accessible option props
export const createAccessibleOption = (value, selected = false, index) => {
  const id = generateId('option');
  
  return {
    id,
    'aria-selected': selected,
    'role': 'option',
    'aria-posinset': index + 1,
    'value': value
  };
};

// Focus management utilities
export const focusElement = (element) => {
  if (element && typeof element.focus === 'function') {
    element.focus();
  }
};

export const trapFocus = (container) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };
  
  container.addEventListener('keydown', handleTabKey);
  
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
};

// Screen reader announcements
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Color contrast utilities
export const getContrastRatio = (color1, color2) => {
  // Simplified contrast ratio calculation
  // In production, use a proper color contrast library
  const getLuminance = (color) => {
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(c => {
      c = parseInt(c) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

export const isAccessibleContrast = (color1, color2, level = 'AA') => {
  const ratio = getContrastRatio(color1, color2);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
};
