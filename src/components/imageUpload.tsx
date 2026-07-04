// ============================================
// FILE: components/ImageUpload.tsx
// ============================================

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null, file?: File) => void;
  onFileChange?: (file: File | null) => void;
  className?: string;
  label?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onFileChange,
  className,
  label = "Upload Gambar",
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      alert("Format gambar harus JPG, PNG, WEBP, atau GIF");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 2MB");
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (onFileChange) {
      onFileChange(file);
    }
    onChange(null, file);

    setIsUploading(false);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null, undefined);
    if (onFileChange) {
      onFileChange(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-xs font-medium text-muted-foreground">
        {label}
      </label>

      <div className="relative">
        {preview ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-background/50">
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white hover:bg-black/90 transition"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div
            onClick={() => !disabled && fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background/30 p-8 transition ${
              disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50 hover:bg-accent/10"
            }`}
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Klik untuk upload gambar
                </p>
                <p className="text-xs text-muted-foreground/60">
                  JPG, PNG, WEBP · Max 2MB
                </p>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading || disabled}
        />
      </div>
    </div>
  );
}