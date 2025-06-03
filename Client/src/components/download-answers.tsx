"use client";

import React from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function DownloadAnswers() {
  // TODO: Aidan update this for downloading the .txt and excel file in zip (this would be tied to a session)
  async function handleClick() {
    try {
      const res = await fetch("http://localhost:8000/api/v1/marking/download", {
        method: "GET",
        headers: {
          "Content-Type": "application/zip",
        },
      });

      // Always attempt to parse as JSON if the content type is JSON
      let responseData;
      const contentType = res.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await res.json();
      } else {
        responseData = await res.text();
      }

      if (!res.ok) {
        if (
          responseData &&
          typeof responseData === "object" &&
          responseData.message
        ) {
          toast.error(responseData.message);
        } else if (
          typeof responseData === "string" &&
          responseData.length > 0
        ) {
          toast.error(`Server error: ${responseData}`);
        } else {
          toast.error(`Server error: ${res.status} ${res.statusText}`);
        }
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "stats_information.zip";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(responseData.message);
    } catch (error) {
      console.error("Error downloading answers:", error);
      toast.error(
        "Network error or unexpected response format. Please try again.",
      );
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
