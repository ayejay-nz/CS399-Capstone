"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Button } from "@/src/components/ui/button";

const Tiptap = ({ setEditor, content = "", allowImageUpload = false }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "p-3 text-white focus:outline-2",
      },
    },
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editor && setEditor) {
      setEditor(editor);
    }
  }, [editor]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      editor.commands.setImage({ src: reader.result });
    };
    reader.readAsDataURL(file);
    e.target.value = null;

  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); 
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {allowImageUpload && (
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={triggerFileInput}>
            Upload Image
          </Button>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
        </div>
      )}
      <div
        className="flex-1"
        style={{
          backgroundColor: "oklch(35% 0 0)",
          borderRadius: "0.375rem",
          border: "1px solid oklch(40% 0 0)",
          minHeight: "40px",
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Tiptap;