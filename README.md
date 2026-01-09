# PSScriptAnalyzer for VS Code

**Maintain high-quality, secure, and idiomatic PowerShell code with ease.**

This extension integrates the industry-standard `PSScriptAnalyzer` module directly into your VS Code workflow. It provides instantaneous feedback on your scripts, helping you catch potential bugs, security vulnerabilities, and best-practice violations as you write.



## 🚀 Key Features
* **Real-time Linting:** Get instant diagnostic highlights (squiggly lines) for code quality issues.
* **Seamless Automation:** Analysis triggers automatically on file open, tab switch, and save—no manual commands required.
* **Cross-Platform Support:** Intelligent shell detection for both Windows PowerShell 5.1 and PowerShell Core (pwsh).
* **Smart Onboarding:** Automatically detects if the required module is missing and provides a one-click installation terminal.

## 📖 How to Use
1. Open any `.ps1` or `.psm1` file.
2. The extension will automatically run in the background.
3. If errors or warnings are found, they will appear in the **Problems** panel ($Ctrl+Shift+M$) and as highlights in your code.
4. Hover over the highlighted code to see the specific PSScriptAnalyzer rule violation.

## 🛠 Prerequisites
* **PowerShell:** Windows PowerShell 5.1 or PowerShell Core 7.0+.
* **Module:** `PSScriptAnalyzer` (the extension will offer to install this for you if it's missing).

---
**Developed by Prakash**
🌐 [PowerShell Universe Blog](https://prakash78blog.wordpress.com/) | 📁 [GitHub Profile](https://github.com/prax78)