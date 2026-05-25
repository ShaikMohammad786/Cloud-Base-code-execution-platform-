import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: var(--glass-border);
  border-radius: 20px;
  box-shadow: var(--glass-shadow);
  padding: 36px;
  width: 440px;
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  &:hover { color: var(--text-primary); }
`;

const Title = styled.h2`
  font-family: var(--font-sans);
  color: var(--text-primary);
  margin: 0 0 24px;
  font-size: 1.3rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 0.95rem;
  outline: none;
  margin-bottom: 20px;
  &:focus { border-color: var(--accent-color); }
  &::placeholder { color: var(--text-secondary); }
`;

const Label = styled.label`
  display: block;
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-bottom: 8px;
  font-weight: 500;
`;

const LangGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
`;

const LangCard = styled.button<{ selected: boolean }>`
  padding: 20px;
  border-radius: 12px;
  background: var(--bg-primary);
  border: 2px solid ${p => p.selected ? 'var(--accent-color)' : 'var(--border-color)'};
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  ${p => p.selected && 'box-shadow: 0 0 15px rgba(88,166,255,0.2);'}
  &:hover { border-color: var(--accent-color); }
  .icon { font-size: 2rem; display: block; margin-bottom: 8px; }
  .name { font-weight: 600; font-size: 0.9rem; }
`;

const CreateBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--accent-color), #a371f7);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(88,166,255,0.3); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

interface Props {
  onClose: () => void;
  onCreated: () => void;
  token: string;
}

export const NewProjectModal = ({ onClose, onCreated, token }: Props) => {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('node-js');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    const replId = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    try {
      // Create in init-service (copies S3 template + registers with auth)
      await fetch('http://localhost:3001/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ replId, language }),
      });
      onCreated();
      navigate(`/coding?replId=${replId}`);
    } catch (err) {
      console.error('Create failed:', err);
      setCreating(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <CloseBtn onClick={onClose}>✕</CloseBtn>
        <Title>Create New Project</Title>
        <Label>Project Name</Label>
        <Input
          placeholder="my-awesome-project"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
        <Label>Language</Label>
        <LangGrid>
          <LangCard selected={language === 'node-js'} onClick={() => setLanguage('node-js')}>
            <span className="icon">🟨</span>
            <span className="name">Node.js</span>
          </LangCard>
          <LangCard selected={language === 'python'} onClick={() => setLanguage('python')}>
            <span className="icon">🐍</span>
            <span className="name">Python</span>
          </LangCard>
        </LangGrid>
        <CreateBtn onClick={handleCreate} disabled={!name.trim() || creating}>
          {creating ? 'Creating...' : 'Create Project'}
        </CreateBtn>
      </Modal>
    </Overlay>
  );
};
