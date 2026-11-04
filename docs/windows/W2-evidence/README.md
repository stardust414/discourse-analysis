# W2 证据说明

当前最新证据为 `外部Windows用户试用记录.json`：用户在外部真实 Windows 电脑实际运行固定 W1 EXE，报告启动及整体试用正常。证据等级为 **External Windows runtime user validation**。

没有收到 Windows 截图、PowerShell 输出、Windows build、CPU、DPI、IME 或安全软件专项记录。不得把整体正常扩写为 60 项通过，也不得推定原生 x64 硬件或 ARM 模拟通过。

早期文件继续原样保留：

- `准备与环境检查.json`：本机无 Windows 环境时的调查，以及 W1 提交与进入 W2 前干净状态。
- `测试包校验.json`：早期交接包 CRC、哈希、原 EXE 字节和 60 项模板。
- `fixture-provenance.json`：Mac 实际保存样例与合成 CON 方案来源。
- `交接核验.json`：准备阶段的校验；当时 runtime=false，不代表后来用户外部试用未发生。

W2-handoff 手册／模板及原交接 ZIP 是早期专项验证工具，尚未执行的项目保留未验证。本轮只更新文档和证据，不改 EXE、源码、依赖或安全策略。
