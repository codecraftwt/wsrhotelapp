import Toast from 'react-native-toast-message';

// Modern Toast Utility Functions
export const showSuccessToast = (title, message = '') => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'bottom',
    visibilityTime: 4000,
  });
};

export const showErrorToast = (title, message = '') => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    position: 'bottom',
    visibilityTime: 5000,
  });
};

export const showInfoToast = (title, message = '') => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'bottom',
    visibilityTime: 4000,
  });
};

export const showWarningToast = (title, message = '') => {
  Toast.show({
    type: 'warning',
    text1: title,
    text2: message,
    position: 'bottom',
    visibilityTime: 4500,
  });
};

// Validation Error Toast
export const showValidationError = (message = 'Please fix the errors in the form') => {
  showErrorToast('Validation Error', message);
};

// Success Messages
export const showSaveSuccess = (itemName = 'Item') => {
  showSuccessToast('Success', `${itemName} saved successfully`);
};

export const showUpdateSuccess = (itemName = 'Item') => {
  showSuccessToast('Success', `${itemName} updated successfully`);
};

export const showDeleteSuccess = (itemName = 'Item') => {
  showSuccessToast('Success', `${itemName} deleted successfully`);
};

// Error Messages
export const showSaveError = (itemName = 'Item') => {
  showErrorToast('Error', `Failed to save ${itemName.toLowerCase()}`);
};

export const showUpdateError = (itemName = 'Item') => {
  showErrorToast('Error', `Failed to update ${itemName.toLowerCase()}`);
};

export const showDeleteError = (itemName = 'Item') => {
  showErrorToast('Error', `Failed to delete ${itemName.toLowerCase()}`);
};

export const showNetworkError = () => {
  showErrorToast('Network Error', 'Please check your internet connection');
};

// Info Messages
export const showLoadingMessage = (message = 'Loading...') => {
  showInfoToast('Loading', message);
};

export const showNoDataMessage = (message = 'No data found') => {
  showInfoToast('No Data', message);
};

// Warning Messages
export const showUnsavedChanges = () => {
  showWarningToast('Unsaved Changes', 'You have unsaved changes. Are you sure you want to leave?');
};

export const showDeleteConfirmation = (itemName = 'item') => {
  showWarningToast('Confirm Delete', `Are you sure you want to delete this ${itemName}?`);
}; 