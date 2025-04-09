"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Tiptap = ({ setEditor, content = "" }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        class: "p-3 text-white focus:outline-2",
      },
    },
  });

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

  return (
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
  );
};

export default Tiptap;