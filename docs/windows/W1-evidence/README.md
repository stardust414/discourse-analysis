# W1 证据说明

这些证据来自独立的 `Discourse-Analysis-windows` worktree，起点 `c02cf5be5ce69135ef617eb317e2b7362446f239`。不依赖另一会话的 feature/local-cuv 源码。

- `验证汇总.json`：产物大小／SHA-256、全部封装文件、41 个应用文件的 SHA-256、冻结差异、351／109 结果、环境及 buildVerified／windowsRuntimeVerified。
- `platform-audit.json`：构建配置与路径、文件、快捷键、IME、字体／DPI／主题等静态审计。
- `worktree-preflight.json`、`worktrees-after.json`：创建前及结束时 Git 元数据。原目录并行开发时 HEAD 可继续前进，不能据此把它重置回旧状态。
- `check-final.log`、`e2e-final.log`、`audit-final.json`：最终完整回归。所有测试执行于新 worktree；E2E 端口 18876，reuseExistingServer 为 false。
- `dependencies.log`：按原 lockfile 从 npm 缓存建立独立 node_modules；`browser-install.log` 为匹配原 Playwright 的独立 Mac 浏览器下载。
- `build-win.log`：原 Windows portable 构建命令的完整诊断，包含缓存 Wine／rcedit、图标与 NSIS 过程，无签名。
- `exe-inventory.log`／`exe-integrity.log`：外层 Portable 可读内嵌压缩包，但有 NSIS 尾部数据提示；`payload-integrity.log` 为单独取出的内嵌 7z 完整性检查，无警告。
- `pe-inspection.json`：外层 i386 NSIS 启动器与内部 x86-64 Electron 应用、版本、图标及空 Authenticode 表；不代表运行测试。
- `source-changes.patch`：本轮应用和 audit 的已跟踪源码补丁；新增测试和 W1 快照另见 worktree 文件。
- `inspect-pe.py`／`verify-package.cjs`：实际核验脚本留档，原执行位置为仓库根目录下 `scratch/w1/`。需先按报告构建并提取文件，复制回原位置后运行；不要直接在证据目录运行带相对路径的脚本。
- `playwright-isolated.config.cjs`：实际运行配置留档，原位置 `scratch/w1/playwright.config.cjs`。它沿用全部原测试，仅将服务路径与端口隔离；没有伪造 Windows 操作系统。

浏览器首轮新增测试曾等待网页原生 Save picker。后来明确模拟“无该网页接口”的桌面下载分支，并重跑完整套件通过。核验器只处理 PE／资源／文件内容，不执行交付 EXE。所有测试 userData、解压文件、浏览器缓存和测试导出都留在 scratch，不进入产物。

本地提交由仓库 CLAUDE.md 约束，本轮没有擅自 commit。最终报告如实标记未提交状态。W1 只证明可构建；Windows 实机、SmartScreen／杀毒、系统 DPI、IME、系统对话框等全部留待 W2。
