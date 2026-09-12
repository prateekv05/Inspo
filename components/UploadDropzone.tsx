"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { upload } from "@vercel/blob/client";

type Status = "staged" | "uploading" | "done" | "error";

interface UploadDropzoneProps {
  onUploaded?: (url: string) => void;
}

export default function UploadDropzone({ onUploaded }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function stageFile(selected: File) {
    if (!selected.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setError(null);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setStatus("staged");
  }

  function handleUpload() {
    if (!file) return;
    setStatus("uploading");

    upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/blob-upload",
    })
      .then((blob) => {
        setStatus("done");
        onUploaded?.(blob.url);
      })
      .catch(() => {
        setStatus("error");
        setError("Upload failed. Try again.");
      });
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) stageFile(dropped);
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
            const selected = event.target.files?.[0];
            if (selected) stageFile(selected);
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
          <div className="flex items-center gap-3">
            {status !== "done" && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={status === "uploading"}
                className="self-start rounded-full border border-border bg-foreground/10 px-3 py-1 text-sm text-foreground transition-colors hover:bg-foreground/15 disabled:opacity-50"
              >
                {status === "uploading" ? "Uploading…" : "Upload"}
              </button>
            )}
            <span className="font-mono text-xs text-foreground/40">
              {status === "staged" && "Ready to upload"}
              {status === "uploading" && "Uploading…"}
              {status === "done" && "Uploaded"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
