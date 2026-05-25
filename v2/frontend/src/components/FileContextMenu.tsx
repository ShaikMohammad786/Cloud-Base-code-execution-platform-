import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';

interface Props {
  x: number;
  y: number;
  isDirectory: boolean;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const Menu = styled.div<{ x: number; y: number }>`
  position: fixed;
  left: ${p => p.x}px;
  top: ${p => p.y}px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.4);
  padding: 6px 0;
  min-width: 180px;
  z-index: 999;
`;

const MenuItem = styled.button<{ danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 16px;
  background: none;
  border: none;
  color: ${p => p.danger ? 'var(--error-color)' : 'var(--text-primary)'};
  font-family: var(--font-sans);
  font-size: 0.85rem;
  cursor: pointer;
  text-align: left;
  &:hover { background: var(--bg-tertiary); }
`;

const Divider = styled.div`
  height: 1px;
  background: var(--border-color);
  margin: 4px 0;
`;

export const FileContextMenu = ({ x, y, isDirectory, onNewFile, onNewFolder, onRename, onDelete, onClose }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <Menu ref={ref} x={x} y={y}>
      {isDirectory && (
        <>
          <MenuItem onClick={() => { onNewFile(); onClose(); }}>📄 New File</MenuItem>
          <MenuItem onClick={() => { onNewFolder(); onClose(); }}>📁 New Folder</MenuItem>
          <Divider />
        </>
      )}
      <MenuItem onClick={() => { onRename(); onClose(); }}>✏️ Rename</MenuItem>
      <MenuItem danger onClick={() => { onDelete(); onClose(); }}>🗑️ Delete</MenuItem>
    </Menu>
  );
};
