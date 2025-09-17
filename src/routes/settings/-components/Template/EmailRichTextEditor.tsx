import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Typography from '@tiptap/extension-typography';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Code, Monitor, Tablet, Smartphone } from 'lucide-react';
import './EmailRichTextEditor.css';

interface EmailRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  minHeight?: number | string;
  className?: string;
  onInsertVariable?: (variable: string) => void;
}

export function EmailRichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder = 'Enter email body content...',
  minHeight = 200,
  className = '',
  onInsertVariable,
}: EmailRichTextEditorProps) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [contentView, setContentView] = useState<'editor' | 'source'>('editor');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'laptop'>('laptop');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [previewWidth, setPreviewWidth] = useState(1024);

  const DEVICE_PRESETS: Record<typeof previewDevice, { label: string; width: number }> = {
    mobile: { label: 'Mobile', width: 390 },
    tablet: { label: 'Tablet', width: 768 },
    laptop: { label: 'Laptop', width: 1024 },
  };

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update preview width when device or window width changes
  useEffect(() => {
    const deviceWidth = DEVICE_PRESETS[previewDevice].width;
    const availableWidth = windowWidth - 120; // Account for padding and margins
    setPreviewWidth(Math.min(deviceWidth, availableWidth));
  }, [previewDevice, windowWidth]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Highlight,
      TextStyle,
      Color,
      Typography,
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
          class: 'text-blue-600 underline font-medium hover:text-blue-700',
          style: 'color:#2563eb;text-decoration:underline;font-weight:500;',
        },
        protocols: ['http', 'https', 'mailto', 'tel'],
      }),
      Image.configure({ inline: false, allowBase64: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        style: `min-height: ${typeof minHeight === 'number' ? `${minHeight}px` : minHeight}; outline: none;`,
        class: `prose prose-neutral prose-sm max-w-none focus:outline-none ${className}`,
      },
    },
  });

  // Sync external value changes into TipTap
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if ((value || '') !== current) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  const insertLink = useCallback(() => {
    if (!editor) return;
    const currentAttrs = editor.getAttributes('link') as { href?: string };
    const sel = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to) || '';
    setLinkUrl(currentAttrs?.href || '');
    setLinkText(sel);
    setShowLinkModal(true);
  }, [editor]);

  const insertImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          if (src && editor) {
            editor.chain().focus().setImage({ src, alt: file.name }).run();
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [editor]);

  const canUndo = !!editor?.can().undo();
  const canRedo = !!editor?.can().redo();

  return (
    <div className={`rounded-md border bg-white shadow-sm ${className || ''}`.trim()}>
      {/* View Toggle Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b p-3 gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setContentView('editor')}
            className={`flex items-center gap-2 ${
              contentView === 'editor'
                ? 'bg-primary-600 text-white border-primary-600 font-semibold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Code className="size-4" />
            Rich Editor
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setContentView('source')}
            className={`flex items-center gap-2 ${
              contentView === 'source'
                ? 'bg-primary-600 text-white border-primary-600 font-semibold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Code className="size-4" />
            HTML Source
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPreviewOpen(true)}
          disabled={isPreviewOpen}
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Eye className="size-4" />
          Preview
        </Button>
      </div>

      {/* Editor Content */}
      {contentView === 'editor' && (
        <>
          {/* Toolbar */}
          <div className="tiptap-toolbar flex flex-wrap items-center gap-1 overflow-x-auto border-b p-2 text-sm">
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Bold"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`rounded px-2 py-1 hover:bg-neutral-100 ${editor?.isActive('bold') ? 'bg-neutral-200' : ''}`}
            data-active={editor?.isActive('bold')}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            title="Italic"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`rounded px-2 py-1 hover:bg-neutral-100 ${editor?.isActive('italic') ? 'bg-neutral-200' : ''}`}
            data-active={editor?.isActive('italic')}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            title="Underline"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`rounded px-2 py-1 hover:bg-neutral-100 ${editor?.isActive('underline') ? 'bg-neutral-200' : ''}`}
            data-active={editor?.isActive('underline')}
          >
            <u>U</u>
          </button>
          <button
            type="button"
            title="Highlight"
            onClick={() => editor?.chain().focus().toggleHighlight().run()}
            className={`rounded px-2 py-1 hover:bg-neutral-100 ${editor?.isActive('highlight') ? 'bg-neutral-200' : ''}`}
            data-active={editor?.isActive('highlight')}
          >
            HL
          </button>
        </div>

        <div className="mx-1 h-6 w-px bg-neutral-200" />

        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Bullet List"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`rounded px-2 py-1 hover:bg-neutral-100 ${editor?.isActive('bulletList') ? 'bg-neutral-200' : ''}`}
            data-active={editor?.isActive('bulletList')}
          >
            •
          </button>
          <button
            type="button"
            title="Ordered List"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`rounded px-2 py-1 hover:bg-neutral-100 ${editor?.isActive('orderedList') ? 'bg-neutral-200' : ''}`}
            data-active={editor?.isActive('orderedList')}
          >
            1.
          </button>
          <button
            type="button"
            title="Blockquote"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className={`rounded px-2 py-1 hover:bg-neutral-100 ${editor?.isActive('blockquote') ? 'bg-neutral-200' : ''}`}
            data-active={editor?.isActive('blockquote')}
          >
            &ldquo; &rdquo;
          </button>
        </div>

        <div className="mx-1 h-6 w-px bg-neutral-200" />

        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Align Left"
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            className="rounded px-2 py-1 hover:bg-neutral-100"
          >
            L
          </button>
          <button
            type="button"
            title="Align Center"
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            className="rounded px-2 py-1 hover:bg-neutral-100"
          >
            C
          </button>
          <button
            type="button"
            title="Align Right"
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            className="rounded px-2 py-1 hover:bg-neutral-100"
          >
            R
          </button>
        </div>

        <div className="mx-1 h-6 w-px bg-neutral-200" />

        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Insert Link"
            onClick={insertLink}
            className="rounded px-2 py-1 hover:bg-neutral-100"
          >
            🔗
          </button>
          <button
            type="button"
            title="Insert Image"
            onClick={insertImage}
            className="rounded px-2 py-1 hover:bg-neutral-100"
          >
            🖼️
          </button>
        </div>

        <div className="mx-1 h-6 w-px bg-neutral-200" />

        <div className="flex items-center gap-1">
          <span className="text-xs text-neutral-500">Color</span>
          <input
            type="color"
            onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
            className="h-6 w-6 cursor-pointer rounded border p-0"
          />
        </div>

        <span className="ml-auto flex gap-1">
          <button
            type="button"
            disabled={!canUndo}
            onClick={() => editor?.chain().focus().undo().run()}
            className="rounded px-2 py-1 hover:bg-neutral-100 disabled:opacity-50"
          >
            Undo
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={() => editor?.chain().focus().redo().run()}
            className="rounded px-2 py-1 hover:bg-neutral-100 disabled:opacity-50"
          >
            Redo
          </button>
        </span>
      </div>

          {/* Editor Content */}
          <div className="p-2" style={{ maxHeight: 'inherit', minHeight: 'inherit', overflowY: 'auto' }}>
            <EditorContent
              editor={editor}
              onBlur={onBlur}
              className="tiptap-content"
              style={{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight, maxHeight: 'inherit' }}
            />
          </div>
        </>
      )}

      {/* Source View */}
      {contentView === 'source' && (
        <div className="p-2">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
            placeholder="Edit raw HTML source..."
          />
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/20">
          <div className="w-full max-w-md rounded-md border bg-white p-4 shadow-lg">
            <div className="mb-3 text-sm font-medium">Insert Link</div>
            <div className="mb-2">
              <label className="mb-1 block text-xs text-neutral-600">URL</label>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-xs text-neutral-600">Text</label>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Link text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="rounded px-3 py-1 text-sm hover:bg-neutral-100"
                onClick={() => setShowLinkModal(false)}
              >
                Cancel
              </button>
              <button
                className="rounded bg-neutral-100 px-3 py-1 text-sm hover:bg-neutral-200"
                onClick={() => {
                  if (!editor || !linkUrl) { setShowLinkModal(false); return; }
                  const { from, to } = editor.state.selection;
                  if (from === to) {
                    const text = linkText?.trim() || linkUrl;
                    editor
                      .chain()
                      .focus()
                      .insertContent(text)
                      .setTextSelection({ from, to: from + text.length })
                      .setLink({ href: linkUrl })
                      .setTextSelection({ from: from + text.length, to: from + text.length })
                      .run();
                  } else {
                    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
                  }
                  setShowLinkModal(false);
                }}
              >
                Apply
              </button>
              <button
                className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
                onClick={() => {
                  editor?.chain().focus().unsetLink().run();
                  setShowLinkModal(false);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="w-[95vw] max-w-6xl min-w-[500px] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="shrink-0 px-6 py-4 border-b border-gray-200">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="size-5" />
              Email Preview
            </DialogTitle>
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center gap-2 transition-all rounded-none border-0 border-b-2 ${
                  previewDevice === 'mobile'
                    ? 'border-primary-500 text-primary-600 bg-primary-50/50'
                    : 'border-transparent hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Smartphone className="size-4" />
                Mobile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewDevice('tablet')}
                className={`flex items-center gap-2 transition-all rounded-none border-0 border-b-2 ${
                  previewDevice === 'tablet'
                    ? 'border-primary-500 text-primary-600 bg-primary-50/50'
                    : 'border-transparent hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Tablet className="size-4" />
                Tablet
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewDevice('laptop')}
                className={`flex items-center gap-2 transition-all rounded-none border-0 border-b-2 ${
                  previewDevice === 'laptop'
                    ? 'border-primary-500 text-primary-600 bg-primary-50/50'
                    : 'border-transparent hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Monitor className="size-4" />
                Laptop
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 preview-modal-content scrollbar-hide">
            <div className="flex justify-center">
              <div
                className="border border-gray-300 bg-white rounded-lg overflow-hidden preview-device-frame"
                style={{
                  width: `${previewWidth}px`,
                  maxWidth: '100%'
                }}
              >
                <div className="border-b bg-gray-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {DEVICE_PRESETS[previewDevice].label} Preview
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {previewWidth}px
                    </div>
                  </div>
                </div>
                <div className="p-6 min-h-[200px]">
                  {value ? (
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: value }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                      No content to preview
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EmailRichTextEditor;
