import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Italic,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Minus,
} from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TiptapEditorProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    className?: string;
}

const ToolbarButton = ({
    editor,
    action,
    isActive,
    icon: Icon,
    title,
}: {
    editor: Editor;
    action: () => void;
    isActive: boolean;
    icon: React.ElementType;
    title: string;
}) => (
    <button
        type="button"
        onClick={action}
        title={title}
        className={cn(
            'rounded p-1.5 transition-colors',
            isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )}
    >
        <Icon className="h-4 w-4" />
    </button>
);

export default function TiptapEditor({
    value,
    onChange,
    error,
    placeholder = 'Write something...',
    className,
}: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none min-h-[200px] outline-none',
                placeholder,
            },
        },
    });

    useEffect(() => {
        if (editor && editor.getHTML() !== value) {
            editor.commands.setContent(value, { emitUpdate: false });
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className={cn('rounded-md border', error && 'border-destructive', className)}>
            <div className="flex flex-wrap items-center gap-1 border-b bg-muted/50 p-2">
                <ToolbarButton
                    editor={editor}
                    action={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    icon={Bold}
                    title="Bold"
                />
                <ToolbarButton
                    editor={editor}
                    action={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    icon={Italic}
                    title="Italic"
                />
                <ToolbarButton
                    editor={editor}
                    action={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    icon={Strikethrough}
                    title="Strikethrough"
                />
                <div className="mx-1 h-4 w-px bg-border" />
                <ToolbarButton
                    editor={editor}
                    action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    icon={Heading1}
                    title="Heading 1"
                />
                <ToolbarButton
                    editor={editor}
                    action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    icon={Heading2}
                    title="Heading 2"
                />
                <ToolbarButton
                    editor={editor}
                    action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    icon={Heading3}
                    title="Heading 3"
                />
                <div className="mx-1 h-4 w-px bg-border" />
                <ToolbarButton
                    editor={editor}
                    action={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    icon={List}
                    title="Bullet List"
                />
                <ToolbarButton
                    editor={editor}
                    action={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    icon={ListOrdered}
                    title="Ordered List"
                />
                <ToolbarButton
                    editor={editor}
                    action={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    icon={Quote}
                    title="Blockquote"
                />
                <ToolbarButton
                    editor={editor}
                    action={() => editor.chain().focus().setHorizontalRule().run()}
                    isActive={false}
                    icon={Minus}
                    title="Horizontal Rule"
                />
                <div className="mx-1 h-4 w-px bg-border" />
                <ToolbarButton
                    editor={editor}
                    action={() => editor.chain().focus().undo().run()}
                    isActive={false}
                    icon={Undo}
                    title="Undo"
                />
                <ToolbarButton
                    editor={editor}
                    action={() => editor.chain().focus().redo().run()}
                    isActive={false}
                    icon={Redo}
                    title="Redo"
                />
            </div>
            <div className="p-3">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
