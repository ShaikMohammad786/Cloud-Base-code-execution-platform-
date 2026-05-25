import { useEffect, useMemo } from "react";
import Sidebar from "./external/editor/components/sidebar";
import { Code } from "./external/editor/editor/code";
import styled from "@emotion/styled";
import { File, buildFileTree, RemoteFile } from "./external/editor/utils/file-manager";
import { FileTree } from "./external/editor/components/file-tree";
import { Socket } from "socket.io-client";

export const Editor = ({
  files,
  onSelect,
  selectedFile,
  socket
}: {
  files: RemoteFile[];
  onSelect: (file: File) => void;
  selectedFile: File | undefined;
  socket: Socket;
}) => {
  const rootDir = useMemo(() => {
    return buildFileTree(files);
  }, [files]);

  useEffect(() => {
    if (!selectedFile && rootDir.files && rootDir.files.length > 0) {
      onSelect(rootDir.files[0])
    }
  }, [selectedFile, rootDir])

  return (
    <Container>
      <SidebarContainer>
        <Sidebar>
          <FileTree
            rootDir={rootDir}
            selectedFile={selectedFile}
            onSelect={onSelect}
          />
        </Sidebar>
      </SidebarContainer>
      <EditorArea>
        <Code socket={socket} selectedFile={selectedFile} />
      </EditorArea>
    </Container>
  );
};

// Styled components consistent with the new theme
const Container = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  background-color: var(--bg-primary);
`;

const SidebarContainer = styled.div`
  width: 250px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
`;

const EditorArea = styled.div`
  flex: 1;
  overflow: hidden;
  background-color: var(--bg-primary);
`;