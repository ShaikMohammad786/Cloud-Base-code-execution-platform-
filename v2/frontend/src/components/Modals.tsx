import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';

const Overlay = styled.div`
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

const Modal = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 28px;
  width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  animation: slideUp 0.2s ease;
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;

const Title = styled.h3`
  margin: 0 0 6px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-sans);
`;

const Desc = styled.p`
  margin: 0 0 18px 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: var(--font-mono);
  outline: none;
  transition: border 0.2s;
  box-sizing: border-box;
  &:focus { border-color: var(--accent-color); box-shadow: 0 0 0 3px rgba(47,129,247,0.15); }
`;

const BtnRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const Btn = styled.button<{ variant?: 'primary' | 'danger' | 'ghost' }>`
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-family: var(--font-sans);
  transition: all 0.15s;
  
  ${p => p.variant === 'primary' && `
    background: var(--accent-color);
    color: #fff;
    &:hover { background: var(--accent-hover); }
  `}
  ${p => p.variant === 'danger' && `
    background: var(--error-color);
    color: #fff;
    &:hover { opacity: 0.9; }
  `}
  ${p => (!p.variant || p.variant === 'ghost') && `
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
    &:hover { color: var(--text-primary); }
  `}
`;

const Icon = styled.span`
  font-size: 1.5rem;
  margin-bottom: 4px;
  display: block;
`;

// ===== Prompt Modal =====
interface PromptProps {
  icon?: string;
  title: string;
  description?: string;
  placeholder?: string;
  confirmText?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export const PromptModal = ({ icon, title, description, placeholder, confirmText = 'Create', onConfirm, onCancel }: PromptProps) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = () => {
    if (value.trim()) onConfirm(value.trim());
  };

  return (
    <Overlay onClick={onCancel}>
      <Modal onClick={e => e.stopPropagation()}>
        {icon && <Icon>{icon}</Icon>}
        <Title>{title}</Title>
        {description && <Desc>{description}</Desc>}
        <Input
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); if (e.key === 'Escape') onCancel(); }}
        />
        <BtnRow>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={!value.trim()}>{confirmText}</Btn>
        </BtnRow>
      </Modal>
    </Overlay>
  );
};

// ===== Confirm Modal =====
interface ConfirmProps {
  icon?: string;
  title: string;
  description?: string;
  confirmText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({ icon, title, description, confirmText = 'Delete', danger = true, onConfirm, onCancel }: ConfirmProps) => {
  return (
    <Overlay onClick={onCancel}>
      <Modal onClick={e => e.stopPropagation()}>
        {icon && <Icon>{icon}</Icon>}
        <Title>{title}</Title>
        {description && <Desc>{description}</Desc>}
        <BtnRow>
          <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmText}</Btn>
        </BtnRow>
      </Modal>
    </Overlay>
  );
};
