import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useAuth } from '../context/AuthContext';
import {
  VscCode, VscCloud, VscGithubInverted, VscOrganization,
  VscPackage, VscLightbulb, VscLock, VscRocket, VscRepo,
  VscTerminal, VscArrowRight, VscSymbolEvent
} from 'react-icons/vsc';
import { FcGoogle } from 'react-icons/fc';

/* ─── Animations ─── */
const glow = keyframes`
  0%, 100% { opacity: 0.12; }
  50% { opacity: 0.25; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

/* ─── Layout ─── */
const Page = styled.div`
  min-height: 100vh;
  background: #070b14;
  color: #e6edf3;
  overflow-x: hidden;
  font-family: var(--font-sans);
  scroll-behavior: smooth;
`;

const GlowOrb = styled.div<{ top: string; left: string; color: string; delay: string; size?: string }>`
  position: absolute;
  width: ${p => p.size || '500px'};
  height: ${p => p.size || '500px'};
  border-radius: 50%;
  background: ${p => p.color};
  filter: blur(140px);
  top: ${p => p.top};
  left: ${p => p.left};
  animation: ${glow} 8s ease-in-out infinite;
  animation-delay: ${p => p.delay};
  pointer-events: none;
`;

/* ─── Nav ─── */
const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 48px;
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(7,11,20,0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(48,54,61,0.4);
`;

const NavBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 1.25rem;
  color: #fff;
  letter-spacing: -0.02em;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 28px;
  a {
    color: #8b949e;
    text-decoration: none;
    font-size: 0.88rem;
    font-weight: 500;
    transition: color 0.2s;
    &:hover { color: #e6edf3; }
  }
`;

const NavBtn = styled.button`
  padding: 8px 20px;
  background: linear-gradient(135deg, #58a6ff, #a371f7);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { box-shadow: 0 4px 20px rgba(88,166,255,0.3); transform: translateY(-1px); }
`;

/* ─── Hero ─── */
const Hero = styled.section`
  position: relative;
  text-align: center;
  padding: 100px 24px 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 18px;
  background: rgba(88,166,255,0.06);
  border: 1px solid rgba(88,166,255,0.15);
  border-radius: 20px;
  font-size: 0.8rem;
  color: #58a6ff;
  font-weight: 500;
  margin-bottom: 28px;
  animation: ${fadeUp} 0.5s ease both;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.8rem, 6vw, 5rem);
  font-weight: 800;
  line-height: 1.08;
  margin: 0 0 24px;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #ffffff 0%, #c9d1d9 30%, #58a6ff 60%, #a371f7 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${fadeUp} 0.5s ease 0.1s both, ${shimmer} 8s linear infinite;
`;

const HeroSub = styled.p`
  font-size: 1.15rem;
  color: #8b949e;
  max-width: 560px;
  line-height: 1.7;
  margin: 0 auto 44px;
  animation: ${fadeUp} 0.5s ease 0.2s both;
`;

const HeroBtns = styled.div`
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  animation: ${fadeUp} 0.5s ease 0.3s both;
`;

const PrimaryBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 30px;
  background: linear-gradient(135deg, #58a6ff, #a371f7);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  &:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(88,166,255,0.3); }
`;

const SecondaryBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 30px;
  background: rgba(255,255,255,0.04);
  color: #e6edf3;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  &:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); transform: translateY(-2px); }
`;

/* ─── Terminal Mockup ─── */
const TerminalWrap = styled.div`
  margin-top: 64px;
  width: 100%;
  max-width: 680px;
  animation: ${fadeUp} 0.6s ease 0.4s both;
`;

const TerminalBox = styled.div`
  background: #0d1117;
  border: 1px solid #21262d;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(88,166,255,0.05);
  animation: ${float} 6s ease-in-out infinite;
`;

const TerminalBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  background: #161b22;
  border-bottom: 1px solid #21262d;
`;

const Dot = styled.span<{ c: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${p => p.c};
`;

const TerminalBody = styled.div`
  padding: 24px;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  line-height: 2;
  color: #8b949e;
  min-height: 180px;
`;

const TermLine = styled.div<{ delay?: string }>`
  animation: ${fadeUp} 0.3s ease ${p => p.delay || '0s'} both;
`;

const Accent = styled.span` color: #58a6ff; `;
const Green = styled.span` color: #3fb950; `;
const Purple = styled.span` color: #a371f7; `;
const Cursor = styled.span`
  display: inline-block;
  width: 8px;
  height: 15px;
  background: #58a6ff;
  animation: ${blink} 1s step-end infinite;
  vertical-align: middle;
  margin-left: 4px;
  border-radius: 1px;
`;

/* ─── Sections ─── */
const Section = styled.section`
  padding: 100px 48px;
  position: relative;
  z-index: 2;
`;

const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #58a6ff;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 800;
  text-align: center;
  margin: 0 0 12px;
  color: #fff;
  letter-spacing: -0.02em;
`;

const SectionSub = styled.p`
  text-align: center;
  color: #8b949e;
  font-size: 1rem;
  max-width: 480px;
  margin: 0 auto 64px;
  line-height: 1.6;
`;

/* ─── Features ─── */
const FeatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: 1060px;
  margin: 0 auto;
`;

const FeatCard = styled.div`
  background: rgba(13,17,23,0.7);
  backdrop-filter: blur(8px);
  border: 1px solid #1b1f27;
  border-radius: 16px;
  padding: 32px 28px;
  transition: all 0.3s;
  &:hover {
    border-color: rgba(88,166,255,0.3);
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.25), 0 0 20px rgba(88,166,255,0.06);
  }
`;

const FeatIconWrap = styled.div<{ bg: string }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${p => p.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
`;

const FeatTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 600;
  color: #e6edf3;
  margin: 0 0 8px;
`;

const FeatDesc = styled.p`
  font-size: 0.88rem;
  color: #8b949e;
  line-height: 1.6;
  margin: 0;
`;

/* ─── How It Works ─── */
const StepsGrid = styled.div`
  display: flex;
  gap: 32px;
  max-width: 960px;
  margin: 0 auto;
  justify-content: center;
  flex-wrap: wrap;
`;

const StepCard = styled.div`
  text-align: center;
  flex: 1;
  min-width: 240px;
  max-width: 280px;
  padding: 32px 24px;
  background: rgba(13,17,23,0.5);
  border: 1px solid #1b1f27;
  border-radius: 16px;
  transition: all 0.3s;
  &:hover { border-color: rgba(88,166,255,0.2); }
`;

const StepNum = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(88,166,255,0.15), rgba(163,113,247,0.15));
  border: 1px solid rgba(88,166,255,0.2);
  color: #58a6ff;
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
`;

const StepTitle = styled.h4`
  font-size: 1rem;
  color: #e6edf3;
  margin: 0 0 8px;
  font-weight: 600;
`;

const StepDesc = styled.p`
  font-size: 0.85rem;
  color: #8b949e;
  margin: 0;
  line-height: 1.5;
`;

/* ─── CTA ─── */
const CTASection = styled.section`
  padding: 80px 48px 100px;
  text-align: center;
  position: relative;
  z-index: 2;
`;

const CTABox = styled.div`
  max-width: 580px;
  margin: 0 auto;
  padding: 52px 48px;
  background: linear-gradient(145deg, rgba(13,17,23,0.8), rgba(22,27,34,0.6));
  backdrop-filter: blur(12px);
  border: 1px solid #21262d;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.3);
`;

const CTATitle = styled.h2`
  font-size: 2rem;
  color: #fff;
  margin: 0 0 10px;
  font-weight: 700;
`;

const CTASub = styled.p`
  color: #8b949e;
  margin: 0 0 32px;
  font-size: 0.95rem;
`;

const AuthBtns = styled.div`
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
`;

const GoogleBtn = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 26px;
  background: #fff;
  color: #1a1a2e;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.92rem;
  text-decoration: none;
  transition: all 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(255,255,255,0.12); }
`;

const GitHubBtn = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 26px;
  background: #161b22;
  color: #e6edf3;
  border: 1px solid #30363d;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.92rem;
  text-decoration: none;
  transition: all 0.2s;
  &:hover { background: #1f242c; transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.3); }
`;

/* ─── Footer ─── */
const FooterBar = styled.footer`
  padding: 28px 48px;
  border-top: 1px solid #161b22;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #484f58;
  font-size: 0.82rem;
  flex-wrap: wrap;
  gap: 12px;
  a {
    color: #6e7681;
    text-decoration: none;
    transition: color 0.2s;
    &:hover { color: #58a6ff; }
  }
`;

const Divider = styled.div`
  width: 100%;
  max-width: 1060px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #21262d, transparent);
  margin: 0 auto;
`;

/* ─── Component ─── */
export const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <Page>
      {/* Background Orbs */}
      <GlowOrb top="-150px" left="15%" color="#58a6ff" delay="0s" />
      <GlowOrb top="500px" left="75%" color="#a371f7" delay="2s" size="400px" />
      <GlowOrb top="1200px" left="5%" color="#3fb950" delay="4s" size="350px" />

      {/* Sticky Nav */}
      <Nav>
        <NavBrand>
          <VscCloud size={22} color="#58a6ff" />
          CloudCode
        </NavBrand>
        <NavLinks>
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          {isAuthenticated ? (
            <NavBtn onClick={() => navigate('/dashboard')}>Dashboard</NavBtn>
          ) : (
            <NavBtn onClick={() => navigate('/login')}>Get Started</NavBtn>
          )}
        </NavLinks>
      </Nav>

      {/* Hero */}
      <Hero>
        <Badge><VscLightbulb size={14} /> Powered by Kubernetes</Badge>
        <HeroTitle>Code. Collaborate.<br />Deploy.</HeroTitle>
        <HeroSub>
          Cloud-based IDE with real-time collaboration, multi-language support,
          and instant dev containers — right in your browser.
        </HeroSub>
        <HeroBtns>
          {isAuthenticated ? (
            <PrimaryBtn onClick={() => navigate('/dashboard')}>
              Open Dashboard <VscArrowRight />
            </PrimaryBtn>
          ) : (
            <>
              <PrimaryBtn onClick={() => window.location.href = 'http://localhost:3003/auth/google'}>
                <FcGoogle size={20} /> Get Started Free
              </PrimaryBtn>
              <SecondaryBtn onClick={() => window.location.href = 'http://localhost:3003/auth/github'}>
                <VscGithubInverted size={18} /> Continue with GitHub
              </SecondaryBtn>
            </>
          )}
        </HeroBtns>

        {/* Terminal Mockup */}
        <TerminalWrap>
          <TerminalBox>
            <TerminalBar>
              <Dot c="#ff5f57" />
              <Dot c="#febc2e" />
              <Dot c="#28c840" />
              <span style={{ color: '#484f58', fontSize: '0.8rem', marginLeft: 10, fontFamily: 'var(--font-mono)' }}>
                cloudcode ~ terminal
              </span>
            </TerminalBar>
            <TerminalBody>
              <TermLine delay="0.6s"><Green>$</Green> cloudcode create my-app --lang node</TermLine>
              <TermLine delay="0.9s"><Accent>{'>'}</Accent> Container provisioned in <Purple>2.1s</Purple></TermLine>
              <TermLine delay="1.2s"><Accent>{'>'}</Accent> Node.js 20 environment ready</TermLine>
              <TermLine delay="1.5s"><Accent>{'>'}</Accent> Monaco editor connected</TermLine>
              <TermLine delay="1.8s"><Green>$</Green> npm start</TermLine>
              <TermLine delay="2.1s"><Green>{'>'}</Green> Server running on <Accent>port 3000</Accent> <Cursor /></TermLine>
            </TerminalBody>
          </TerminalBox>
        </TerminalWrap>
      </Hero>

      <Divider />

      {/* Features */}
      <Section id="features">
        <SectionLabel><VscSymbolEvent size={16} /> Capabilities</SectionLabel>
        <SectionTitle>Everything you need to code</SectionTitle>
        <SectionSub>Professional development tools with zero setup. Start coding in seconds.</SectionSub>
        <FeatGrid>
          <FeatCard>
            <FeatIconWrap bg="rgba(88,166,255,0.1)">
              <VscCloud size={22} color="#58a6ff" />
            </FeatIconWrap>
            <FeatTitle>Cloud Dev Containers</FeatTitle>
            <FeatDesc>Instant Linux environments with Node.js, Python, and more. Each project runs in its own isolated Kubernetes pod.</FeatDesc>
          </FeatCard>
          <FeatCard>
            <FeatIconWrap bg="rgba(63,185,80,0.1)">
              <VscOrganization size={22} color="#3fb950" />
            </FeatIconWrap>
            <FeatTitle>Real-time Collaboration</FeatTitle>
            <FeatDesc>Edit together with live cursors and presence indicators. Share a link and start pair programming instantly.</FeatDesc>
          </FeatCard>
          <FeatCard>
            <FeatIconWrap bg="rgba(163,113,247,0.1)">
              <VscRepo size={22} color="#a371f7" />
            </FeatIconWrap>
            <FeatTitle>GitHub Integration</FeatTitle>
            <FeatDesc>Clone any repository and start coding in seconds. Push changes back with the built-in terminal.</FeatDesc>
          </FeatCard>
          <FeatCard>
            <FeatIconWrap bg="rgba(210,153,34,0.1)">
              <VscCode size={22} color="#d29922" />
            </FeatIconWrap>
            <FeatTitle>Monaco Editor</FeatTitle>
            <FeatDesc>VS Code-powered editor with IntelliSense, syntax highlighting, and full multi-language support.</FeatDesc>
          </FeatCard>
        </FeatGrid>
      </Section>

      <Divider />

      {/* How It Works */}
      <Section id="how">
        <SectionLabel><VscRocket size={16} /> Quick Start</SectionLabel>
        <SectionTitle>Up and running in seconds</SectionTitle>
        <SectionSub>Three simple steps to your cloud workspace.</SectionSub>
        <StepsGrid>
          <StepCard>
            <StepNum><VscLock size={20} /></StepNum>
            <StepTitle>Sign In</StepTitle>
            <StepDesc>Authenticate with your Google or GitHub account. No passwords, no lengthy setup process.</StepDesc>
          </StepCard>
          <StepCard>
            <StepNum><VscPackage size={20} /></StepNum>
            <StepTitle>Create or Clone</StepTitle>
            <StepDesc>Start a fresh project or clone any GitHub repository directly into your cloud workspace.</StepDesc>
          </StepCard>
          <StepCard>
            <StepNum><VscTerminal size={20} /></StepNum>
            <StepTitle>Code & Deploy</StepTitle>
            <StepDesc>Write code in the editor, run it in the terminal, and preview output — all in your browser.</StepDesc>
          </StepCard>
        </StepsGrid>
      </Section>

      <Divider />

      {/* CTA */}
      <CTASection>
        <CTABox>
          <CTATitle>Ready to start coding?</CTATitle>
          <CTASub>Join CloudCode and spin up your first project in under 10 seconds.</CTASub>
          <AuthBtns>
            <GoogleBtn href="http://localhost:3003/auth/google">
              <FcGoogle size={20} /> Sign in with Google
            </GoogleBtn>
            <GitHubBtn href="http://localhost:3003/auth/github">
              <VscGithubInverted size={18} /> Sign in with GitHub
            </GitHubBtn>
          </AuthBtns>
        </CTABox>
      </CTASection>

      {/* Footer */}
      <FooterBar>
        <span>Built with <span style={{ color: '#f85149' }}>&hearts;</span> by CloudCode Team</span>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="#">GitHub</a>
          <a href="#">Docs</a>
          <a href="#">Privacy</a>
        </div>
      </FooterBar>
    </Page>
  );
};
