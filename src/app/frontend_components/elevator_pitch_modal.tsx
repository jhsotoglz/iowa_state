import Link from "next/link";

interface ElevatorPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function ElevatorPitchModal({isOpen, onClose, children,}: ElevatorPitchModalProps) {
    if (!isOpen) return null;
    
    return (
    <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
    >
        <div
        className="bg-base-100 rounded-xl shadow-lg p-6 w-full max-w-lg mx-4 relative"
        onClick={(e) => e.stopPropagation()}
        >
        {children}
        <button
            onClick={onClose}
            className="absolute top-3 right-3 btn btn-sm btn-circle btn-ghost"
            aria-label="Close"
        >
            ✕
        </button>
        </div>
    </div>
    );
}
