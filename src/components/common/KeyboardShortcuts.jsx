import { useEffect } from 'react';

const SHORTCUTS = {
  '/': 'Buscar estudiantes (en lista de estudiantes)',
  'n': 'Añadir estudiante',
  'c': 'Crear contenido',
  'g d': 'Ir a Dashboard',
  'g s': 'Ir a Estudiantes',
  'g c': 'Ir a Contenido',
  '?': 'Mostrar ayuda de teclado',
};

export const useKeyboardShortcuts = (handlers = {}) => {
  useEffect(() => {
    let buffer = '';
    const timerRef = { current: null };
    const handler = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handlers.showHelp?.();
        return;
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handlers.focusSearch?.();
        return;
      }
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handlers.addStudent?.();
        return;
      }
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handlers.createContent?.();
        return;
      }
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
        buffer = 'g';
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => { buffer = ''; }, 500);
        return;
      }
      if (buffer === 'g') {
        buffer = '';
        if (e.key === 'd') { e.preventDefault(); handlers.goDashboard?.(); }
        if (e.key === 's') { e.preventDefault(); handlers.goStudents?.(); }
        if (e.key === 'c') { e.preventDefault(); handlers.goContent?.(); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handlers]);
};

export const KeyboardShortcutsHelp = ({ onClose }) => (
  <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Atajos de teclado">
    <div className="modal-content keyboard-shortcuts-modal" onClick={(e) => e.stopPropagation()}>
      <div className="slide-panel-header">
        <h2>Atajos de teclado</h2>
        <button className="slide-close" onClick={onClose} aria-label="Cerrar">✕</button>
      </div>
      <div className="shortcuts-list">
        {Object.entries(SHORTCUTS).map(([key, desc]) => (
          <div key={key} className="shortcut-row">
            <kbd className="shortcut-key">{key}</kbd>
            <span className="shortcut-desc">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default KeyboardShortcutsHelp;
