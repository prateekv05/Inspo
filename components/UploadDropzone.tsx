"use client";

import { useRef, useState, type DragEvent } from "react";
import { uploadImageAction } from "@/app/upload/actions";

type Status = "idle" | "uploading" | "done" | "error";

interface UploadDropzoneProps {
  onUploaded?: (url: string) => void;
}

export default function UploadDropzone({ onUploaded }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setError(null);
    setStatus("uploading");

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    uploadImageAction(file)
      .then((url) => {
        setPreviewUrl(url);
        setStatus("done");
        URL.revokeObjectURL(localUrl);
        onUploaded?.(url);
      })
      .catch(() => {
        setStatus("error");
        setError("Upload failed. Try again.");
      });
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-8 py-16 text-center transition-colors ${
          isDragging
            ? "border-foreground/50 bg-foreground/[0.03]"
            : "border-border"
        }`}
      >
        <span className="text-sm text-foreground/70">
          Drag & drop a screenshot, or click to browse
        </span>
        <span className="font-mono text-xs text-foreground/40">
          PNG, JPG, WEBP
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {previewUrl && (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Upload preview"
            className="max-h-96 w-auto rounded-lg border border-border object-contain"
          />
          <span className="font-mono text-xs text-foreground/40">
            {status === "uploading" && "Uploading…"}
            {status === "done" && "Uploaded"}
          </span>
        </div>
      )}
    </div>
  );
}
