"use client";
import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, Mark } from "@tiptap/react";
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
  Underline as UnderlineIcon,
} from "lucide-react";

const Underline = Mark.create({
  name: "underline",
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  parseHTML() {
    return [
      {
        tag: "u",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["u", HTMLAttributes, 0];
  },
  addCommands() {
    return {
      toggleUnderline:
        () =>
        ({ chain }) => {
          return chain().toggleMark("underline").run();
        },
    };
  },
});

const Tiptap = ({
  setEditor,
  content = "",
  allowImageUpload = false,
  isQuestionEditor = false,
  error = false,
  onUpdate,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: `p-3 text-white focus:ring-1 focus:ring-gray-300 focus:ring-offset-background rounded-md ${
          isQuestionEditor ? "min-h-[75px]" : "min-h-[40px]"
        }`,
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  if (!isMounted) return null;

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
        <div className="flex flex-wrap gap-1">
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
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`h-auto w-auto p-1 hover:bg-white/10 ${
                editor.isActive("underline") ? "ring-1 ring-white" : ""
              }`}
              variant="ghost"
              size="sm"
            >
              <UnderlineIcon className="h-4 w-4 text-gray-400" />
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
        className={`flex-1 rounded-md border ${
          error ? "border-red-500" : "border-[#27272a]"
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
