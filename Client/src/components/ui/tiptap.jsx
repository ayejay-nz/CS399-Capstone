'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: "p-3",
      }
    }
  })

  return (
    <div
      className="flex-1"
      style={{
        backgroundColor: "oklch(35% 0 0)",
        borderRadius: "0.375rem",
        border: "1px solid oklch(40% 0 0)",
      }}
    >
      <EditorContent editor={editor} />
    </div>
  )
}

export default Tiptap