"use client";

import { pdfjs } from "react-pdf";
import { useState } from "react";
import { Document, Page } from "react-pdf";

// point at the local PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfSlideOverProps {
  fileUrl: string;
  onClose: () => void;
}

export function PdfSlideOver({ fileUrl, onClose }: PdfSlideOverProps) {
  const [numPages, setNumPages] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
 
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

     
      <div
        className="relative text-black dark:text-white w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-lg shadow-xl"
        style={{ backgroundColor: 'oklch(23% 0 0)' }}
      >
        
        <div className="px-4 py-2 text-white text-center font-medium border-b border-gray-600">
          Preview
        </div>

        
        <button
          className="absolute top-2 right-2 text-white hover:text-white"
          onClick={onClose}
          aria-label="Close preview"
        >
          ✕
        </button>

        
        <div className="bg-white dark:bg-gray-800 p-4 overflow-y-auto overflow-x-hidden h-[calc(90vh-3rem)] flex justify-center rounded-b-lg">
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