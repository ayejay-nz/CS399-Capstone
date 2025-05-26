"use client";

import React from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

export function DownloadAnswers() {

  // TODO: Aidan update this for downloading the .txt and excel file in zip (this would be tied to a session)
  async function handleClick() {
    try {
      const res = await fetch("localhost", {
        method: "GET",
        headers: {
          "Content-Type": "application/zip",
        },
      });
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "stats_information.zip";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading answers:", err);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="
        gap-2 
        border-black 
        text-black 
        hover:bg-black 
        hover:text-white 
        hover:border-white 
        transition-colors 
        duration-200 
        ease-in-out
      "
    >
      <Download className="h-4 w-4" />
      Download
    </Button>
  );
}
