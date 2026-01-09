const vscode = require('vscode');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // console.log('Extension "psscriptanalyzer" is now active.');

    const diagnosticCollection = vscode.languages.createDiagnosticCollection('psscriptanalyzer');
    context.subscriptions.push(diagnosticCollection);

    async function getPowerShellPath() {
        const isWindows = process.platform === 'win32';
        if (isWindows) {
            try {
                await execAsync('pwsh --version');
                return 'pwsh';
            } catch {
                return 'powershell.exe';
            }
        } else {
            try {
                await execAsync('pwsh --version');
                return 'pwsh';
            } catch {
                return null; 
            }
        }
    }

    const runAnalysis = async (document) => {
        if (!document || document.languageId !== 'powershell') return;

        const shell = await getPowerShellPath();

        if (!shell) {
            vscode.window.showErrorMessage(
                "PowerShell Core (pwsh) was not found.",
                "Download pwsh"
            ).then(selection => {
                if (selection === "Download pwsh") {
                    vscode.env.openExternal(vscode.Uri.parse('https://github.com/PowerShell/PowerShell'));
                }
            });
            return;
        }

        const filePath = document.fileName;
        const psCommand = `Invoke-ScriptAnalyzer -Path '${filePath}' | ConvertTo-Json`;
        const fullCommand = `${shell} -NoProfile -NonInteractive -Command "${psCommand}"`;

        exec(fullCommand, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
            if (error || stderr) {
                if (stderr && stderr.includes('Invoke-ScriptAnalyzer')) {
                    showModuleMissingError();
                }
                return;
            }
            processResults(document, stdout, diagnosticCollection);
        });
    };

    // --- FIX: Add multiple listeners to handle the document lifecycle ---

    // 1. Trigger when a file is saved
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((document) => runAnalysis(document))
    );

    // 2. Trigger when a new PowerShell file is opened
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument((document) => runAnalysis(document))
    );

    // 3. Trigger when the user switches tabs (changes the active editor)
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                runAnalysis(editor.document);
            }
        })
    );

    // 4. Initial check: Trigger for the file that is already open when VS Code starts
    if (vscode.window.activeTextEditor) {
        runAnalysis(vscode.window.activeTextEditor.document);
    }
}

// ... (showModuleMissingError and processResults functions remain the same) ...

function showModuleMissingError() {
    vscode.window.showErrorMessage(
        "PSScriptAnalyzer module is not installed.",
        "Install Now"
    ).then(selection => {
        if (selection === "Install Now") {
            const terminal = vscode.window.createTerminal('Install PSScriptAnalyzer');
            terminal.show();
            terminal.sendText('Install-Module -Name PSScriptAnalyzer -Scope CurrentUser -Force');
        }
    });
}

function processResults(document, stdout, diagnosticCollection) {
    if (!stdout || stdout.trim() === "") {
        diagnosticCollection.set(document.uri, []);
        return;
    }

    try {
        const results = JSON.parse(stdout);
        const issues = Array.isArray(results) ? results : [results];

        const diagnostics = issues.map(issue => {
            const range = new vscode.Range(
                issue.Extent.StartLineNumber - 1, 
                issue.Extent.StartColumnNumber - 1,
                issue.Extent.EndLineNumber - 1, 
                issue.Extent.EndColumnNumber - 1
            );

            let severity = vscode.DiagnosticSeverity.Warning;
            if (issue.Severity === 'Error') {
                severity = vscode.DiagnosticSeverity.Error;
            } else if (issue.Severity === 'Information') {
                severity = vscode.DiagnosticSeverity.Information;
            }

            const diagnostic = new vscode.Diagnostic(
                range,
                `${issue.Message} [${issue.RuleName}]`,
                severity
            );

            diagnostic.source = 'PSScriptAnalyzer';
            return diagnostic;
        });

        diagnosticCollection.set(document.uri, diagnostics);

    } catch (e) {
        // console.error("Failed to parse JSON:", e);
        diagnosticCollection.set(document.uri, []);
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};