"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { useCopy } from "@/features/dashboard/i18n/copy";
import { Icon } from "@/features/dashboard/shell/icons";
import { previewUrl } from "./preview-url";
import { ACCEPTED_TYPES, MediaUploadError, uploadImage } from "./upload";

type DropzoneProps = {
  /** Called once per uploaded image, in the order they were chosen. */
  onUploaded: (url: string) => void;
  multiple?: boolean;
  /** Current image to preview (single mode). */
  value?: string;
  alt?: { ar?: string; en?: string };
  compact?: boolean;
  allowUrl?: boolean;
  onUrlChange?: (url: string) => void;
  onError?: (message: string) => void;
};

export function Dropzone({
  onUploaded,
  multiple = false,
  value,
  alt,
  compact = false,
  allowUrl = false,
  onUrlChange,
  onError,
}: DropzoneProps) {
  const { copy } = useCopy();
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState("");

  async function handleFiles(list: FileList | File[]) {
    const files = Array.from(list).filter(Boolean);
    const chosen = multiple ? files : files.slice(0, 1);
    if (!chosen.length) return;
    setError("");
    setProgress({ done: 0, total: chosen.length });
    // Upload sequentially: the API rate-limits uploads per minute.
    for (const [index, file] of chosen.entries()) {
      try {
        const url = await uploadImage(file, alt);
        onUploaded(url);
      } catch (cause) {
        const reason =
          cause instanceof MediaUploadError ? cause.reason : "failed";
        const message = copy.media[reason];
        setError(message);
        onError?.(message);
        if (reason === "rateLimited") break;
      }
      setProgress({ done: index + 1, total: chosen.length });
    }
    setProgress(null);
    if (input.current) input.current.value = "";
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (progress) return;
    void handleFiles(event.dataTransfer.files);
  }

  const showPreview = !multiple && value;

  return (
    <div className={`dropzone-wrap ${compact ? "compact" : ""}`}>
      <label
        htmlFor={inputId}
        className={`dropzone ${dragging ? "dragging" : ""} ${showPreview ? "has-preview" : ""} ${progress ? "busy" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {showPreview ? (
          <>
            <Image
              src={previewUrl(value)}
              alt=""
              fill
              unoptimized
              sizes="480px"
              className="dropzone-preview"
            />
            <span className="dropzone-overlay">
              <Icon name="upload" />
              {progress ? copy.media.uploading : copy.media.replace}
            </span>
          </>
        ) : (
          <span className="dropzone-empty">
            <span className="dropzone-icon">
              <Icon name={progress ? "upload" : "image"} size={22} />
            </span>
            <strong>
              {progress
                ? `${copy.media.uploading} ${progress.done}/${progress.total}`
                : multiple
                  ? copy.media.drop
                  : copy.media.dropOne}
            </strong>
            <small>{copy.media.formats}</small>
          </span>
        )}
        {progress && (
          <span
            className="dropzone-progress"
            style={{
              width: `${Math.max(8, (progress.done / progress.total) * 100)}%`,
            }}
          />
        )}
        <input
          ref={input}
          id={inputId}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple={multiple}
          disabled={Boolean(progress)}
          onChange={(event) => {
            if (event.target.files) void handleFiles(event.target.files);
          }}
          className="visually-hidden"
        />
      </label>
      {allowUrl && onUrlChange && (
        <input
          type="url"
          dir="ltr"
          className="url-input"
          value={value ?? ""}
          placeholder={copy.media.pasteUrl}
          onChange={(event) => onUrlChange(event.target.value)}
        />
      )}
      {error && !onError && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
