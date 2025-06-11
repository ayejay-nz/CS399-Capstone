import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface UseFileUploadProps {
  onUpload?: (file: File, url: string | null) => void;
}

export function useFileUpload({ onUpload }: UseFileUploadProps = {}) {
  const previewRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setFileName(file.name);
        setIsFileUploaded(true);

        if (file.type.startsWith("image/")) {
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
          previewRef.current = url;
          onUpload?.(file, url);
        } else {
          setPreviewUrl(null);
          previewRef.current = null;
          onUpload?.(file, null);
        }
      }
    },
    [onUpload],
  );

  const handleRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFileName(null);
    previewRef.current = null;
    setIsFileUploaded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  return {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    isFileUploaded,
  };
}

interface FileUploadProps {
  onUpload?: (file: File, url: string | null) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  title?: string;
  subtitle?: string;
  successMessage?: string;
}

export function FileUpload({
  onUpload,
  accept = "*/*",
  maxSizeMB = 5,
  className,
  title = "Upload File",
  subtitle = "Supported formats: TXT, XLSX, PDF, JPG, PNG",
  successMessage,
}: FileUploadProps) {
  const {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    isFileUploaded,
  } = useFileUpload({ onUpload });

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="h-full w-full bg-[#0D0D0D] rounded-[20px] p-6 border border-white">
        <div
          onClick={handleThumbnailClick}
          className={cn(
            "relative h-full w-full",
            "border border-dashed border-white",
            "rounded-[12px] cursor-pointer",
            "transition-all duration-200 hover:border-white",
            "flex flex-col items-center justify-center",
            "p-4 md:p-8",
          )}
          style={{
            aspectRatio: "4 / 3",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload file"
          />

          {previewUrl ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-0 right-0 p-2 bg-black/50 rounded-full hover:bg-black/70"
                aria-label="Remove file"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ) : isFileUploaded && fileName ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center text-center px-4">
              <p className="text-lg font-medium text-white mb-2">
                {successMessage || "File uploaded successfully!"}
              </p>
              <p className="text-sm text-gray-400 break-all">{fileName}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-0 right-0 p-2 bg-black/50 rounded-full hover:bg-black/70"
                aria-label="Remove file"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-6 h-6 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 19V5M12 5l-4 4m4-4l4 4"
                />
              </svg>
              <div className="flex flex-col items-center gap-1 mt-4">
                <p className="text-sm text-gray-400">Click to select</p>
                <p className="text-xs text-gray-500">
                  or drag and drop file here
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      {fileName && !isFileUploaded && (
        <p className="mt-2 text-sm text-gray-400">Selected file: {fileName}</p>
      )}
    </div>
  );
}
