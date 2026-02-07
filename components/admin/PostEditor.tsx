"use client";

import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlock from "@tiptap/extension-code-block";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import { useCallback, useEffect, useRef } from "react";

const extensions = [
  StarterKit.configure({
    codeBlock: false,
  }),
  CodeBlock,
  Placeholder.configure({ placeholder: "Start writing…" }),
  Underline,
  Image.configure({
    inline: false,
    allowBase64: false,
  }),
];

interface PostEditorProps {
  content: JSONContent;
  onChange: (content: JSONContent) => void;
  onImageUpload: (file: File) => Promise<string>;
}

export function PostEditor({ content, onChange, onImageUpload }: PostEditorProps) {
  const onImageUploadRef = useRef(onImageUpload);
  onImageUploadRef.current = onImageUpload;

  const editor = useEditor({
    extensions,
    content,
    editorProps: {
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of items) {
          if (item.type.indexOf("image") !== -1) {
            const file = item.getAsFile();
            if (file) {
              event.preventDefault();
              onImageUploadRef.current(file).then((url) => {
                view.dispatch(view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src: url })
                ));
              }).catch(() => {});
              return true;
            }
          }
        }
        return false;
      },
      handleDrop(view, event) {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        const file = files[0];
        if (file.type.startsWith("image/")) {
          event.preventDefault();
          onImageUploadRef.current(file).then((url) => {
            const { schema } = view.state;
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            if (coordinates) {
              const node = schema.nodes.image.create({ src: url });
              const transaction = view.state.tr.insert(coordinates.pos, node);
              view.dispatch(transaction);
            }
          }).catch(() => {});
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(content);
    if (current !== next) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  const addImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) onImageUploadRef.current(file).then((url) => {
        editor?.chain().focus().setImage({ src: url }).run();
      }).catch(() => {});
    };
    input.click();
  }, [editor]);

  if (!editor) return <div className="animate-pulse h-64 bg-stone-200 dark:bg-stone-700 rounded" />;

  return (
    <div className="border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden bg-white dark:bg-stone-900">
      <div className="flex flex-wrap gap-1 p-2 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          B
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          I
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
          U
        </ToolbarButton>
        <span className="w-px bg-stone-300 dark:bg-stone-600 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}>
          H1
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
          H2
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
          H3
        </ToolbarButton>
        <span className="w-px bg-stone-300 dark:bg-stone-600 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          List
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
          Quote
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}>
          Code
        </ToolbarButton>
        <ToolbarButton onClick={addImage}>
          Image
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="prose prose-stone dark:prose-invert max-w-none p-4 min-h-[320px] font-serif" />
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 text-sm rounded ${active ? "bg-stone-300 dark:bg-stone-600 text-stone-900 dark:text-stone-100" : "text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"}`}
    >
      {children}
    </button>
  );
}
