
import { useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    loadPyodide: any;
  }
}

export const usePyodide = () => {
  const [pyodide, setPyodide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const loadPyodideInstance = async () => {
      try {
        // Load Pyodide from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        script.onload = async () => {
          const pyodideInstance = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
          });
          setPyodide(pyodideInstance);
          setIsLoading(false);
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load Pyodide:', error);
        setIsLoading(false);
      }
    };

    loadPyodideInstance();
  }, []);

  const runPython = useCallback(async (code: string) => {
    if (!pyodide || isRunning) return { output: '', executionTime: 0, success: false };

    setIsRunning(true);
    const startTime = performance.now();

    try {
      // Capture stdout
      pyodide.runPython(`
        import sys
        from io import StringIO
        
        class OutputCapture:
            def __init__(self):
                self.contents = []
                
            def write(self, data):
                self.contents.append(data)
                
            def flush(self):
                pass
                
            def getvalue(self):
                return ''.join(self.contents)
        
        _output_capture = OutputCapture()
        sys.stdout = _output_capture
        sys.stderr = _output_capture
      `);

      // Run the user's code
      const result = pyodide.runPython(code);
      
      // Get the captured output
      const output = pyodide.runPython('_output_capture.getvalue()');
      
      // If there's a result and no output, show the result
      let finalOutput = output;
      if (!output && result !== undefined && result !== null) {
        finalOutput = String(result);
      }

      const executionTime = performance.now() - startTime;
      
      setIsRunning(false);
      return { 
        output: finalOutput || 'Code executed successfully (no output)', 
        executionTime: Math.round(executionTime), 
        success: true 
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      setIsRunning(false);
      return { 
        output: `Error: ${error}`, 
        executionTime: Math.round(executionTime), 
        success: false 
      };
    }
  }, [pyodide, isRunning]);

  return { runPython, isLoading, isRunning };
};
