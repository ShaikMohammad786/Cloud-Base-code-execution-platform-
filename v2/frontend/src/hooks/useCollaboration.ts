import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import type { editor } from 'monaco-editor';

const COLORS = ['#f85149', '#58a6ff', '#3fb950', '#d29922', '#a371f7', '#f778ba', '#79c0ff', '#56d364'];

interface CollabUser {
  name: string;
  color: string;
}

export function useCollaboration(
  replId: string | undefined,
  filePath: string | undefined,
  editorInstance: editor.IStandaloneCodeEditor | null,
  userName: string = 'Anonymous'
) {
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<CollabUser[]>([]);
  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  useEffect(() => {
    if (!replId || !filePath || !editorInstance) return;

    const doc = new Y.Doc();
    const roomName = `${replId}:${filePath}`;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    const provider = new WebsocketProvider('ws://localhost:4444', roomName, doc);

    provider.on('status', ({ status }: { status: string }) => {
      setConnected(status === 'connected');
    });

    // Set awareness (user info)
    provider.awareness.setLocalStateField('user', {
      name: userName,
      color,
    });

    // Track connected users
    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values());
      const collabUsers: CollabUser[] = states
        .filter((state: any) => state.user)
        .map((state: any) => state.user);
      setUsers(collabUsers);
    };

    provider.awareness.on('change', updateUsers);
    updateUsers();

    // Bind to Monaco
    const yText = doc.getText('monaco');
    const model = editorInstance.getModel();
    if (model) {
      const binding = new MonacoBinding(
        yText,
        model,
        new Set([editorInstance]),
        provider.awareness
      );
      bindingRef.current = binding;
    }

    docRef.current = doc;
    providerRef.current = provider;

    return () => {
      bindingRef.current = null;
      provider.awareness.off('change', updateUsers);
      provider.disconnect();
      doc.destroy();
      docRef.current = null;
      providerRef.current = null;
    };
  }, [replId, filePath, editorInstance, userName]);

  return { connected, users };
}
