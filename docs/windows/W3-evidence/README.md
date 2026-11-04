# W3 冻结证据

本阶段**没有运行 electron-builder**。交付的是 W1 原 EXE 的原字节改名副本。

- `binary-copy-verification.json`：复制前后路径、字节数、SHA-256、全字节相同、未重建，以及 W3 开始时干净状态。
- `check-final.log`、`e2e-final.log`、`audit-final.json`：W3 在 Mac 再运行的 351 unit／109 browser E2E／600 对 600 字典核验；不是 Windows runtime。
- `冻结验证.json`：W1／W2 提交、41 个文件匹配、自动成绩、W1 同哈希构建核验、有限外部用户试用及未覆盖范围。
- `SHA256SUMS.txt`：正式名称对应的 EXE 哈希，仍是 W1／用户试用文件的固定值。

外部真实 Windows 证据只包括用户明确报告的启动与整体试用正常，见 `../W2-evidence/外部Windows用户试用记录.json`。环境版本／CPU／安全提示等未知项不补造。

W3 commit 和提交后干净 Git 状态在提交完成后读取，保存于本机 `dist/final-windows-zh-CN/交付清单.json`。最终目录另存一份含完整提交记录的报告。应用二进制、dist、scratch 不进入 Git，历史 W1 产物和证据保留。
