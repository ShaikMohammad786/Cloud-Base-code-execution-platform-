import styled from '@emotion/styled';

interface User {
  name: string;
  color: string;
}

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: -4px;
`;

const AvatarCircle = styled.div<{ color: string; index: number }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${p => p.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #fff;
  font-weight: 700;
  border: 2px solid var(--bg-secondary);
  margin-left: ${p => p.index > 0 ? '-8px' : '0'};
  z-index: ${p => 10 - p.index};
  position: relative;
`;

const Count = styled.span`
  font-size: 0.8rem;
  color: var(--success-color);
  font-weight: 600;
  margin-left: 8px;
`;

export const CollabPresence = ({ users }: { users: User[] }) => {
  if (users.length <= 1) return null;

  return (
    <Bar>
      {users.slice(0, 5).map((u, i) => (
        <AvatarCircle key={i} color={u.color} index={i} title={u.name}>
          {u.name.charAt(0).toUpperCase()}
        </AvatarCircle>
      ))}
      {users.length > 5 && <Count>+{users.length - 5}</Count>}
      <Count>{users.length} live</Count>
    </Bar>
  );
};
