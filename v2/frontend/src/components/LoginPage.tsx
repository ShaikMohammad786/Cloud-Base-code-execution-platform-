import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
  50% { transform: translateY(-20px) rotate(5deg); opacity: 0.6; }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0e1117 0%, #161b22 30%, #1a1040 60%, #0e1117 100%);
  background-size: 400% 400%;
  animation: ${gradientShift} 15s ease infinite;
  position: relative;
  overflow: hidden;
`;

const FloatingCode = styled.div<{ delay: number; left: string; top: string }>`
  position: absolute;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--accent-color);
  opacity: 0.15;
  animation: ${float} ${props => 4 + props.delay}s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  left: ${props => props.left};
  top: ${props => props.top};
  pointer-events: none;
  user-select: none;
`;

const Card = styled.div`
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: var(--glass-border);
  border-radius: 20px;
  box-shadow: var(--glass-shadow);
  padding: 48px 40px;
  width: 420px;
  text-align: center;
  z-index: 1;
`;

const Logo = styled.h1`
  font-family: var(--font-sans);
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #58a6ff, #a371f7, #f778ba);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px;
`;

const CodeIcon = styled.span`
  font-size: 2.5rem;
  display: block;
  margin-bottom: 12px;
`;

const Tagline = styled.p`
  font-family: var(--font-sans);
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0 0 36px;
  line-height: 1.5;
`;

const AuthButton = styled.a<{ variant: 'google' | 'github' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 14px 20px;
  border-radius: 12px;
  font-family: var(--font-sans);
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 14px;
  border: none;

  ${props => props.variant === 'google' ? `
    background: #ffffff;
    color: #333;
    &:hover {
      background: #f0f0f0;
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(255,255,255,0.2);
    }
  ` : `
    background: #24292e;
    color: #fff;
    border: 1px solid rgba(255,255,255,0.1);
    &:hover {
      background: #2f363d;
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(88,166,255,0.15);
    }
  `}

  &:active { transform: translateY(0); }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: var(--text-secondary);
  font-size: 0.8rem;
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-color);
  }
  &::before { margin-right: 12px; }
  &::after { margin-left: 12px; }
`;

const codeSnippets = [
  'const app = express();',
  'import React from "react"',
  'git commit -m "feat"',
  'npm run dev',
  'kubectl apply -f',
  'docker build .',
  'SELECT * FROM users',
  'async function main()',
];

export const LoginPage = () => {
  return (
    <PageWrapper>
      {codeSnippets.map((code, i) => (
        <FloatingCode
          key={i}
          delay={i * 0.8}
          left={`${10 + (i * 12) % 80}%`}
          top={`${10 + (i * 15) % 75}%`}
        >
          {code}
        </FloatingCode>
      ))}
      <Card>
        <CodeIcon>⚡</CodeIcon>
        <Logo>CloudCode</Logo>
        <Tagline>Code anywhere. Collaborate in real-time.</Tagline>
        <AuthButton variant="google" href="http://localhost:3003/auth/google">
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </AuthButton>
        <Divider>or</Divider>
        <AuthButton variant="github" href="http://localhost:3003/auth/github">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
        </AuthButton>
      </Card>
    </PageWrapper>
  );
};
