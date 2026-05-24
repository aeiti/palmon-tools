import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog.jsx';

// Button + linked ConfirmDialog. Owns its own open/close state so callers
// don't have to wire confirmReset useState + ConfirmDialog plumbing on
// every page that needs a "reset this section" action.
export default function ResetButton({
  onReset,
  confirmTitle,
  confirmMessage,
  label = 'Reset',
  confirmLabel,
  className = 'btn-ghost',
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        {label}
      </button>
      <ConfirmDialog
        open={open}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmLabel || label}
        danger
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          onReset();
          setOpen(false);
        }}
      />
    </>
  );
}
