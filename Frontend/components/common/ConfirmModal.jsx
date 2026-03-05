import React from "react";

export const ConfirmModal = ({
  show,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!show) return null;

  return (
    <div className='modal-backdrop-custom'>
      <div className='modal-content-custom shadow-lg'>
        <h5 className='fw-bold mb-3'>{title}</h5>
        <div className='text-muted mb-4'>{message}</div>

        <div className='d-flex justify-content-end gap-2'>
          <button
            className='btn btn-secondary'
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            className='btn btn-danger'
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
