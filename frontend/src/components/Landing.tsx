import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { SiJavascript, SiPython } from 'react-icons/si';
import { VscCode } from 'react-icons/vsc';
import { Footer } from './Footer';

const SLUG_WORKS = ["car", "dog", "computer", "person", "inside", "word", "for", "please", "to", "cool", "open", "source"];
const SERVICE_URL = "http://localhost:3001";

/** Styled Components */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: radial-gradient(circle at 50% 10%, #1f2329 0%, #0e1117 100%);
  color: var(--text-primary);
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  z-index: 1;
  flex: 1;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #8b949e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
`;

const GlassCard = styled.div`
  background: var(--glass-bg);
  border: var(--glass-border);
  box-shadow: var(--glass-shadow);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 2.5rem;
  width: 450px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
  font-family: var(--font-mono);
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(47, 129, 247, 0.1);
  }
`;

const LanguageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const LanguageOption = styled.div<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid ${props => props.selected ? 'var(--accent-color)' : 'var(--border-color)'};
  background: ${props => props.selected ? 'rgba(47, 129, 247, 0.1)' : 'var(--bg-tertiary)'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.selected ? 'var(--accent-color)' : 'var(--text-secondary)'};
    background: ${props => props.selected ? 'rgba(47, 129, 247, 0.15)' : 'var(--bg-secondary)'};
  }
`;

const StyledButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;

  &:hover {
    background-color: var(--accent-hover);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

function getRandomSlug() {
  let slug = "";
  for (let i = 0; i < 3; i++) {
    slug += SLUG_WORKS[Math.floor(Math.random() * SLUG_WORKS.length)];
  }
  return slug;
}

export const Landing = () => {
  const [language, setLanguage] = useState("node-js");
  const [replId, setReplId] = useState(getRandomSlug());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <Container>
      <ContentWrapper>
        <div style={{ textAlign: 'center' }}>
          <Title>
            <VscCode size={48} color="var(--accent-color)" />
            CloudCode
          </Title>
          <Subtitle>Create, Code, and Deploy instant developer environments.</Subtitle>
        </div>

        <GlassCard>
          <InputGroup>
            <Label>Project Name</Label>
            <StyledInput
              onChange={(e) => setReplId(e.target.value)}
              type="text"
              placeholder="enter-project-name"
              value={replId}
            />
          </InputGroup>

          <InputGroup>
            <Label>Language</Label>
            <LanguageGrid>
              <LanguageOption
                selected={language === "node-js"}
                onClick={() => setLanguage("node-js")}
              >
                <SiJavascript size={24} color="#f7df1e" />
                <span>Node.js</span>
              </LanguageOption>

              <LanguageOption
                selected={language === "python"}
                onClick={() => setLanguage("python")}
              >
                <SiPython size={24} color="#3776ab" />
                <span>Python</span>
              </LanguageOption>
            </LanguageGrid>
          </InputGroup>

          <StyledButton disabled={loading} onClick={async () => {
            setLoading(true);
            await axios.post(`${SERVICE_URL}/project`, { replId, language });
            setLoading(false);
            navigate(`/coding/?replId=${replId}`)
          }}>
            {loading ? "Initializing Environment..." : "Create Repl"}
          </StyledButton>
        </GlassCard>
      </ContentWrapper>
      <Footer />
    </Container>
  );
}
