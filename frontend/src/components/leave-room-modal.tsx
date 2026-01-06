"use client";

import { LogOut, Trash2, X, AlertTriangle } from "lucide-react";

interface LeaveRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
  onConfirm: (deleteRoom: boolean) => void;
}

export function LeaveRoomModal({
  isOpen,
  onClose,
  isHost,
  onConfirm,
}: LeaveRoomModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="glass-card relative w-full max-w-md overflow-hidden rounded-2xl border border-border p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-destructive">
            <div className="bg-destructive/10 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="font-heading font-700 text-xl">Leaving Room</h2>
          </div>
          <button
            onClick={onClose}
            className="smooth-transition text-muted-foreground hover:text-foreground rounded-lg p-2 hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-8">
            <p className="text-foreground text-sm leading-relaxed">
                {isHost 
                    ? "You are the host of this room. How would you like to proceed?"
                    : "Are you sure you want to leave this room? You can always join back later."}
            </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
            {isHost ? (
                <>
                    <button
                        onClick={() => onConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 bg-destructive hover:bg-destructive/90 text-white font-600 smooth-transition rounded-xl py-4 shadow-lg shadow-destructive/20"
                    >
                        <Trash2 className="h-5 w-5" />
                        Leave and Delete Room
                    </button>
                    <button
                        onClick={() => onConfirm(false)}
                        className="w-full flex items-center justify-center gap-2 border border-border bg-muted/30 hover:bg-muted/50 text-foreground font-600 smooth-transition rounded-xl py-4"
                    >
                        <LogOut className="h-5 w-5" />
                        Leave and Keep Room
                    </button>
                </>
            ) : (
                <button
                    onClick={() => onConfirm(false)}
                    className="w-full flex items-center justify-center gap-2 bg-destructive hover:bg-destructive/90 text-white font-600 smooth-transition rounded-xl py-4 shadow-lg shadow-destructive/20"
                >
                    <LogOut className="h-5 w-5" />
                    Confirm Leave
                </button>
            )}
            
            <button
                onClick={onClose}
                className="w-full text-muted-foreground hover:text-foreground font-500 text-sm py-2 hover:underline transition-all"
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
}
