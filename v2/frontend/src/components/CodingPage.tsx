import { useEffect, useState, useMemo, useCallback } from 'react';
import { Socket, io } from 'socket.io-client';
import { File, RemoteFile, Type, buildFileTree } from './external/editor/utils/file-manager';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { Output } from './Output';
import { TerminalPanel } from './TerminalPanel';
import { CollabPresence } from './CollabPresence';
import { useAuth } from '../context/AuthContext';
import { PromptModal, ConfirmModal } from './Modals';
import { useCollaboration } from '../hooks/useCollaboration';
import axios from 'axios';
import { VscPlay, VscDebugRestart, VscCloud, VscArrowLeft, VscRepoClone, VscNewFile, VscNewFolder, VscTrash, VscEdit, VscCloudDownload } from 'react-icons/vsc';
import { FileTree } from "./external/editor/components/file-tree";
import { Code } from "./external/editor/editor/code";
import Sidebar from "./external/editor/components/sidebar";
import type { editor } from 'monaco-editor';

function useSocket(replId: string) {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!replId) return;

        // Connect via ingress hostname (requires hosts file entry or minikube tunnel)
        // Fallback: use minikube service URL
        const socketUrl = `http://${replId}.cloudcode.local`;
        const newSocket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
            timeout: 10000,
        });

        newSocket.on('connect_error', (err) => {
            console.warn(`Socket connection failed to ${socketUrl}:`, err.message);
            console.warn('Make sure minikube tunnel is running and hosts file has: 127.0.0.1 *.cloudcode.local');
        });

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
    display: none;
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

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: var(--accent-color); color: #fff; }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-color);
`;

const SidebarActions = styled.div`
  display: flex;
  gap: 4px;
`;

const SidebarBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
  &:hover { background: var(--bg-tertiary); color: var(--text-primary); }
`;

const ShareOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.15s ease;
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

const ShareModal = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 32px;
  width: 460px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  animation: slideUp 0.2s ease;
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;

const ShareIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 8px;
`;

const ShareTitle = styled.h3`
  margin: 0 0 4px;
  font-size: 1.2rem;
  color: var(--text-primary);
  font-family: var(--font-sans);
`;

const ShareDesc = styled.p`
  margin: 0 0 20px;
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

const ShareLinkBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 4px 4px 4px 14px;
`;

const ShareLinkText = styled.span`
  flex: 1;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-primary);
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CopyBtn = styled.button`
  padding: 8px 18px;
  background: var(--accent-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  &:hover { background: var(--accent-hover); }
`;

const ShareHint = styled.p`
  margin: 16px 0 20px;
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const ShareCloseBtn = styled.button`
  padding: 10px 32px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: var(--accent-color); }
`;

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--bg-primary);
  gap: 24px;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const ProgressTitle = styled.h2`
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
`;

const StepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 320px;
`;

const Step = styled.div<{ status: 'pending' | 'active' | 'done' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  color: ${p => p.status === 'done' ? 'var(--success-color)' :
    p.status === 'active' ? 'var(--text-primary)' :
    p.status === 'error' ? 'var(--error-color)' :
    'var(--text-secondary)'};
`;

const StepDot = styled.span<{ status: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  flex-shrink: 0;
  ${p => p.status === 'done' ? `background: var(--success-color); color: #fff;` :
    p.status === 'active' ? `background: var(--accent-color); color: #fff; animation: pulse 1.5s infinite;` :
    p.status === 'error' ? `background: var(--error-color); color: #fff;` :
    `background: var(--bg-tertiary); color: var(--text-secondary);`}
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
`;

const CloneOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CloneBox = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  min-width: 360px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const CloneSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
`;

const CloneTitle = styled.h3`
  margin: 0;
  font-size: 1.15rem;
  color: var(--text-primary);
  font-family: var(--font-sans);
`;

const CloneStep = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-family: var(--font-mono);
`;

const CloneCloseBtn = styled.button`
  padding: 8px 24px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 8px;
  &:hover { border-color: var(--accent-color); }
