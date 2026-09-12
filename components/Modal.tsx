"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
}

function subscribeNoop() {
  return () => {};
}

// Portals need `document.body`, which doesn't exist during SSR. This reads
// `false` on the server and `true` once mounted in the browser, without an
// effect-driven extra render pass.
function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export default function Modal({
  open,
  onClose,
  children,
  panelClassName = "max-w-lg",
}: ModalProps) {
  const mounted = useIsClient();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={`max-h-[90vh] w-full overflow-auto rounded-lg border border-border bg-background p-6 ${panelClassName}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
