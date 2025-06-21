import React from 'react';
import { showToast } from 'utils/toast';

const ToastTest: React.FC = (): React.JSX.Element => {
  const testToasts = (): void => {
    showToast.success('Success toast - this should work!');
    
    setTimeout(() => {
      showToast.error('Error toast - this should work!');
    }, 500);
    
    setTimeout(() => {
      showToast.info('Info toast - this should work!');
    }, 1000);
    
    setTimeout(() => {
      showToast.warning('Warning toast - this should work!');
    }, 1500);
  };

  return (
    <div className="p-3">
      <h3>Toast Test Component</h3>
      <p>Click the button below to test all toast types:</p>
      <button 
        className="btn btn-primary" 
        onClick={testToasts}
        data-test-id="test-toast-button"
      >
        Test All Toasts
      </button>
      <div className="mt-3">
        <p><strong>What to check:</strong></p>
        <ul>
          <li>Toasts appear in top-right corner</li>
          <li>Each toast has correct color (success=green, error=red, etc.)</li>
          <li>Toasts are visible above other content</li>
          <li>Toasts auto-close after 2 seconds</li>
          <li>You can click to close toasts manually</li>
          <li>Maximum 3 toasts show at once</li>
        </ul>
      </div>
    </div>
  );
};

export default ToastTest; 