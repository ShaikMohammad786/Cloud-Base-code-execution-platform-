import styled from '@emotion/styled';
import { VscHeart } from 'react-icons/vsc';

const FooterContainer = styled.footer`
  height: 40px;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-family: var(--font-sans);
  margin-top: auto; /* Push to bottom if needed */
`;

const HeartIcon = styled(VscHeart)`
  color: var(--error-color);
  margin: 0 4px;
  vertical-align: middle;
`;

export const Footer = () => {
    return (
        <FooterContainer>
        </FooterContainer>
    );
};
