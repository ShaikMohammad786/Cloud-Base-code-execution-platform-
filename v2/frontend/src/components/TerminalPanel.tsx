import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Socket } from 'socket.io-client';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

function ab2str(buf: any): string {
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)));
}

const OPTIONS_TERM = {
    useStyle: true,
    screenKeys: true,
    cursorBlink: true,
    cols: 200,
    theme: {
        background: '#161b22',
        foreground: '#c9d1d9',
    }
};

const PanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const TabBar = styled.div`
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  min-height: 36px;
  overflow-x: auto;
  &::-webkit-scrollbar { height: 0; }
`;

const Tab = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: ${p => p.active ? 'var(--bg-primary)' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${p => p.active ? 'var(--accent-color)' : 'transparent'};
  color: ${p => p.active ? 'var(--text-primary)' : 'var(--text-secondary)'};
  font-family: var(--font-mono);
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  &:hover { color: var(--text-primary); }
`;

const CloseTab = styled.span`
  font-size: 0.7rem;
  opacity: 0.5;
  margin-left: 4px;
  &:hover { opacity: 1; color: var(--error-color); }
`;

const AddTab = styled.button`
  padding: 6px 12px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1rem;
  cursor: pointer;
  &:hover { color: var(--accent-color); }
`;

const TermContainer = styled.div`
  flex: 1;
  overflow: hidden;
`;

export const TerminalPanel = ({ socket }: { socket: Socket }) => {
  const [tabs, setTabs] = useState<{ id: string; label: string }[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const termInstances = useRef<Map<string, { terminal: Terminal; fitAddon: FitAddon }>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Create first terminal on mount
  useEffect(() => {
    if (!socket || initialized.current) return;
    initialized.current = true;

    socket.emit('createTerminal', {}, (response: { terminalId: string }) => {
      const termId = response.terminalId;
      addTermTab(termId, 'Terminal 1');
    });

    // Listen for terminal output
    socket.on('terminal', ({ data, terminalId }: { data: ArrayBuffer | string; terminalId?: string }) => {
      if (!terminalId) return;
      const instance = termInstances.current.get(terminalId);
      if (instance) {
        if (data instanceof ArrayBuffer) {
          instance.terminal.write(ab2str(data));
        } else {
          instance.terminal.write(data);
        }
      }
    });

    // Backward compat: also listen for terminalCreated
    socket.on('terminalCreated', ({ terminalId }: { terminalId: string }) => {
      if (tabs.length === 0) {
        addTermTab(terminalId, 'Terminal 1');
      }
    });

    return () => {
      socket.off('terminal');
      socket.off('terminalCreated');
    };
  }, [socket]);

  // Mount terminal DOM when active tab changes
  useEffect(() => {
    if (!activeTab || !containerRef.current) return;
    
    // Clear container
    containerRef.current.innerHTML = '';
    
    const instance = termInstances.current.get(activeTab);
    if (instance) {
      instance.terminal.open(containerRef.current);
      instance.fitAddon.fit();
    }
  }, [activeTab]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (activeTab) {
        const instance = termInstances.current.get(activeTab);
        if (instance) instance.fitAddon.fit();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  const addTermTab = (termId: string, label: string) => {
    const term = new Terminal(OPTIONS_TERM);
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.onData((data) => {
      socket.emit('terminalData', { terminalId: termId, data });
    });

    termInstances.current.set(termId, { terminal: term, fitAddon });
    setTabs(prev => [...prev, { id: termId, label }]);
    setActiveTab(termId);
  };

  const handleAddTerminal = () => {
    socket.emit('createTerminal', {}, (response: { terminalId: string }) => {
      addTermTab(response.terminalId, `Terminal ${tabs.length + 1}`);
    });
  };

  const handleCloseTerminal = (termId: string) => {
    if (tabs.length <= 1) return;
    socket.emit('closeTerminal', { terminalId: termId });
    const instance = termInstances.current.get(termId);
    if (instance) {
      instance.terminal.dispose();
      termInstances.current.delete(termId);
    }
    setTabs(prev => {
      const next = prev.filter(t => t.id !== termId);
      if (activeTab === termId && next.length > 0) {
        setActiveTab(next[next.length - 1].id);
      }
      return next;
    });
  };

  return (
    <PanelWrapper>
      <TabBar>
        {tabs.map(tab => (
          <Tab key={tab.id} active={tab.id === activeTab} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
            {tabs.length > 1 && (
              <CloseTab onClick={e => { e.stopPropagation(); handleCloseTerminal(tab.id); }}>✕</CloseTab>
            )}
          </Tab>
        ))}
        <AddTab onClick={handleAddTerminal} title="New Terminal">＋</AddTab>
      </TabBar>
      <TermContainer ref={containerRef} />
    </PanelWrapper>
  );
};
