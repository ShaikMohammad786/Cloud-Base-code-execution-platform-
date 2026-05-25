import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { saveToS3 } from "./aws";
import path from "path";
import { exec } from "child_process";
import { fetchDir, fetchFileContent, saveFile, createFile, createFolder, deleteItem, renameItem } from "./fs";
import { TerminalManager } from "./pty";

const terminalManager = new TerminalManager();

export function initWs(httpServer: HttpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
      
    io.on("connection", async (socket) => {
        const host = socket.handshake.headers.host;
        console.log(`host is ${host}`);
        const replId = host?.split('.')[0];
    
        if (!replId) {
            socket.disconnect();
            terminalManager.clearAll(socket.id);
            return;
        }

        socket.emit("loaded", {
            rootContent: await fetchDir("/workspace", "")
        });

        initHandlers(socket, replId);
    });
}

function initHandlers(socket: Socket, replId: string) {

    socket.on("disconnect", () => {
        console.log("user disconnected");
        terminalManager.clearAll(socket.id);
    });

    // === Existing File Events ===

    socket.on("fetchDir", async (dir: string, callback) => {
        const dirPath = `/workspace/${dir}`;
        const contents = await fetchDir(dirPath, dir);
        callback(contents);
    });

    socket.on("fetchContent", async ({ path: filePath }: { path: string }, callback) => {
        const fullPath = `/workspace/${filePath}`;
        const data = await fetchFileContent(fullPath);
        callback(data);
    });

    socket.on("updateContent", async ({ path: filePath, content }: { path: string, content: string }) => {
        const fullPath = `/workspace/${filePath}`;
        await saveFile(fullPath, content);
        await saveToS3(`code/${replId}`, filePath, content);
    });

    // === New File Operations ===

    socket.on("createFile", async ({ path: filePath, content }: { path: string, content: string }, callback) => {
        try {
            const fullPath = `/workspace/${filePath}`;
            await createFile(fullPath, content || '');
            await saveToS3(`code/${replId}`, filePath, content || '');
            // Refresh file tree
            const rootContent = await fetchDir("/workspace", "");
            socket.emit("loaded", { rootContent });
            if (callback) callback({ success: true });
        } catch (err: any) {
            if (callback) callback({ success: false, error: err.message });
        }
    });

    socket.on("createFolder", async ({ path: dirPath }: { path: string }, callback) => {
        try {
            const fullPath = `/workspace/${dirPath}`;
            await createFolder(fullPath);
            const rootContent = await fetchDir("/workspace", "");
            socket.emit("loaded", { rootContent });
            if (callback) callback({ success: true });
        } catch (err: any) {
            if (callback) callback({ success: false, error: err.message });
        }
    });

    socket.on("deleteItem", async ({ path: itemPath }: { path: string }, callback) => {
        try {
            const fullPath = `/workspace/${itemPath}`;
            await deleteItem(fullPath);
            const rootContent = await fetchDir("/workspace", "");
            socket.emit("loaded", { rootContent });
            if (callback) callback({ success: true });
        } catch (err: any) {
            if (callback) callback({ success: false, error: err.message });
        }
    });

    socket.on("renameItem", async ({ oldPath, newPath }: { oldPath: string, newPath: string }, callback) => {
        try {
            const fullOld = `/workspace/${oldPath}`;
            const fullNew = `/workspace/${newPath}`;
            await renameItem(fullOld, fullNew);
            const rootContent = await fetchDir("/workspace", "");
            socket.emit("loaded", { rootContent });
            if (callback) callback({ success: true });
        } catch (err: any) {
            if (callback) callback({ success: false, error: err.message });
        }
    });

    // === GitHub Clone ===

    socket.on("gitClone", async ({ repoUrl }: { repoUrl: string }, callback) => {
        try {
            exec(
                `git clone ${repoUrl} /tmp/repo && cp -r /tmp/repo/* /workspace/ && rm -rf /tmp/repo`,
                { timeout: 60000 },
                async (err, stdout, stderr) => {
                    if (err) {
                        if (callback) callback({ success: false, error: stderr || err.message });
                        return;
                    }
                    const rootContent = await fetchDir("/workspace", "");
                    socket.emit("loaded", { rootContent });
                    if (callback) callback({ success: true, output: stdout });
                }
            );
        } catch (err: any) {
            if (callback) callback({ success: false, error: err.message });
        }
    });

    // === Multi-Terminal ===

    socket.on("requestTerminal", async () => {
        const terminalId = terminalManager.createPty(socket.id, replId, (data, termId) => {
            socket.emit('terminal', {
                data: Buffer.from(data, "utf-8"),
                terminalId: termId
            });
        });
        socket.emit('terminalCreated', { terminalId });
    });

    socket.on("createTerminal", async (_, callback) => {
        const terminalId = terminalManager.createPty(socket.id, replId, (data, termId) => {
            socket.emit('terminal', {
                data: Buffer.from(data, "utf-8"),
                terminalId: termId
            });
        });
        if (callback) callback({ terminalId });
    });

    socket.on("terminalData", async ({ data, terminalId }: { data: string, terminalId?: string }) => {
        if (terminalId) {
            terminalManager.write(terminalId, data);
        } else {
            // Backward compatibility: write to first terminal
            const firstTerm = terminalManager.getFirst(socket.id);
            if (firstTerm) terminalManager.write(firstTerm, data);
        }
    });

    socket.on("closeTerminal", async ({ terminalId }: { terminalId: string }) => {
        terminalManager.close(terminalId);
    });

    socket.on("listTerminals", async (_, callback) => {
        const terminals = terminalManager.list(socket.id);
        if (callback) callback(terminals);
    });
}