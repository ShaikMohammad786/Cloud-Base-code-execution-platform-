import Editor, { OnMount } from "@monaco-editor/react";
import { File } from "../utils/file-manager";
import { Socket } from "socket.io-client";
import { useRef, useCallback } from "react";
import type { editor } from "monaco-editor";

export const Code = ({ selectedFile, socket, replId, userName, onEditorReady, collabActive }: { 
  selectedFile: File | undefined, 
  socket: Socket,
  replId?: string,
  userName?: string,
  onEditorReady?: (editor: editor.IStandaloneCodeEditor) => void,
  collabActive?: boolean,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const savedRef = useRef(false);

  const debounce = useCallback((func: (value: string) => void, wait: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (value: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(value);
      }, wait);
    };
  }, []);

  const handleEditorDidMount: OnMount = useCallback((ed, monaco) => {
    editorRef.current = ed;
    savedRef.current = false;
    onEditorReady?.(ed);

    // Ctrl+S → save immediately
    ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const value = ed.getValue();
      if (selectedFile) {
        socket.emit("updateContent", { path: selectedFile.path, content: value });
      }
    });
  }, [onEditorReady, socket, selectedFile]);

  if (!selectedFile) return null;

  const code = selectedFile.content;
  let language = selectedFile.name.split('.').pop();

  if (language === "js" || language === "jsx")
    language = "javascript";
  else if (language === "ts" || language === "tsx")
    language = "typescript";
  else if (language === "py")
    language = "python";

  // When collab is active, use defaultValue so Yjs can control the content
  // When not active, use value for normal controlled editing
  const editorProps = collabActive
    ? { defaultValue: code }
    : { value: code };

  return (
    <Editor
      height="100%"
      language={language}
      {...editorProps}
      theme="vs-dark"
      onMount={handleEditorDidMount}
      onChange={debounce((value) => {
        socket.emit("updateContent", { path: selectedFile.path, content: value });
      }, 500)}
    />
  );
}
