import { useEffect, useState, useMemo } from 'react';
import { Socket, io } from 'socket.io-client';
import { File, RemoteFile, Type, buildFileTree } from './external/editor/utils/file-manager';
import { useSearchParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { Output } from './Output';
import { TerminalComponent as Terminal } from './Terminal';
import axios from 'axios';
import { VscPlay, VscDebugRestart, VscCloud } from 'react-icons/vsc';
import { FileTree } from "./external/editor/components/file-tree";
import { Code } from "./external/editor/editor/code";
import Sidebar from "./external/editor/components/sidebar";

function useSocket(replId: string) {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socketUrl = `http://${replId}.cloudcode.work.gd`;
        const newSocket = io(socketUrl);
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [replId]);

    return socket;
}

/** Styled Components */
const Layout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
`;

const Navbar = styled.nav`
  height: 50px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-family: var(--font-sans);
`;

const ReplName = styled.span`
  background: var(--bg-tertiary);
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  border: 1px solid var(--border-color);
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  background: var(--accent-color);
  color: white;
  border: none;
  cursor: pointer;
  
  &:hover {
    background: var(--accent-hover);
  }
`;

const Workspace = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const SidebarContainer = styled.div`
  width: 250px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    display: none; /* Collapsible handled by default usually, but hiding for now on small screens */
  }
`;

const MainPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-primary);
`;

const RightPanel = styled.div`
  width: 40%;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--border-color);
  background-color: var(--bg-secondary);

  @media (max-width: 768px) {
    width: 100%;
    height: 40%;
    border-left: none;
    border-top: 1px solid var(--border-color);
  }
`;

const Tabs = styled.div`
  display: flex;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
`;

const Tab = styled.div<{ active: boolean }>`
  padding: 8px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  background: ${props => props.active ? 'var(--bg-primary)' : 'transparent'};
  border-right: 1px solid var(--border-color);
  border-top: 2px solid ${props => props.active ? 'var(--accent-color)' : 'transparent'};
  color: ${props => props.active ? 'var(--text-primary)' : 'var(--text-secondary)'};
`;

const CenterLoader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-family: var(--font-mono);
`;

export const CodingPage = () => {
    const [podCreated, setPodCreated] = useState(false);
    const [searchParams] = useSearchParams();
    const replId = searchParams.get('replId') ?? '';

    useEffect(() => {
        if (replId) {
            axios.post(`http://localhost:3002/start`, { replId })
                .then(() => setPodCreated(true))
                .catch((err) => console.error(err));
        }
    }, [replId]);

    if (!podCreated) {
        return <CenterLoader>Initializing Environment...</CenterLoader>
    }
    return <CodingPagePostPodCreation />
}

export const CodingPagePostPodCreation = () => {
    const [searchParams] = useSearchParams();
    const replId = searchParams.get('replId') ?? '';
    const [loaded, setLoaded] = useState(false);
    const socket = useSocket(replId);
    const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<'terminal' | 'output'>('terminal');
    const [outputKey, setOutputKey] = useState(0);

    useEffect(() => {
        if (socket) {
            socket.on('loaded', ({ rootContent }: { rootContent: RemoteFile[] }) => {
                setLoaded(true);
                setFileStructure(rootContent);
            });
        }
    }, [socket]);

    const onSelect = (file: File) => {
        if (file.type === Type.DIRECTORY) {
            socket?.emit("fetchDir", file.path, (data: RemoteFile[]) => {
                setFileStructure(prev => {
                    const allFiles = [...prev, ...data];
                    return allFiles.filter((file, index, self) =>
                        index === self.findIndex(f => f.path === file.path)
                    );
                });
            });
        } else {
            socket?.emit("fetchContent", { path: file.path }, (data: string) => {
                file.content = data;
                setSelectedFile(file);
            });
        }
    };

    const rootDir = useMemo(() => {
        return buildFileTree(fileStructure);
    }, [fileStructure]);

    useEffect(() => {
        if (!selectedFile && rootDir.files && rootDir.files.length > 0) {
            onSelect(rootDir.files[0])
        }
    }, [selectedFile, rootDir]);

    const handleRun = () => {
        const hasPython = fileStructure.some(f => f.path.includes('main.py') || f.path.endsWith('.py'));
        const command = hasPython ? 'python3 main.py\r' : 'node index.js\r';
        socket?.emit('terminalData', { data: command });
    };

    const handleReload = () => {
        setOutputKey(prev => prev + 1);
    };

    if (!loaded) {
        return <CenterLoader>Connecting to DevContainer...</CenterLoader>;
    }

    return (
        <Layout>
            <Navbar>
                <Brand>
                    <VscCloud size={20} color="var(--accent-color)" />
                    CloudCode ID
                </Brand>
                <ReplName>{replId}</ReplName>
                <Actions>
                    <ActionButton onClick={handleRun}>
                        <VscPlay /> Run
                    </ActionButton>
                    <ActionButton
                        onClick={handleReload}
                        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                    >
                        <VscDebugRestart /> Reload
                    </ActionButton>
                </Actions>
            </Navbar>

            <Workspace>
                <SidebarContainer>
                    <Sidebar>
                        <FileTree
                            rootDir={rootDir}
                            selectedFile={selectedFile}
                            onSelect={onSelect}
                        />
                    </Sidebar>
                </SidebarContainer>

                <MainPanel>
                    <EditorContainer>
                        <Code socket={socket!} selectedFile={selectedFile} />
                    </EditorContainer>

                    <RightPanel>
                        <Tabs>
                            <Tab
                                active={activeTab === 'terminal'}
                                onClick={() => setActiveTab('terminal')}
                            >
                                Terminal
                            </Tab>
                            <Tab
                                active={activeTab === 'output'}
                                onClick={() => setActiveTab('output')}
                            >
                                Output (Port 3000)
                            </Tab>
                        </Tabs>
                        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                            <div style={{
                                display: activeTab === 'terminal' ? 'block' : 'none',
                                height: '100%'
                            }}>
                                <Terminal socket={socket!} />
                            </div>
                            <div style={{
                                display: activeTab === 'output' ? 'block' : 'none',
                                height: '100%'
                            }}>
                                <Output key={outputKey} />
                            </div>
                        </div>
                    </RightPanel>
                </MainPanel>
            </Workspace>
        </Layout>
    );
}
