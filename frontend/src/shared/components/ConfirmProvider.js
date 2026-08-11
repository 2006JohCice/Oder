import React, { createContext, useContext, useState, useCallback } from 'react';
import './ConfirmProvider.css';

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    title: 'Xác nhận',
    confirmText: 'Đồng ý',
    cancelText: 'Hủy',
    resolve: null,
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        message: options.message || '',
        title: options.title || 'Xác nhận',
        confirmText: options.confirmText || 'Đồng ý',
        cancelText: options.cancelText || 'Hủy',
        resolve,
      });
    });
  }, []);

  const handleConfirm = () => {
    if (confirmState.resolve) {
      confirmState.resolve(true);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (confirmState.resolve) {
      confirmState.resolve(false);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      
      {confirmState.isOpen && (
        <div className="gp-confirm-overlay" onClick={handleCancel}>
          <div className="gp-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gp-confirm-header">
              <div className="gp-confirm-icon">
                <i className="bi bi-exclamation-circle text-primary"></i>
              </div>
              <h3 className="gp-confirm-title">{confirmState.title}</h3>
            </div>
            <div className="gp-confirm-body">
              <p>{confirmState.message}</p>
            </div>
            <div className="gp-confirm-actions">
              <button className="gp-confirm-cancel-btn" onClick={handleCancel}>
                {confirmState.cancelText}
              </button>
              <button className="gp-confirm-ok-btn" onClick={handleConfirm}>
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
