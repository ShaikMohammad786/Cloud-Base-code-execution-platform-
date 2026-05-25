//@ts-ignore 
import { fork, IPty } from 'node-pty';
import { v4 as uuidv4 } from 'uuid';

const SHELL = "bash";

interface TerminalSession {
    terminal: IPty;
    socketId: string;
    replId: string;
}

export class TerminalManager {
    private sessions: Map<string, TerminalSession> = new Map();

    createPty(
        socketId: string,
        replId: string,
        onData: (data: string, terminalId: string) => void
    ): string {
        const terminalId = uuidv4();
        let term = fork(SHELL, [], {
            cols: 200,
            name: 'xterm',
            cwd: `/workspace`
        });

        term.on('data', (data: string) => onData(data, terminalId));
        
        this.sessions.set(terminalId, {
            terminal: term,
            socketId,
            replId
        });

        term.on('exit', () => {
            this.sessions.delete(terminalId);
        });

        console.log(`Terminal created: ${terminalId} for socket ${socketId}`);
        return terminalId;
    }

    write(terminalId: string, data: string) {
        const session = this.sessions.get(terminalId);
        if (session) {
            session.terminal.write(data);
        }
    }

    close(terminalId: string) {
        const session = this.sessions.get(terminalId);
        if (session) {
            session.terminal.kill();
            this.sessions.delete(terminalId);
            console.log(`Terminal closed: ${terminalId}`);
        }
    }

    list(socketId: string): string[] {
        const terminals: string[] = [];
        this.sessions.forEach((session, id) => {
            if (session.socketId === socketId) {
                terminals.push(id);
            }
        });
        return terminals;
    }

    clearAll(socketId: string) {
        this.sessions.forEach((session, id) => {
            if (session.socketId === socketId) {
                session.terminal.kill();
                this.sessions.delete(id);
            }
        });
    }

    // Get first terminal for backward compatibility
    getFirst(socketId: string): string | undefined {
        for (const [id, session] of this.sessions) {
            if (session.socketId === socketId) return id;
        }
        return undefined;
    }
}