`;

export const CodingPage = () => {
    const [podCreated, setPodCreated] = useState(false);
    const [searchParams] = useSearchParams();
    const replId = searchParams.get('replId') ?? '';
    const { token } = useAuth();
    const [step, setStep] = useState(0);
    const [error, setError] = useState('');

    const steps = [
        'Requesting container...',
        'Pulling image & creating pod...',
        'Setting up workspace...',
        'Connecting...',
    ];

    useEffect(() => {
        if (!replId) return;

        const startPod = async () => {
            try {
                setStep(0);
                // Step 1: Request container
                await new Promise(r => setTimeout(r, 500));
                setStep(1);

                // Step 2: Create pod via orchestrator
                await axios.post(`http://localhost:3002/start`, { replId }, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                });
                setStep(2);

                // Step 3: Wait for pod to be ready
                await new Promise(r => setTimeout(r, 1000));
                setStep(3);

                // Step 4: Done
                await new Promise(r => setTimeout(r, 500));
                setPodCreated(true);
            } catch (err: any) {
                console.error(err);
                setError(err?.response?.data?.message || err.message || 'Failed to start environment');
            }
        };

        startPod();
    }, [replId, token]);

    if (podCreated) {
        return <CodingPagePostPodCreation />;
    }

    return (
        <ProgressContainer>
            {!error && <Spinner />}
            <ProgressTitle>{error ? '⚠️ Setup Failed' : 'Starting your environment'}</ProgressTitle>
            <StepsList>
                {steps.map((label, i) => {
                    const status = error && i === step ? 'error' :
                                   i < step ? 'done' :
                                   i === step ? 'active' : 'pending';
                    return (
                        <Step key={i} status={status}>
                            <StepDot status={status}>
                                {status === 'done' ? '✓' : status === 'error' ? '✕' : i + 1}
                            </StepDot>
                            {label}
                        </Step>
                    );
                })}
            </StepsList>
            {error && (
                <div style={{ color: 'var(--error-color)', fontSize: '0.85rem', maxWidth: 400, textAlign: 'center' }}>
                    {error}
                </div>
            )}
        </ProgressContainer>
    );
}

