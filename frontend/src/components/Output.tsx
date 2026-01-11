import { useSearchParams } from "react-router-dom";
import styled from '@emotion/styled';
import { BiWindow } from 'react-icons/bi';

const Container = styled.div`
  height: 40vh;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const IFrameWrapper = styled.div`
  flex: 1;
  background: white; /* Content inside iframe is usually light */
  position: relative;
`;

export const Output = () => {
    const [searchParams] = useSearchParams();
    const replId = searchParams.get('replId') ?? '';
    const INSTANCE_URI = `http://${replId}.cloudcodeterminal.work.gd`;

    return (
        <Container>
            <Header>
                <BiWindow />
                <span>Web Preview</span>
            </Header>
            <IFrameWrapper>
                <iframe
                    width={"100%"}
                    height={"100%"}
                    src={`${INSTANCE_URI}`}
                    style={{ border: 'none' }}
                    title="Output"
                />
            </IFrameWrapper>
        </Container>
    );
}