import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

import {
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

import type { ReactNode } from "react";

export function ActionModal({
  open,
  type = "warning",
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "Konfirmasi",
  loading = false,
  danger = false,
  children,
}: {
  open: boolean;
  type: "success" | "error" | "warning";
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  loading?: boolean;
  danger?: boolean;
  children?: ReactNode;
}) {

  const handleConfirm = async () => {
    if (!onConfirm || loading) return;
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={loading ? undefined : onClose}>
      <AlertDialogContent className="glass-card rounded-2xl">

        <AlertDialogHeader>
          <div className="flex flex-col items-center text-center gap-4">

            {/* ICON */}
            {type === "success" && (
              <CheckCircle className="h-14 w-14 text-emerald-400" />
            )}

            {type === "error" && (
              <XCircle className="h-14 w-14 text-red-400" />
            )}

            {type === "warning" && (
              <AlertTriangle className="h-14 w-14 text-yellow-400" />
            )}

            {/* TITLE */}
            <AlertDialogTitle>
              {title}
            </AlertDialogTitle>

            {/* MESSAGE */}
            <AlertDialogDescription>
              {message}
            </AlertDialogDescription>

            {/* CHILD CONTENT (INI YANG BIKIN SETTING HIDUP) */}
            {children && (
              <div className="mt-4 w-full text-left space-y-3">
                {children}
              </div>
            )}

            {/* BUTTONS */}
            <div className="mt-4 flex gap-3 w-full justify-center">

              <button
                onClick={onClose}
                disabled={loading}
                className="rounded-lg border border-border px-5 py-2 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`rounded-lg px-5 py-2 text-white transition disabled:opacity-50 ${
                  danger
                    ? "bg-red-600 hover:bg-red-700"
                    : "gradient-bg"
                }`}
              >
                {loading
                  ? "Processing..."
                  : danger
                  ? "Keluar"
                  : confirmText}
              </button>

            </div>

          </div>
        </AlertDialogHeader>

      </AlertDialogContent>
    </AlertDialog>
  );
}