/* eslint-disable */
import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { createPortal } from 'react-dom';
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
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Typography from '@tiptap/extension-typography';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import './tiptap.css';
import * as fabricNS from 'fabric';
const fabric = (fabricNS as any).fabric ?? fabricNS;
import katex from 'katex';
import 'katex/dist/katex.css';

import { UploadFileInS3, getPublicUrl } from '@/services/upload_file';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';

type TipTapEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  minHeight?: number | string;
  className?: string;
  // Optional: allows parent components to request insertion of raw text/HTML at the current cursor
  insertTextRequest?: { text: string; nonce: number };
};

export function TipTapEditor({
  value,
  onChange,
  onBlur,
  placeholder = '',
  minHeight = 160,
  className = '',
  insertTextRequest,
}: TipTapEditorProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const mediaButtonRef = useRef<HTMLButtonElement | null>(null);
  const mediaMenuRef = useRef<HTMLDivElement | null>(null);
  const [mediaMenuPos, setMediaMenuPos] = useState<{ top: number; left: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showMediaMenu) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as unknown as HTMLElement | null;
      if (mediaMenuRef.current && target && !mediaMenuRef.current.contains(target)) {
        setShowMediaMenu(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [showMediaMenu]);

  // Adjust menu position to keep it within viewport (flip up / clamp horizontally)
  useEffect(() => {
    if (!showMediaMenu || !mediaMenuPos) return;
    const menuEl = mediaMenuRef.current;
    if (!menuEl) return;
    // Allow layout to render first
    const id = requestAnimationFrame(() => {
      const rect = menuEl.getBoundingClientRect();
      let top = mediaMenuPos.top;
      let left = mediaMenuPos.left;
      const viewportBottom = window.scrollY + window.innerHeight;
      const viewportRight = window.scrollX + window.innerWidth;
      // Flip up if overflowing bottom
      if (top + rect.height > viewportBottom - 8) {
        const buttonRect = mediaButtonRef.current?.getBoundingClientRect();
        if (buttonRect) {
          top = buttonRect.top + window.scrollY - rect.height - 6;
        } else {
          top = Math.max(window.scrollY + 8, viewportBottom - rect.height - 8);
        }
      }
      // Clamp horizontally if overflowing right
      if (left + rect.width > viewportRight - 8) {
        left = Math.max(window.scrollX + 8, viewportRight - rect.width - 8);
      }
      // Apply only if changed
      if (top !== mediaMenuPos.top || left !== mediaMenuPos.left) {
        setMediaMenuPos({ top, left });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [showMediaMenu, mediaMenuPos]);
  const [forceRerenderKey, setForceRerenderKey] = useState(0);
  const [showMathModal, setShowMathModal] = useState(false);
  const [mathLatex, setMathLatex] = useState('');
  const [mathMode, setMathMode] = useState<'inline' | 'block'>('inline');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const getAuthContext = useCallback(() => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const data = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = data && data.authorities ? Object.keys(data.authorities)[0] : undefined;
    const USER_ID = (data && ((data as unknown as { userId?: string; sub?: string }).userId || data?.sub)) || 'your-user-id';
    return { INSTITUTE_ID, USER_ID };
  }, []);

  const uploadFileToS3GetUrl = useCallback(async (file: File): Promise<string | null> => {
    try {
      const { INSTITUTE_ID, USER_ID } = getAuthContext();
      const fileId = await UploadFileInS3(file, () => {}, USER_ID, INSTITUTE_ID, 'STUDENTS', true);
      if (!fileId) return null;
      const publicUrl = await getPublicUrl(fileId);
      return publicUrl || null;
    } catch (e) {
      console.error('Upload failed:', e);
      return null;
    }
  }, [getAuthContext]);

  // Custom nodes for better media/attachment rendering
  const AudioNode = useRef(
    Node.create({
      name: 'audio',
      group: 'block',
      atom: true,
      selectable: true,
      draggable: false,
      addAttributes() {
        return {
          src: { default: null },
          controls: { default: true },
          style: { default: 'width:100%' },
        };
      },
      parseHTML() {
        return [{ tag: 'audio' }];
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderHTML({ HTMLAttributes }: { HTMLAttributes: any }) {
        return ['audio', mergeAttributes({ controls: true }, HTMLAttributes)];
      },
    })
  );

  const VideoNode = useRef(
    Node.create({
      name: 'video',
      group: 'block',
      atom: true,
      selectable: true,
      draggable: false,
      addAttributes() {
        return {
          src: { default: null },
          controls: { default: true },
          style: { default: 'max-width:100%;height:auto' },
        };
      },
      parseHTML() {
        return [{ tag: 'video' }];
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderHTML({ HTMLAttributes }: { HTMLAttributes: any }) {
        return ['video', mergeAttributes({ controls: true }, HTMLAttributes)];
      },
    })
  );

  const AttachmentNode = useRef(
    Node.create({
      name: 'attachment',
      group: 'block',
      atom: true,
      selectable: true,
      draggable: false,
      addAttributes() {
        return {
          href: { default: null },
          name: { default: null },
          type: { default: null },
        };
      },
      parseHTML() {
        return [
          { tag: 'a[data-attachment]' },
          { tag: 'div[data-attachment]' },
        ];
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderHTML({ HTMLAttributes }: { HTMLAttributes: any }) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { href, name } = HTMLAttributes as any;
        const style =
          'display:flex;align-items:center;gap:8px;background:#f9fafb;padding:8px 10px;border-radius:8px;border:1px solid #e5e7eb;text-decoration:none;color:#111827;';
        return [
          'a',
          mergeAttributes(
            {
              'data-attachment': 'true',
              href,
              target: '_blank',
              rel: 'noopener noreferrer',
              style,
            },
            HTMLAttributes
          ),
          ['span', { style: 'font-size:14px' }, name || href || 'file'],
        ];
      },
    })
  );

  const editor = useEditor({
    extensions: [
      // Math inline/block nodes to support import/export of HTML with math
      (Node.create({
        name: 'math_inline',
        inline: true,
        group: 'inline',
        atom: true,
        selectable: false,
        draggable: false,
        addAttributes() {
          return { latex: { default: '' } };
        },
        parseHTML() {
          return [{
            tag: 'span.math-inline',
            getAttrs: (element: HTMLElement) => ({ latex: element.getAttribute('data-latex') || '' }),
          }];
        },
        renderHTML({ HTMLAttributes }) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const latex = (HTMLAttributes as any)?.latex || (HTMLAttributes as any)['data-latex'] || '';
          let html = '';
          try {
            html = katex.renderToString(latex, { throwOnError: false, displayMode: false });
          } catch {}
          return [
            'span',
            mergeAttributes(
              { class: 'math-inline', 'data-latex': latex },
              HTMLAttributes
            ),
            html,
          ];
        },
      })) as unknown as Node,
      (Node.create({
        name: 'math_block',
        group: 'block',
        atom: true,
        selectable: false,
        draggable: false,
        addAttributes() {
          return { latex: { default: '' } };
        },
        parseHTML() {
          return [{
            tag: 'div.math-block',
            getAttrs: (element: HTMLElement) => ({ latex: element.getAttribute('data-latex') || '' }),
          }];
        },
        renderHTML({ HTMLAttributes }) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const latex = (HTMLAttributes as any)?.latex || (HTMLAttributes as any)['data-latex'] || '';
          let html = '';
          try {
            html = katex.renderToString(latex, { throwOnError: false, displayMode: true });
          } catch {}
          return [
            'div',
            mergeAttributes(
              { class: 'math-block', 'data-latex': latex },
              HTMLAttributes
            ),
            html,
          ];
        },
      })) as unknown as Node,
      // Drawing node (fabric.js-powered)
      (Node.create({
        name: 'drawing',
        group: 'block',
        atom: true,
        selectable: true,
        draggable: false,
        addAttributes() {
          return {
            imageSrc: { default: null },
            json: { default: null },
            width: { default: 600 },
            height: { default: 300 },
          };
        },
        parseHTML() {
          return [{
            tag: 'img[data-drawing]',
            getAttrs: (element: HTMLElement) => ({
              imageSrc: element.getAttribute('src'),
              json: element.getAttribute('data-json') || null,
              width: Number(element.getAttribute('width') || 600),
              height: Number(element.getAttribute('height') || 300),
            }),
          }];
        },
        renderHTML({ HTMLAttributes }) {
          const { imageSrc, json, width, height } = HTMLAttributes as any;
          if (imageSrc) {
            return [
              'img',
              mergeAttributes(
                {
                  src: imageSrc,
                  'data-drawing': 'true',
                  ...(json ? { 'data-json': typeof json === 'string' ? json : JSON.stringify(json) } : {}),
                  style: `max-width:100%;height:auto;border:1px solid #e5e7eb;border-radius:6px;`,
                  width,
                  height,
                },
                HTMLAttributes
              ),
            ];
          }
          // Placeholder when no image yet
          return [
            'div',
            mergeAttributes(
              {
                'data-drawing': 'true',
                style:
                  'border:1px dashed #cbd5e1;border-radius:6px;padding:8px;color:#64748b;font-size:14px;text-align:center;',
              },
              HTMLAttributes
            ),
            'Drawing',
          ];
        },
        addNodeView() {
          return ReactNodeViewRenderer((props) => {
            const { node, updateAttributes, editor } = props;
            const containerRef = useRef<HTMLDivElement | null>(null);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const canvasRef = useRef<any | null>(null);
            const [isEditing, setIsEditing] = useState(!node.attrs.imageSrc);

            const width = Number(node.attrs.width || 600);
            const height = Number(node.attrs.height || 300);

            useEffect(() => {
              if (!isEditing) return;
              if (!containerRef.current) return;
              const canvasEl = document.createElement('canvas');
              canvasEl.width = width;
              canvasEl.height = height;
              containerRef.current.innerHTML = '';
              containerRef.current.appendChild(canvasEl);

              const c = new (fabric as any).Canvas(canvasEl, {
                isDrawingMode: true,
                selection: true,
              });
              c.freeDrawingBrush = new (fabric as any).PencilBrush(c);
              c.freeDrawingBrush.width = 3;
              c.freeDrawingBrush.color = '#111827';
              canvasRef.current = c;

              // Load existing JSON if available
              const json = node.attrs.json;
              if (json) {
                try {
                  const parsed = typeof json === 'string' ? JSON.parse(json) : json;
                  c.loadFromJSON(parsed, () => c.renderAll());
                } catch {}
              }

              return () => {
                try { c.dispose(); } catch {}
                canvasRef.current = null;
              };
              // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [isEditing, width, height, forceRerenderKey]);

            const handleSave = async () => {
              if (!canvasRef.current) return;
              const c = canvasRef.current;
              const dataUrl = c.toDataURL({ format: 'png', multiplier: 1 });
              const blob = await (await fetch(dataUrl)).blob();
              const file = new File([blob], `drawing_${Date.now()}.png`, { type: 'image/png' });
              try {
                const url = await uploadFileToS3GetUrl(file);
                const json = c.toJSON();
                updateAttributes({ imageSrc: url, json: JSON.stringify(json) });
                setIsEditing(false);
              } catch (e) {
                console.error('Upload drawing failed:', e);
              }
            };

            const handleClear = () => {
              canvasRef.current?.clear();
              canvasRef.current?.renderAll();
            };

            const handleEdit = () => {
              setIsEditing(true);
              setForceRerenderKey((k) => k + 1);
            };

            return (
              <NodeViewWrapper className="tiptap-drawing-node">
                {isEditing ? (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded bg-neutral-100 px-2 py-1 text-sm hover:bg-neutral-200"
                        onClick={handleSave}
                      >Save</button>
                      <button
                        type="button"
                        className="rounded px-2 py-1 text-sm hover:bg-neutral-100"
                        onClick={() => setIsEditing(false)}
                      >Cancel</button>
                      <button
                        type="button"
                        className="rounded px-2 py-1 text-sm hover:bg-neutral-100"
                        onClick={handleClear}
                      >Clear</button>
                      <span className="ml-2 text-xs text-neutral-500">Draw freehand. Save will upload and embed image.</span>
                    </div>
                    <div ref={containerRef} style={{ width, height }} />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {node.attrs.imageSrc ? (
                      <img
                        src={node.attrs.imageSrc}
                        alt="Drawing"
                        style={{ maxWidth: '100%', height: 'auto', border: '1px solid #e5e7eb', borderRadius: 6 }}
                        width={width}
                        height={height}
                      />
                    ) : (
                      <div className="rounded border border-dashed p-2 text-sm text-neutral-500">No drawing</div>
                    )}
                    <div>
                      <button
                        type="button"
                        className="rounded px-2 py-1 text-sm hover:bg-neutral-100"
                        onClick={handleEdit}
                      >Edit Drawing</button>
                    </div>
                  </div>
                )}
              </NodeViewWrapper>
            );
          });
        },
      })) as unknown as Node,
      AttachmentNode.current,
      AudioNode.current,
      VideoNode.current,
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
        // use defaults for codeBlock/blockquote
      }),
      Underline,
      Highlight,
      TextStyle,
      Color,
      HorizontalRule,
      Typography,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
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
      handleKeyDown: (_view, event): boolean => {
        if (!editor) return false;
        // Enter behavior for lists: new item, or exit on empty item
        if ((event as KeyboardEvent).key === 'Enter' && !(event as KeyboardEvent).shiftKey) {
          if (editor.isActive('bulletList') || editor.isActive('orderedList')) {
            // Determine if current list item is empty
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sel: any = (editor as any).state.selection;
            const isEmpty = sel?.$from?.parent?.content?.size === 0;
            (event as KeyboardEvent).preventDefault();
            if (isEmpty) {
              return editor.chain().focus().liftListItem('listItem').run();
            }
            return editor.chain().focus().splitListItem('listItem').run();
          }
        }
        // Indent / Outdent list items with Tab / Shift+Tab
        if ((event as KeyboardEvent).key === 'Tab') {
          if (editor.isActive('bulletList') || editor.isActive('orderedList')) {
            (event as KeyboardEvent).preventDefault();
            if ((event as KeyboardEvent).shiftKey) {
              return editor.chain().focus().liftListItem('listItem').run();
            }
            return editor.chain().focus().sinkListItem('listItem').run();
          }
        }
        // Let StarterKit handle Enter behavior for lists
        return false;
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

  // Allow parent to insert content (text or HTML) at the current cursor position on demand
  useEffect(() => {
    if (!editor) return;
    if (!insertTextRequest || !insertTextRequest.text) return;
    try {
      editor.chain().focus().insertContent(insertTextRequest.text).run();
    } catch (e) {
      // no-op; safe failure if editor not ready
    }
    // Only react to nonce changes to avoid re-inserting same text unintentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, insertTextRequest?.nonce]);

  const insertLink = useCallback(() => {
    if (!editor) return;
    const currentAttrs = editor.getAttributes('link') as { href?: string };
    const sel = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to) || '';
    setLinkUrl(currentAttrs?.href || '');
    setLinkText(sel);
    setShowLinkModal(true);
  }, [editor]);

  const insertInlineMath = useCallback(() => {
    if (!editor) return;
    const input = window.prompt('Enter LaTeX (inline)');
    if (!input) return;
    try {
      const html = katex.renderToString(input, { throwOnError: false, displayMode: false });
      editor.commands.insertContent(`<span class="math-inline" data-latex="${
        input.replace(/"/g, '&quot;')
      }">${html}</span>`);
    } catch (e) {
      console.error('KaTeX render error:', e);
    }
  }, [editor]);

  const insertBlockMath = useCallback(() => {
    if (!editor) return;
    const input = window.prompt('Enter LaTeX (block)');
    if (!input) return;
    try {
      const html = katex.renderToString(input, { throwOnError: false, displayMode: true });
      editor.commands.insertContent(`<div class="math-block" data-latex="${
        input.replace(/"/g, '&quot;')
      }">${html}</div>`);
    } catch (e) {
      console.error('KaTeX render error:', e);
    }
  }, [editor]);

  const onAttachFile = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const url = await uploadFileToS3GetUrl(file);
      if (!url || !editor) return;
      if (file.type.startsWith('image/')) {
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      } else if (file.type.startsWith('audio/')) {
        editor.chain().focus().insertContent({ type: 'audio', attrs: { src: url } }).run();
      } else if (file.type.startsWith('video/')) {
        editor.chain().focus().insertContent({ type: 'video', attrs: { src: url } }).run();
      } else {
        const safeName = (file.name || 'file').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        editor.chain().focus().insertContent({ type: 'attachment', attrs: { href: url, name: safeName, type: file.type } }).run();
      }
    };
    input.click();
  }, [editor, uploadFileToS3GetUrl]);

  const onInsertImage = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const url = await uploadFileToS3GetUrl(file);
      if (url && editor) editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    };
    input.click();
  }, [editor, uploadFileToS3GetUrl]);

  const onRecordAudio = useCallback(async () => {
    try {
      if (!isRecording) {
        if (!navigator.mediaDevices?.getUserMedia) return;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = (window as any).MediaRecorder?.isTypeSupported?.('audio/webm') ? 'audio/webm' : '';
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        recordedChunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        recorder.onstop = async () => {
          try {
            const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
            const ext = blob.type.includes('webm') ? 'webm' : 'm4a';
            const file = new File([blob], `recording_${Date.now()}.${ext}`, { type: blob.type });
            const url = await uploadFileToS3GetUrl(file);
            if (url && editor) editor.commands.insertContent(`<audio controls src="${url}" style="width:100%"></audio>`);
          } finally {
            try { stream.getTracks().forEach((t) => t.stop()); } catch {}
            mediaRecorderRef.current = null; mediaStreamRef.current = null; setIsRecording(false);
          }
        };
        mediaRecorderRef.current = recorder; mediaStreamRef.current = stream; recorder.start(); setIsRecording(true);
      } else {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
      }
    } catch (e) {
      console.error('Audio record error:', e);
      try { mediaStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
      setIsRecording(false);
    }
  }, [editor, isRecording, uploadFileToS3GetUrl]);

  useEffect(() => () => {
    try { if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop(); } catch {}
    try { mediaStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
  }, []);

  const canUndo = !!editor?.can().undo();
  const canRedo = !!editor?.can().redo();
  const isInTable = !!editor?.isActive('table');

  return (
    <div
      ref={wrapperRef}
      className={`rounded-md border bg-white shadow-sm ${className || ''}`.trim()}
      style={{ width: '100%', maxHeight: 'inherit', minHeight: 'inherit' }}
    >
      <div className="flex flex-wrap items-center gap-1 overflow-x-auto border-b p-2 text-sm">
        <div className="flex items-center gap-1">
          <button type="button" title="Bold" onClick={() => editor?.chain().focus().toggleBold().run()} className={`rounded px-2 py-1 hover:bg-neutral-100 ${editor?.isActive('bold') ? 'bg-neutral-200' : ''}`}>B</button>
          <button type="button" title="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()} className={`rounded px-2 py-1 hover:bg-neutral-100 ${editor?.isActive('italic') ? 'bg-neutral-200' : ''}`}>I</button>
          <button type="button" title="Underline" onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`rounded px-2 py-1 hover:bg-neutral-100 ${editor?.isActive('underline') ? 'bg-neutral-200' : ''}`}>U</button>
          <button type="button" title="Highlight" onClick={() => editor?.chain().focus().toggleHighlight().run()} className={`rounded px-2 py-1 hover:bg-neutral-100 ${editor?.isActive('highlight') ? 'bg-neutral-200' : ''}`}>HL</button>
        </div>
        <div className="mx-1 h-6 w-px bg-neutral-200" />
        <div className="flex items-center gap-1">
          <button type="button" title="Bullet List" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`rounded px-2 py-1 hover:bg-neutral-100 ${editor?.isActive('bulletList') ? 'bg-neutral-200' : ''}`}>•</button>
          <button type="button" title="Ordered List" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`rounded px-2 py-1 hover:bg-neutral-100 ${editor?.isActive('orderedList') ? 'bg-neutral-200' : ''}`}>1.</button>
          <button type="button" title="Blockquote" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={`rounded px-2 py-1 hover:bg-neutral-100 ${editor?.isActive('blockquote') ? 'bg-neutral-200' : ''}`}>&ldquo; &rdquo;</button>
          <button type="button" title="Code Block" onClick={() => editor?.chain().focus().toggleCodeBlock().run()} className={`rounded px-2 py-1 hover:bg-neutral-100 ${editor?.isActive('codeBlock') ? 'bg-neutral-200' : ''}`}>{"</>"}</button>
          <button type="button" title="Horizontal Rule" onClick={() => editor?.chain().focus().setHorizontalRule().run()} className="rounded px-2 py-1 hover:bg-neutral-100">HR</button>
        </div>
        <div className="mx-1 h-6 w-px bg-neutral-200" />
        <div className="flex items-center gap-1">
          <button type="button" title="Align Left" onClick={() => editor?.chain().focus().setTextAlign('left').run()} className="rounded px-2 py-1 hover:bg-neutral-100">L</button>
          <button type="button" title="Align Center" onClick={() => editor?.chain().focus().setTextAlign('center').run()} className="rounded px-2 py-1 hover:bg-neutral-100">C</button>
          <button type="button" title="Align Right" onClick={() => editor?.chain().focus().setTextAlign('right').run()} className="rounded px-2 py-1 hover:bg-neutral-100">R</button>
        </div>
        <div className="mx-1 h-6 w-px bg-neutral-200" />
        <div className="flex items-center gap-1">
          <div className="ml-0">
            <button
              type="button"
              title="More tools"
              ref={mediaButtonRef}
              onClick={() => {
                const btn = mediaButtonRef.current;
                if (btn) {
                  const rect = btn.getBoundingClientRect();
                  setMediaMenuPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX });
                }
                setShowMediaMenu((p) => !p);
              }}
              className="rounded px-2 py-1 hover:bg-neutral-100"
            >+
            </button>
            {showMediaMenu && mediaMenuPos && createPortal(
              <div
                ref={mediaMenuRef}
                className="w-56 rounded border bg-white p-2 shadow"
                style={{ position: 'fixed', top: mediaMenuPos.top, left: mediaMenuPos.left, zIndex: 2147483647 }}
                onMouseDown={(e) => { e.stopPropagation(); }}
              >
                <div className="mb-1 text-xs font-medium text-neutral-600">Insert</div>
                <button type="button" className="w-full rounded px-3 py-2 text-left text-sm hover:bg-neutral-100" onClick={() => { setShowMediaMenu(false); insertLink(); }}>Link…</button>
                <button type="button" className="w-full rounded px-3 py-2 text-left text-sm hover:bg-neutral-100" onClick={() => { setShowMediaMenu(false); onInsertImage(); }}>Image</button>
                <button type="button" className="w-full rounded px-3 py-2 text-left text-sm hover:bg-neutral-100" onClick={() => { setShowMediaMenu(false); editor?.chain().focus().insertContent({ type: 'drawing', attrs: { width: 600, height: 300 } }).run(); }}>Drawing</button>
                <button type="button" className="w-full rounded px-3 py-2 text-left text-sm hover:bg-neutral-100" onClick={() => { setShowMediaMenu(false); onAttachFile(); }}>File</button>
                <button
                  type="button"
                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-neutral-100"
                  onClick={() => { setShowMediaMenu(false); onRecordAudio(); }}
                >{isRecording ? 'Stop recording' : 'Audio (Record)'}
                </button>
                <button type="button" className="w-full rounded px-3 py-2 text-left text-sm hover:bg-neutral-100" onClick={() => { setShowMediaMenu(false); setMathLatex(''); setMathMode('inline'); setShowMathModal(true); }}>Math…</button>
                <div className="mt-2 border-t pt-2">
                  <div className="mb-1 text-xs font-medium text-neutral-600">Table</div>
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <input type="number" min={1} defaultValue={3} id="menuRowsInput" className="w-16 rounded border px-2 py-1 text-sm" />
                    <input type="number" min={1} defaultValue={3} id="menuColsInput" className="w-16 rounded border px-2 py-1 text-sm" />
                    <button type="button" className="rounded bg-neutral-100 px-2 py-1 text-sm hover:bg-neutral-200" onClick={() => {
                      const rows = Number((document.getElementById('menuRowsInput') as HTMLInputElement)?.value || 3);
                      const cols = Number((document.getElementById('menuColsInput') as HTMLInputElement)?.value || 3);
                      editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
                      setShowMediaMenu(false);
                    }}>Add</button>
                  </div>
                </div>
              </div>,
              wrapperRef.current || document.body
            )}
          </div>
          {isRecording && (
            <div className="ml-2 flex items-center gap-2">
              <span className="text-xs text-red-600">● Recording…</span>
              <button
                type="button"
                title="Stop recording"
                onClick={onRecordAudio}
                className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
              >Stop
              </button>
            </div>
          )}
          <div className="ml-2 flex items-center gap-1">
            <span className="text-xs text-neutral-500">Color</span>
            <input type="color" onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()} className="h-6 w-6 cursor-pointer rounded border p-0" />
          </div>

        </div>
        <span className="ml-auto flex gap-1">
          <button type="button" disabled={!canUndo} onClick={() => editor?.chain().focus().undo().run()} className="rounded px-2 py-1 hover:bg-neutral-100 disabled:opacity-50">Undo</button>
          <button type="button" disabled={!canRedo} onClick={() => editor?.chain().focus().redo().run()} className="rounded px-2 py-1 hover:bg-neutral-100 disabled:opacity-50">Redo</button>
        </span>
      </div>
      <div className="p-2" style={{ maxHeight: 'inherit', minHeight: 'inherit', overflowY: 'auto' }}>
        <EditorContent
          editor={editor}
          onBlur={onBlur}
          className="tiptap-content"
          style={{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight, maxHeight: 'inherit' }}
        />
      </div>

      {showMathModal && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/30">
          <div className="w-full max-w-lg rounded-md border bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium">Insert Math</div>
              <div className="flex items-center gap-2 text-xs">
                <button className={`rounded px-2 py-1 ${mathMode === 'inline' ? 'bg-neutral-200' : 'hover:bg-neutral-100'}`} onClick={() => setMathMode('inline')}>Inline</button>
                <button className={`rounded px-2 py-1 ${mathMode === 'block' ? 'bg-neutral-200' : 'hover:bg-neutral-100'}`} onClick={() => setMathMode('block')}>Block</button>
              </div>
            </div>
            <div className="mb-3 grid max-h-48 grid-cols-8 gap-1 overflow-auto text-sm">
              {[
                // Greek letters
                { t: 'α', v: '\\alpha' },
                { t: 'β', v: '\\beta' },
                { t: 'γ', v: '\\gamma' },
                { t: 'Δ', v: '\\Delta' },
                { t: 'θ', v: '\\theta' },
                { t: 'λ', v: '\\lambda' },
                { t: 'μ', v: '\\mu' },
                { t: 'σ', v: '\\sigma' },
                { t: 'Σ', v: '\\Sigma' },
                { t: 'π', v: '\\pi' },

                // Exponents / indices
                { t: 'x^n', v: 'x^{ }' },
                { t: 'x_i', v: 'x_{ }' },
                { t: 'x̅', v: '\\overline{x}' },
                { t: 'x̂', v: '\\hat{x}' },
                { t: 'ẋ', v: '\\dot{x}' },
                { t: 'ẍ', v: '\\ddot{x}' },

                // Operators and relations
                { t: '≈', v: '\\approx' },
                { t: '≠', v: '\\neq' },
                { t: '≤', v: '\\leq' },
                { t: '≥', v: '\\geq' },
                { t: '±', v: '\\pm' },
                { t: '⋅', v: '\\cdot' },
                { t: '×', v: '\\times' },
                { t: '÷', v: '\\div' },

                // Calculus
                { t: '∑', v: '\\sum_{i=1}^{n}' },
                { t: '∫', v: '\\int' },
                { t: '∫ab', v: '\\int_{a}^{b}' },
                { t: 'lim', v: '\\lim_{x \\to 0}' },
                { t: 'd/dx', v: '\\frac{d}{dx}' },
                { t: '∂/∂x', v: '\\frac{\\partial}{\\partial x}' },
                { t: '∇', v: '\\nabla' },

                // Algebraic templates
                { t: '√', v: '\\sqrt{}' },
                { t: 'ⁿ√', v: '\\sqrt[n]{}' },
                { t: 'a/b', v: '\\frac{}{ }' },

                // Functions
                { t: 'sin', v: '\\sin' },
                { t: 'cos', v: '\\cos' },
                { t: 'tan', v: '\\tan' },
                { t: 'ln', v: '\\ln' },
                { t: 'log', v: '\\log' },

                // Sets
                { t: 'ℝ', v: '\\mathbb{R}' },
                { t: 'ℕ', v: '\\mathbb{N}' },
                { t: '∈', v: '\\in' },
                { t: '∉', v: '\\notin' },
                { t: '⊆', v: '\\subseteq' },
                { t: '∪', v: '\\cup' },
                { t: '∩', v: '\\cap' },

                // Arrows
                { t: '→', v: '\\to' },
                { t: '⇒', v: '\\Rightarrow' },
                { t: '↔', v: '\\leftrightarrow' },

                // Vectors/Matrices
                { t: '→x', v: '\\vec{x}' },
                { t: '[ ]', v: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}' },
              ].map((btn, i) => (
                <button
                  key={i}
                  type="button"
                  className="rounded border px-2 py-1 hover:bg-neutral-100"
                  onClick={() => setMathLatex((s) => `${s}${btn.v}`)}
                  title={btn.v}
                >{btn.t}</button>
              ))}
            </div>
            <div className="mb-2">
              <label className="mb-1 block text-xs text-neutral-600">LaTeX</label>
              <textarea
                className="h-20 w-full rounded border px-3 py-2 text-sm"
                placeholder="e.g. \\frac{a}{b} + \\sqrt{x}"
                value={mathLatex}
                onChange={(e) => setMathLatex(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-xs text-neutral-600">Preview</label>
              <div
                className="min-h-10 rounded border px-3 py-2 text-sm"
                dangerouslySetInnerHTML={{ __html: (() => { try { return katex.renderToString(mathLatex || '', { throwOnError: false, displayMode: mathMode === 'block' }); } catch { return ''; } })() }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button className="rounded px-3 py-1 text-sm hover:bg-neutral-100" onClick={() => setShowMathModal(false)}>Cancel</button>
              <button
                className="rounded bg-neutral-100 px-3 py-1 text-sm hover:bg-neutral-200"
                onClick={() => {
                  if (!editor || !mathLatex.trim()) { setShowMathModal(false); return; }
                  if (mathMode === 'inline') {
                    editor.chain().focus().insertContent({ type: 'math_inline', attrs: { latex: mathLatex } }).run();
                  } else {
                    editor.chain().focus().insertContent({ type: 'math_block', attrs: { latex: mathLatex } }).run();
                  }
                  setShowMathModal(false);
                }}
              >Insert</button>
            </div>
          </div>
        </div>
      )}

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
              >Cancel</button>
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
              >Apply</button>
              <button
                className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
                onClick={() => {
                  editor?.chain().focus().unsetLink().run();
                  setShowLinkModal(false);
                }}
              >Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TipTapEditor;



