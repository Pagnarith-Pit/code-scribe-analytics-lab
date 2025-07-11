import { useEffect, useRef, useState } from 'react';
import { EditorView, keymap, highlightActiveLine, lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { foldGutter, indentOnInput, bracketMatching, foldKeymap } from '@codemirror/language';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

interface PythonEditorProps {
  initialCode: string;
  onChange: (code: string, changeType: 'typing' | 'paste' | 'delete') => void;
  onRun: (code: string) => void;
}

export const PythonEditor = ({ initialCode, onChange, onRun }: PythonEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>();
  const [currentCode, setCurrentCode] = useState(initialCode);
  const onRunRef = useRef(onRun);
  const onChangeRef = useRef(onChange);

  // Keep refs updated
  useEffect(() => {
    onRunRef.current = onRun;
    onChangeRef.current = onChange;
  }, [onRun, onChange]);

  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      const runCodeKeymap = keymap.of([
        {
          key: 'Ctrl-Enter',
          run: () => {
            onRunRef.current(currentCode);
            return true;
          }
        },
        {
          key: 'Cmd-Enter',
          run: () => {
            onRunRef.current(currentCode);
            return true;
          }
        }
      ]);

      const startState = EditorState.create({
        doc: initialCode,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          foldGutter(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          autocompletion(),
          highlightSelectionMatches(),
          history(),
          keymap.of([
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...foldKeymap,
            ...completionKeymap,
          ]),
          runCodeKeymap,
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
              
              onChangeRef.current(newCode, changeType);
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
  }, []); // Empty dependency array to prevent recreation

  const handleRunCode = () => {
    onRun(currentCode);
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
      />
    </div>
  );
};