export const CodingPagePostPodCreation = () => {
    const [searchParams] = useSearchParams();
    const replId = searchParams.get('replId') ?? '';
    const cloneUrl = searchParams.get('clone');
    const [loaded, setLoaded] = useState(false);
    const socket = useSocket(replId);
    const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<'terminal' | 'output'>('terminal');
    const [outputKey, setOutputKey] = useState(0);
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [editorInstance, setEditorInstance] = useState<editor.IStandaloneCodeEditor | null>(null);
    const [collabActive, setCollabActive] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [cloneProgress, setCloneProgress] = useState<{ active: boolean, step: string, error: string }>({ active: false, step: '', error: '' });

    // Collaboration hook
    const { connected, users } = useCollaboration(
        collabActive ? replId : undefined,
        collabActive ? selectedFile?.path : undefined,
        collabActive ? editorInstance : null,
        user?.name || 'Anonymous'
    );

    const handleEditorReady = useCallback((ed: editor.IStandaloneCodeEditor) => {
        setEditorInstance(ed);
    }, []);

    const handleStartCollab = () => {
        setCollabActive(true);
        setShowShareModal(true);
        setLinkCopied(false);
    };

    const handleStopCollab = () => {
        setCollabActive(false);
        setShowShareModal(false);
    };

    const collabLink = `${window.location.origin}/coding?replId=${replId}&collab=true`;

    // Auto-join collab if URL has collab param (someone shared the link)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('collab') === 'true' && !collabActive) {
            setCollabActive(true);
        }
    }, []);

    // Heartbeat every 60 seconds
    useEffect(() => {
        if (!replId || !token) return;
        const interval = setInterval(() => {
            fetch(`http://localhost:3003/api/projects/${replId}/heartbeat`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            }).catch(() => {});
        }, 60000);
        return () => clearInterval(interval);
    }, [replId, token]);

    useEffect(() => {
        if (socket) {
            socket.on('loaded', ({ rootContent }: { rootContent: RemoteFile[] }) => {
                setLoaded(true);
                setFileStructure(rootContent);
            });
        }
    }, [socket]);

    // Handle GitHub clone if URL provided
    useEffect(() => {
        if (socket && loaded && cloneUrl) {
            doClone(cloneUrl);
        }
    }, [socket, loaded, cloneUrl]);

    const doClone = (repoUrl: string) => {
        setCloneProgress({ active: true, step: 'Connecting to GitHub...', error: '' });
        setTimeout(() => {
            setCloneProgress(p => ({ ...p, step: 'Cloning repository...' }));
            socket?.emit('gitClone', { repoUrl }, (result: any) => {
                if (result?.success) {
                    setCloneProgress(p => ({ ...p, step: 'Refreshing file tree...' }));
                    // Re-fetch root files
                    socket?.emit('fetchDir', '', (data: RemoteFile[]) => {
                        setFileStructure(data);
                        setTimeout(() => {
                            setCloneProgress({ active: false, step: '', error: '' });
                        }, 500);
                    });
                } else {
                    setCloneProgress({ active: false, step: '', error: result?.error || 'Clone failed' });
                }
            });
        }, 800);
    };

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

    const handleClone = () => setActiveModal('clone');
    const handleNewFile = () => setActiveModal('newFile');
    const handleNewFolder = () => setActiveModal('newFolder');
    const handleDeleteFile = () => {
        if (!selectedFile) return;
        setActiveModal('delete');
    };
    const handleRenameFile = () => {
        if (!selectedFile) return;
        setActiveModal('rename');
    };

    const handleDownload = async () => {
        try {
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();

            const addFilesToZip = async (files: RemoteFile[]) => {
                for (const file of files) {
                    if (file.type === 'file') {
                        await new Promise<void>((resolve) => {
                            socket?.emit('fetchContent', { path: file.path }, (content: string) => {
                                zip.file(file.path, content);
                                resolve();
                            });
                        });
                    } else if (file.type === 'dir') {
                        await new Promise<void>((resolve) => {
                            socket?.emit('fetchDir', file.path, (children: RemoteFile[]) => {
                                addFilesToZip(children).then(resolve);
                            });
                        });
                    }
                }
            };

            await addFilesToZip(fileStructure);
            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${replId}.zip`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    const [activeModal, setActiveModal] = useState<string | null>(null);

    if (!loaded) {
        return <CenterLoader>Connecting to DevContainer...</CenterLoader>;
    }

    return (
        <Layout>
            <Navbar>
                <Brand>
                    <BackBtn onClick={() => navigate('/dashboard')} title="Back to Dashboard">
                        <VscArrowLeft size={18} />
                    </BackBtn>
                    <VscCloud size={20} color="var(--accent-color)" />
                    CloudCode IDE
                </Brand>
                <ReplName>{replId}</ReplName>
                <Actions>
                    {collabActive && <CollabPresence users={users} />}
                    {!collabActive ? (
                        <ActionButton
                            onClick={handleStartCollab}
                            style={{ background: 'linear-gradient(135deg, #3fb950, #2ea043)' }}
                        >
                            👥 Collaborate
                        </ActionButton>
                    ) : (
                        <>
                            <ActionButton
                                onClick={() => setShowShareModal(true)}
                                style={{ background: 'linear-gradient(135deg, #3fb950, #2ea043)' }}
                            >
                                🔗 Share
                            </ActionButton>
                            <ActionButton
                                onClick={handleStopCollab}
                                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--error-color)', color: 'var(--error-color)' }}
                            >
                                ✕ Stop
                            </ActionButton>
                        </>
                    )}
                    <ActionButton
                        onClick={handleClone}
                        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                    >
                        <VscRepoClone /> Clone
                    </ActionButton>
                    <ActionButton onClick={handleRun}>
                        <VscPlay /> Run
                    </ActionButton>
                    <ActionButton
                        onClick={handleReload}
                        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                    >
                        <VscDebugRestart /> Reload
                    </ActionButton>
                    <ActionButton
                        onClick={handleDownload}
                        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                    >
                        <VscCloudDownload /> ZIP
                    </ActionButton>
                </Actions>
            </Navbar>

            <Workspace>
                <SidebarContainer>
                    <SidebarHeader>
                        <span>EXPLORER</span>
                        <SidebarActions>
                            <SidebarBtn onClick={handleNewFile} title="New File"><VscNewFile /></SidebarBtn>
                            <SidebarBtn onClick={handleNewFolder} title="New Folder"><VscNewFolder /></SidebarBtn>
                            <SidebarBtn onClick={handleRenameFile} title="Rename"><VscEdit /></SidebarBtn>
                            <SidebarBtn onClick={handleDeleteFile} title="Delete" style={{color: 'var(--error-color)'}}><VscTrash /></SidebarBtn>
                        </SidebarActions>
                    </SidebarHeader>
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
                        <Code
                            socket={socket!}
                            selectedFile={selectedFile}
                            replId={replId}
                            userName={user?.name}
                            onEditorReady={handleEditorReady}
                            collabActive={collabActive}
                        />
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
                                <TerminalPanel socket={socket!} />
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

            {activeModal === 'clone' && (
                <PromptModal
                    icon="📦"
                    title="Clone GitHub Repository"
                    description="Enter the full URL of the repository you want to clone."
                    placeholder="https://github.com/user/repo.git"
                    confirmText="Clone"
                    onConfirm={(url) => {
                        setActiveModal(null);
                        doClone(url);
                    }}
                    onCancel={() => setActiveModal(null)}
                />
            )}

            {cloneProgress.active && (
                <CloneOverlay>
                    <CloneBox>
                        <CloneSpinner />
                        <CloneTitle>📦 Cloning Repository</CloneTitle>
                        <CloneStep>{cloneProgress.step}</CloneStep>
                    </CloneBox>
                </CloneOverlay>
            )}

            {cloneProgress.error && (
                <CloneOverlay onClick={() => setCloneProgress(p => ({ ...p, error: '' }))}>
                    <CloneBox onClick={e => e.stopPropagation()}>
                        <CloneTitle>⚠️ Clone Failed</CloneTitle>
                        <CloneStep style={{ color: 'var(--error-color)' }}>{cloneProgress.error}</CloneStep>
                        <CloneCloseBtn onClick={() => setCloneProgress(p => ({ ...p, error: '' }))}>Close</CloneCloseBtn>
                    </CloneBox>
                </CloneOverlay>
            )}

            {activeModal === 'newFile' && (
                <PromptModal
                    icon="📄"
                    title="Create New File"
                    description="Enter the file path relative to the workspace root."
                    placeholder="src/hello.js"
                    confirmText="Create File"
                    onConfirm={(name) => {
                        setActiveModal(null);
                        socket?.emit('createFile', { path: name, content: '' }, () => {});
                    }}
                    onCancel={() => setActiveModal(null)}
                />
            )}

            {activeModal === 'newFolder' && (
                <PromptModal
                    icon="📁"
                    title="Create New Folder"
                    description="Enter the folder path relative to the workspace root."
                    placeholder="src/utils"
                    confirmText="Create Folder"
                    onConfirm={(name) => {
                        setActiveModal(null);
                        socket?.emit('createFolder', { path: name }, () => {});
                    }}
                    onCancel={() => setActiveModal(null)}
                />
            )}

            {activeModal === 'delete' && selectedFile && (
                <ConfirmModal
                    icon="🗑️"
                    title={`Delete "${selectedFile.name}"?`}
                    description="This action cannot be undone. The file will be permanently removed."
                    confirmText="Delete"
                    danger
                    onConfirm={() => {
                        setActiveModal(null);
                        socket?.emit('deleteItem', { path: selectedFile.path }, (result: any) => {
                            if (result?.success) setSelectedFile(undefined);
                        });
                    }}
                    onCancel={() => setActiveModal(null)}
                />
            )}

            {activeModal === 'rename' && selectedFile && (
                <PromptModal
                    icon="✏️"
                    title={`Rename "${selectedFile.name}"`}
                    description="Enter the new file path."
                    placeholder={selectedFile.path}
                    confirmText="Rename"
                    onConfirm={(newPath) => {
                        setActiveModal(null);
                        socket?.emit('renameItem', { oldPath: selectedFile.path, newPath }, () => {
                            setSelectedFile(undefined);
                        });
                    }}
                    onCancel={() => setActiveModal(null)}
                />
            )}
            {showShareModal && (
                <ShareOverlay onClick={() => setShowShareModal(false)}>
                    <ShareModal onClick={e => e.stopPropagation()}>
                        <ShareIcon>🔗</ShareIcon>
                        <ShareTitle>Share this project</ShareTitle>
                        <ShareDesc>Anyone with this link can join and edit in real-time</ShareDesc>
                        <ShareLinkBox>
                            <ShareLinkText>{collabLink}</ShareLinkText>
                            <CopyBtn onClick={() => {
                                navigator.clipboard.writeText(collabLink);
                                setLinkCopied(true);
                                setTimeout(() => setLinkCopied(false), 2000);
                            }}>
                                {linkCopied ? '✓ Copied!' : 'Copy'}
                            </CopyBtn>
                        </ShareLinkBox>
                        <ShareHint>💡 Open this link in another browser tab to test collaboration</ShareHint>
                        <ShareCloseBtn onClick={() => setShowShareModal(false)}>Done</ShareCloseBtn>
                    </ShareModal>
                </ShareOverlay>
            )}
        </Layout>
    );
}
