# Windows 本地化交付文档索引

当前冻结身份：Discourse Analysis 3.3.1 简体中文 Windows x64 Portable 本地化构建。只包含冻结中文实现和 W1 文件名兼容修复，不包含 local-cuv。

## 普通用户

- [Windows 中文使用说明](README-Windows-zh-CN.md)
- [正式 EXE](../../dist/final-windows-zh-CN/Discourse%20Analysis-3.3.1-zh-CN-win-x64-portable.exe)
- [SHA256SUMS](../../dist/final-windows-zh-CN/SHA256SUMS.txt)
- [交付清单及 W1／W2／W3 commit](../../dist/final-windows-zh-CN/交付清单.json)

## 审计、验证与冻结

- [W1 构建与平台审计报告](W1-Windows构建与平台审计报告.md)及[证据](W1-evidence/README.md)
- [W2 Windows 实机验证报告（外部用户试用记录）](W2-Windows实机验证报告.md)
- [外部 Windows 用户试用来源与范围](W2-evidence/外部Windows用户试用记录.json)
- [W3 最终交付报告](W3-Windows最终交付报告.md)及[冻结证据](W3-evidence/README.md)
- [v1.1 翻译规范](../zh-CN/中文界面翻译规范-v1.1.md)及[专业术语审核表](../zh-CN/专业术语审核表-v1.1.md)
- [Mac 中文冻结阶段报告与维护资料](../zh-CN/交付文档索引.md)

## 未覆盖专项的补充工具

- [早期 W2 交接手册](W2-handoff/README-W2.md)
- [专项手工清单](W2-handoff/W2-手工验证清单.md)及[60 项未执行模板](W2-handoff/W2-results-template.csv)
- [原 W2 测试 ZIP](../../dist/Discourse-Analysis-3.3.1-zh-CN-W2-validation-kit.zip)

上述交接手册与 ZIP 保留早期“本机无 Windows、待测试”的准备状态；当前已收到有限的外部真实 Windows 用户试用记录，以更新后的 W2／W3 报告为准。模板和采集脚本没有被改写成已执行结果。

## 提交记录

- W1：`d5376dbc5725cae9a08d03209ab23e756a08f003`
- W2：`04285af02768689939bcccaf711afc7687c2e19e`
- W3：本索引及报告的冻结文档提交，提交完成后记录于[交付清单](../../dist/final-windows-zh-CN/交付清单.json)的 `w3Commit`，最终 Git HEAD 与其一致。

二进制不进入 Git；最终目录是原 W1 已试用文件的字节副本，不是重新构建。源码一旦更改，须新建修订、新构建并重新进行真实 Windows 验证。当前分支冻结停止，没有 push、Release 或 PR。
