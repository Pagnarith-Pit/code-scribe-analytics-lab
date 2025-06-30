
import { useEffect, useRef, useState } from 'react';
import { EditorView, basicSetup } from '@codemirror/basic-setup';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';

interface PythonEditorProps {
  initialCode: string;
  onChange: (code: string, changeType: 'typing' | 'paste' | 'delete') => void;
  onRun: (code: string) => void;
}

export const PythonEditor = ({ initialCode, onChange, onRun }: PythonEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>();
  const [currentCode, setCurrentCode] = useState(initialCode);

  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      const startState = EditorState.create({
        doc: initialCode,
        extensions: [
          basicSetup,
          python(),
          oneDark,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newCode = update.state.doc.toString();
              setCurrentCode(newCode);
              
              // Determine change type based on the transaction
              let changeType: 'typing' | 'paste' | 'delete' = 'typing';
              if (update.transactions.some(tr => tr.isUserEvent('input.paste'))) {
                changeType = 'paste';
              } else if (update.transactions.some(tr => tr.isUserEvent('delete'))) {
                changeType = 'delete';
              }
              
              onChange(newCode, changeType);
            }
          }),
          EditorView.theme({
            '&': {
              height: '100%',
              fontSize: '14px'
            },
            '.cm-content': {
              padding: '16px',
              minHeight: '300px'
            },
            '.cm-focused': {
              outline: 'none'
            }
          })
        ]
      });

      viewRef.current = new EditorView({
        state: startState,
        parent: editorRef.current
      });
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = undefined;
      }
    };
  }, [initialCode]);

  const handleRunCode = () => {
    onRun(currentCode);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-2 text-gray-300 text-sm">main.py</span>
        </div>
        <button
          onClick={handleRunCode}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
        >
          Run (Ctrl+Enter)
        </button>
      </div>
      <div 
        ref={editorRef} 
        className="flex-1 overflow-hidden"
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};
