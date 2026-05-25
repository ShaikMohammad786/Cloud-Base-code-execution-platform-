import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAuth } from '../context/AuthContext';
import { NewProjectModal } from './NewProjectModal';
import { PromptModal, ConfirmModal } from './Modals';
import { VscAdd, VscRepoClone, VscSearch, VscSignOut, VscTrash } from 'react-icons/vsc';

interface Project {
  id: number;
  repl_id: string;
  name: string;
  language: string;
  is_active: number;
  last_accessed: string;
  created_at: string;
}

const Page = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
`;

const Navbar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
`;

const Logo = styled.span`
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 1.3rem;
  background: linear-gradient(135deg, #58a6ff, #a371f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
`;

const UserName = styled.span`
  color: var(--text-primary);
  font-size: 0.9rem;
`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  &:hover { border-color: var(--error-color); color: var(--error-color); }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 200px;
  position: relative;
  svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 36px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 0.9rem;
  outline: none;
  &:focus { border-color: var(--accent-color); }
  &::placeholder { color: var(--text-secondary); }
`;

const ActionBtn = styled.button<{ variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  ${p => p.variant === 'secondary' ? `
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    &:hover { border-color: var(--accent-color); }
  ` : `
    background: linear-gradient(135deg, var(--accent-color), #a371f7);
    color: #fff;
    &:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(88,166,255,0.3); }
  `}
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: var(--glass-border);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s;
  &:hover { border-color: var(--accent-color); transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const LangIcon = styled.span`
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 10px;
`;

const ProjectName = styled.h3`
  font-family: var(--font-sans);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  font-size: 1.1rem;
`;

const StatusBadge = styled.span<{ active: boolean }>`
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 500;
  ${p => p.active ? `
    background: rgba(63,185,80,0.15);
    color: var(--success-color);
  ` : `
    background: rgba(139,148,158,0.15);
    color: var(--text-secondary);
  `}
`;

const CardMeta = styled.p`
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin: 8px 0 16px;
`;

const CardActions = styled.div`
  display: flex;
  gap: 10px;
`;

const OpenBtn = styled.button`
  flex: 1;
  padding: 8px 16px;
  background: var(--accent-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s;
  &:hover { background: var(--accent-hover); }
`;

const DeleteBtn = styled.button`
  padding: 8px 12px;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  &:hover { border-color: var(--error-color); color: var(--error-color); }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
  h2 { font-size: 1.5rem; color: var(--text-primary); margin-bottom: 8px; }
  p { font-size: 0.95rem; margin-bottom: 24px; }
`;

function timeAgo(date: string): string {
  if (!date) return 'unknown';
  // SQLite CURRENT_TIMESTAMP is UTC — append Z if missing to parse correctly
  const utcDate = date.endsWith('Z') || date.includes('+') ? date : date.replace(' ', 'T') + 'Z';
  const seconds = Math.floor((Date.now() - new Date(utcDate).getTime()) / 1000);
  if (seconds < 0) return 'just now';
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:3003/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, [token]);

  const handleDelete = async (replId: string) => {
    try {
      await fetch(`http://localhost:3003/api/projects/${replId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      await fetch('http://localhost:3002/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ replId }),
      }).catch(() => {});
      setProjects(prev => prev.filter(p => p.repl_id !== replId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleCloneConfirm = (repoUrl: string) => {
    const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'cloned-project';
    const replId = repoName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    fetch('http://localhost:3001/clone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ repoUrl, replId }),
    }).then(() => {
      navigate(`/coding?replId=${replId}&clone=${encodeURIComponent(repoUrl)}`);
    }).catch(err => console.error('Clone failed:', err));
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.repl_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Page>
      <Navbar>
        <Logo>⚡ CloudCode</Logo>
        <UserSection>
          {user?.avatar && <Avatar src={user.avatar} alt={user.name} />}
          <UserName>{user?.name}</UserName>
          <LogoutBtn onClick={() => { logout(); navigate('/'); }}>
            <VscSignOut /> Logout
          </LogoutBtn>
        </UserSection>
      </Navbar>
      <Content>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace
          </p>
        </div>
        <TopBar>
          <SearchBox>
            <VscSearch />
            <SearchInput
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </SearchBox>
          <ActionBtn variant="secondary" onClick={() => setShowCloneModal(true)}>
            <VscRepoClone /> Clone from GitHub
          </ActionBtn>
          <ActionBtn onClick={() => setShowModal(true)}>
            <VscAdd /> New Project
          </ActionBtn>
        </TopBar>

        {loading ? (
          <EmptyState><p>Loading projects...</p></EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState>
            <h2>No projects yet</h2>
            <p>Create your first project or clone from GitHub to get started.</p>
            <ActionBtn onClick={() => setShowModal(true)}>
              <VscAdd /> Create Project
            </ActionBtn>
          </EmptyState>
        ) : (
          <Grid>
            {filtered.map(project => (
              <Card key={project.id}>
                <CardHeader>
                  <LangIcon>{project.language === 'node-js' ? '🟨' : '🐍'}</LangIcon>
                  <ProjectName>{project.name}</ProjectName>
                  <StatusBadge active={!!project.is_active}>
                    {project.is_active ? '🟢 Running' : '⚫ Stopped'}
                  </StatusBadge>
                </CardHeader>
                <CardMeta>
                  Created {timeAgo(project.created_at)} · Last active {timeAgo(project.last_accessed)}
                </CardMeta>
                <CardActions>
                  <OpenBtn onClick={() => navigate(`/coding?replId=${project.repl_id}`)}>
                    Open
                  </OpenBtn>
                  <DeleteBtn onClick={() => setDeleteTarget(project.repl_id)}>
                    <VscTrash />
                  </DeleteBtn>
                </CardActions>
              </Card>
            ))}
          </Grid>
        )}
      </Content>

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchProjects(); }}
          token={token!}
        />
      )}

      {showCloneModal && (
        <PromptModal
          icon="📦"
          title="Clone GitHub Repository"
          description="Enter the full URL of the repository you want to clone."
          placeholder="https://github.com/user/repo.git"
          confirmText="Clone"
          onConfirm={(url) => { setShowCloneModal(false); handleCloneConfirm(url); }}
          onCancel={() => setShowCloneModal(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          icon="🗑️"
          title={`Delete "${deleteTarget}"?`}
          description="This will permanently delete the project and stop any running containers."
          confirmText="Delete Project"
          danger
          onConfirm={() => { handleDelete(deleteTarget); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </Page>
  );
};
