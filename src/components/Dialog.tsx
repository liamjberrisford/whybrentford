import { useEffect, useRef, type ReactNode } from 'react';

export default function Dialog({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    return () => { dialog.close(); trigger?.focus(); };
  }, []);
  return <dialog ref={ref} className={`workspace-dialog ${wide ? 'wide-dialog' : ''}`} aria-label={title} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <header><h2>{title}</h2><button onClick={onClose} autoFocus aria-label={`Close ${title}`}>Close ✕</button></header>
    <div className="dialog-content">{children}</div>
  </dialog>;
}
