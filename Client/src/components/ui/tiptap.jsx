"use client";
import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Heading from "@tiptap/extension-heading";
import { Button } from "@/src/components/ui/button";
import {
  Bold,
  Italic,
  Strikethrough,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
} from "lucide-react";

const Tiptap = ({
  setEditor,
  content = "",
  allowImageUpload = false,
  isQuestionEditor = false,
  error = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: `p-3 text-white focus:outline-2 ${
          isQuestionEditor ? "min-h-[75px]" : "min-h-[40px]"
        }`,
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

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleImageUpload}
      />

      {editor && isQuestionEditor && (
        <div className="flex">
          <div className="flex gap-1">
            <Button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`h-auto w-auto p-1 hover:bg-white/10 ${
                editor.isActive("bold") ? "ring-1 ring-white" : ""
              }`}
              variant="ghost"
              size="sm"
            >
              <Bold className="h-4 w-4 text-gray-400" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`h-auto w-auto p-1 hover:bg-white/10 ${
                editor.isActive("italic") ? "ring-1 ring-white" : ""
              }`}
              variant="ghost"
              size="sm"
            >
              <Italic className="h-4 w-4 text-gray-400" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`h-auto w-auto p-1 hover:bg-white/10 ${
                editor.isActive("strike") ? "ring-1 ring-white" : ""
              }`}
              variant="ghost"
              size="sm"
            >
              <Strikethrough className="h-4 w-4 text-gray-400" />
            </Button>
          </div>

          <div className="flex gap-1">
            <Button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={`p-1 hover:bg-white/10 ${
                editor.isActive("heading", { level: 1 })
                  ? "ring-1 ring-white"
                  : ""
              }`}
              variant="ghost"
              size="sm"
            >
              <Heading1 className="h-4 w-4 text-gray-400" />
            </Button>
            <Button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={`p-1 hover:bg-white/10 ${
                editor.isActive("heading", { level: 2 })
                  ? "ring-1 ring-white"
                  : ""
              }`}
              variant="ghost"
              size="sm"
            >
              <Heading2 className="h-4 w-4 text-gray-400" />
            </Button>
            <Button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              className={`p-1 hover:bg-white/10 ${
                editor.isActive("heading", { level: 3 })
                  ? "ring-1 ring-white"
                  : ""
              }`}
              variant="ghost"
              size="sm"
            >
              <Heading3 className="h-4 w-4 text-gray-400" />
            </Button>
          </div>

          <div className="flex gap-1">
            <Button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1 hover:bg-white/10 ${
                editor.isActive("bulletList") ? "ring-1 ring-white" : ""
              }`}
              variant="ghost"
              size="sm"
            >
              <List className="h-4 w-4 text-gray-400" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-1 hover:bg-white/10 ${
                editor.isActive("orderedList") ? "ring-1 ring-white" : ""
              }`}
              variant="ghost"
              size="sm"
            >
              <ListOrdered className="h-4 w-4 text-gray-400" />
            </Button>
          </div>

          <div className="flex gap-1">
            <Button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-1 hover:bg-white/10 ${
                editor.isActive("blockquote") ? "ring-1 ring-white" : ""
              }`}
              variant="ghost"
              size="sm"
            >
              <Quote className="h-4 w-4 text-gray-400" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-1 hover:bg-white/10 ${
                editor.isActive("codeBlock") ? "ring-1 ring-white" : ""
              }`}
              variant="ghost"
              size="sm"
            >
              <Code className="h-4 w-4 text-gray-400" />
            </Button>
          </div>

          {allowImageUpload && (
            <Button
              onClick={triggerImageUpload}
              className="p-1 hover:bg-white/10"
              variant="ghost"
              size="sm"
            >
              <ImageIcon className="h-4 w-4 text-gray-400" />
            </Button>
          )}
        </div>
      )}

      <div
        className={`flex-1 rounded-md ${
          error
            ? "ring-2 ring-red-500 [&_.tiptap]:border-none"
            : "border border-gray-700"
        }`}
        style={{
          minHeight: isQuestionEditor ? "75px" : "40px",
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Tiptap;
