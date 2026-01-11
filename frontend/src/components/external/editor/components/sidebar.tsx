import { ReactNode } from 'react';
import styled from "@emotion/styled";

export const Sidebar = ({ children }: { children: ReactNode }) => {
  return (
    <Aside>
      {children}
    </Aside>
  )
}

const Aside = styled.aside`
  width: 100%;
  height: 100%;
  background-color: var(--bg-secondary);
  padding-top: 3px;
`

export default Sidebar
