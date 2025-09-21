import React, { useState } from 'react';
import { Image, Video, Link as LinkIcon, Smile, Bold, Italic, List } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "写下您的内容...",
  rows = 6,
  className = ""
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉', '😭', '😱', '🏀', '⚽', '🏈', '🎾'];

  const insertText = (text: string) => {
    onChange(value + text);
  };

  const insertEmoji = (emoji: string) => {
    insertText(emoji);
    setShowEmojiPicker(false);
  };

  const wrapSelection = (prefix: string, suffix: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
      onChange(newText);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 pb-12 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white placeholder-gray-400 resize-none"
      />
      
      {/* Toolbar */}
      <div className="absolute bottom-3 left-3 flex items-center space-x-1">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => wrapSelection('**', '**')}
          className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-white/10 rounded-md transition-colors"
          title="加粗"
        >
          <Bold className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => wrapSelection('*', '*')}
          className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-white/10 rounded-md transition-colors"
          title="斜体"
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => insertText('\n- ')}
          className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-white/10 rounded-md transition-colors"
          title="列表"
        >
          <List className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-white/20 mx-1"></div>

        {/* Media Insertion */}
        <button
          type="button"
          onClick={() => insertText('[图片](图片链接)')}
          className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-white/10 rounded-md transition-colors"
          title="插入图片"
        >
          <Image className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => insertText('[视频](视频链接)')}
          className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-white/10 rounded-md transition-colors"
          title="插入视频"
        >
          <Video className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => insertText('[链接文字](链接地址)')}
          className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-white/10 rounded-md transition-colors"
          title="插入链接"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        
        {/* Emoji Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-white/10 rounded-md transition-colors"
            title="插入表情"
          >
            <Smile className="w-4 h-4" />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-3 grid grid-cols-8 gap-1 shadow-lg z-10">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-md transition-colors text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;