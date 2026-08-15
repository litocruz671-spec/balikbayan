import { useEffect } from 'react';

/**
 * Calls `onEscape` when the user presses Escape while `active` is true.
 * Used to let keyboard-only users dismiss modals without a mouse, since
 * our modal backdrops only close on click.
 */
export function useEscapeKey(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, onEscape]);
}
