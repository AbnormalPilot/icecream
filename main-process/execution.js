const { ipcMain } = require('electron');
const vm = require('vm');
const path = require('path');
const { spawn } = require('child_process');
const { WORKSPACE_DIR } = require('./files');

function registerExecutionHandlers() {
    // JS Code Execution Handler
    ipcMain.handle('run-code', async (event, code) => {
        try {
            const logs = [];
            const customConsole = {
                log: (...args) => {
                    logs.push({ type: 'log', message: args.map(String).join(' ') });
                },
                error: (...args) => {
                    logs.push({ type: 'error', message: args.map(String).join(' ') });
                },
                warn: (...args) => {
                    logs.push({ type: 'warn', message: args.map(String).join(' ') });
                },
                info: (...args) => {
                    logs.push({ type: 'info', message: args.map(String).join(' ') });
                }
            };

            const context = vm.createContext({
                console: customConsole,
                setTimeout,
                setInterval,
                clearTimeout,
                clearInterval,
                Buffer,
                process: {
                    env: {}
                }
            });

            try {
                const script = new vm.Script(code);
                const result = script.runInContext(context, { timeout: 1000 });

                if (result !== undefined) {
                    logs.push({ type: 'result', message: String(result) });
                }

                return { success: true, logs };

            } catch (err) {
                return {
                    success: false,
                    error: err.toString(),
                    logs
                };
            }

        } catch (err) {
            return { success: false, error: "System Error: " + err.message, logs: [] };
        }
    });

    // Python Code Execution Handler
    ipcMain.handle('run-python', async (event, { code, input }) => {
        return new Promise((resolve) => {
            const logs = [];
            const tempFile = path.join(WORKSPACE_DIR, '_temp_run.py');

            // Write code to temp file
            require('fs').writeFileSync(tempFile, code, 'utf-8');

            // Spawn Python process
            // Note: Verify 'python3' availability on user system in production
            const python = spawn('python3', [tempFile]);
            let stdout = '';
            let stderr = '';

            // Send input if provided
            if (input) {
                python.stdin.write(input);
                python.stdin.end();
            } else {
                python.stdin.end();
            }

            python.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            python.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            python.on('close', (exitCode) => {
                // Clean up temp file
                try { require('fs').unlinkSync(tempFile); } catch (e) { }

                // Parse output
                if (stdout) {
                    stdout.split('\n').forEach(line => {
                        if (line.trim()) logs.push({ type: 'log', message: line });
                    });
                }

                if (stderr) {
                    stderr.split('\n').forEach(line => {
                        if (line.trim()) logs.push({ type: 'error', message: line });
                    });
                }

                resolve({
                    success: exitCode === 0,
                    logs,
                    error: exitCode !== 0 ? stderr : null
                });
            });

            python.on('error', (err) => {
                resolve({
                    success: false,
                    logs: [],
                    error: 'Failed to start Python: ' + err.message
                });
            });

            // Timeout after 30 seconds
            setTimeout(() => {
                python.kill();
                resolve({
                    success: false,
                    logs,
                    error: 'Execution timed out (30s limit)'
                });
            }, 30000);
        });
    });
}

module.exports = { registerExecutionHandlers };
