"use client";

import { pdfjs } from "react-pdf";

// point at the local PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

import { useState } from "react";
import { Document, Page } from "react-pdf";

interface PdfSlideOverProps {
  fileUrl: string;
  onClose: () => void;
}

export function PdfSlideOver({ fileUrl, onClose }: PdfSlideOverProps) {
  const [numPages, setNumPages] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      {/* panel */}
      <div className="relative ml-auto w-full max-w-3xl h-full bg-white text-white shadow-xl flex">
        <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden flex justify-center">
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            {Array.from({ length: numPages }, (_, i) => (
              <Page
                key={i}
                pageNumber={i + 1}
                width={800}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
