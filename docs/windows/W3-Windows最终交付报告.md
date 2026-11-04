# W3 Windows 最终交付报告

日期：2026-11-04。分支：`windows-validation`。按用户修订策略，冻结**已经外部真实 Windows 试用的精确 W1 二进制**，不重新构建。面向用户与同学使用，不作为 Windows 全平台认证。

## 版本身份与提交

产品为 **Discourse Analysis 3.3.1 简体中文 Windows x64 Portable 本地化构建**。内部版本保持 3.3.1，不是上游新官方版本；上游基线 `98da0241c38eef936be0f06cf736aa607dda0b62`，中文冻结基线 `c02cf5be5ce69135ef617eb317e2b7362446f239`，术语 v1.1。

| 提交／状态 | 记录 |
| --- | --- |
| W1 | `d5376dbc5725cae9a08d03209ab23e756a08f003` |
| W2 | `04285af02768689939bcccaf711afc7687c2e19e` |
| W3 | 本报告及冻结文档的提交；提交后读取最终 HEAD，写入[交付清单](../../dist/final-windows-zh-CN/交付清单.json)的 `w3Commit` |
| 分支 | `windows-validation` |
| 工作区 | W2 提交后干净；W3 文档提交后再次核对干净，最终状态在交付清单中记录 |

W2／W3 没有修改 JS、HTML、CSS、i18n、package.json、lockfile、Electron 配置、测试、schema 或专业术语。41 个应用文件逐一核对仍等于已测 W1 清单。没有读取、合并或包含 feature/local-cuv 的离线新标点和合本。

## 正式二进制

目录：`dist/final-windows-zh-CN/`

文件：[Discourse Analysis-3.3.1-zh-CN-win-x64-portable.exe](../../dist/final-windows-zh-CN/Discourse%20Analysis-3.3.1-zh-CN-win-x64-portable.exe)

大小：**69,657,199 bytes**。SHA-256：

```text
8b69136698e7bd29fc54f86971e5bfc4d37ac62f782a46131fea6d5df320b356
```

源文件为 W1 的 `Discourse Analysis 3.3.1 x64 Portable.exe`。复制前重新算哈希，复制后比较全部字节并重新算哈希，源／目标完全相同。只改变交付文件名，未运行 electron-builder，也未重写 EXE 资源或时间戳字段。原 W1 EXE、证据及 W2 交接 ZIP 均保留。

用户外部试用使用 W1 原文件名；正式改名文件没有另在 Windows 重测。冻结所依赖的是用户已确认的同一精确文件内容，不能把结论扩展到以后任意同源码重建的新 EXE。

## 自动验证

本次再次在 **macOS** 执行最终仓库检查，不是 Windows runtime：

| 检查 | 结果 | 证据 |
| --- | --- | --- |
| npm run check | 通过，含 lint／typecheck | [日志](W3-evidence/check-final.log) |
| unit | **351／351**，无失败、无跳过 | 同上，保留 W1 全部覆盖 |
| browser E2E | **109／109** | [日志](W3-evidence/e2e-final.log)，独立 worktree／端口 |
| i18n audit | 通过，**600 English／600 zh-CN**，无问题 | [audit](W3-evidence/audit-final.json) |

没有用自动测试代替微软拼音候选窗、Windows Display Scale 或系统对话框检查。

## 构建验证

沿用 W1 对**同一哈希文件**完成的核验，并在 W3 再确认其二进制身份：

- 内部实际应用是 **PE32+ x86-64**；外层为原打包器的 **PE32 i386 NSIS Portable 启动器**，不混称外层 PE64。
- package 与 PE 版本资源对应 3.3.1；四段数字资源 3.3.1.0 是 Windows 版本表示，未升级应用版本。
- W1 从 EXE 提取的 73 个封装文件与构建目录一致，app.asar 中 41 个应用文件与源码一致，图标正确，必需 i18n／HTML／JS 资源齐全。
- 内嵌 7z 完整性检查无警告通过；外层 NSIS 封装尾部提示与检查边界已在 W1 解释，不夸大为签名认证。
- W3 不构建新包；复制后 SHA-256 和全字节一致性验证通过。见[复制记录](W3-evidence/binary-copy-verification.json)及[冻结验证](W3-evidence/冻结验证.json)。

详情保留在 [W1 报告](W1-Windows构建与平台审计报告.md)及其证据，未覆盖历史文件。

## 外部真实 Windows 运行验证

证据等级：**External Windows runtime user validation**。

| 用户实际报告的操作 | 结果 | 证据来源 |
| --- | --- | --- |
| 在另一台真实 Windows 电脑启动并运行 W1 EXE | 通过 | 由用户在外部 Windows 电脑实际运行验证 |
| 整体实际试用正常 | 通过 | 用户反馈；具体功能操作没有逐项记录 |

记录见 [W2 更新报告](W2-Windows实机验证报告.md)和[外部用户陈述](W2-evidence/外部Windows用户试用记录.json)。用户将已试用文件指定为固定 W1 哈希；本机会话重新计算原文件并确认一致。没有外部电脑的单独哈希日志、截图或 PowerShell 采集结果。

Windows 10／11、具体 build、CPU／Intel／AMD／ARM、虚拟化细节均为**未记录**。本会话没有直接连接外部电脑，不写 native x64 hardware verified，也不写 Windows ARM x64-emulation verified。

## 未专项验证

下列内容没有逐项实际结果，继续列入已知未覆盖范围，不将整体试用正常扩写为全部通过：

- Windows Display Scale 100／125／150% 的完整窗口矩阵。
- 所有微软拼音组合输入边界、Ctrl／焦点、三种语言及原生菜单细项。
- 中文／Greek／Hebrew／RTL 的字体、编辑、主题、长双语布局专项。
- JSON／PNG／PDF／个人方案的逐项导出恢复与 Mac 往返；所有目录、中文空格、长路径、UNC、OneDrive、大小写扩展名。
- 各译本服务与 fallback、所有 Windows build、任务栏／窗口动作细项、实际 userData 与 Electron API 值。
- SmartScreen／Unknown Publisher／Defender 和其他安全软件行为：**未专项记录**，不假定有提示或无提示。

60 项专项模板维持未验证；额外的外部整体试用记录单独保存，不伪造收集脚本或截图。原生 x64 PC 的详细补验仍有价值，但按本次面向用户／同学使用的修订标准，不作为冻结阻塞。

## 签名与已知限制

EXE 仍为 **unsigned、无 Authenticode、未做 Windows code signing**。没有自签名、使用第三方证书或修改 Windows 安全策略。SmartScreen reputation 不保证充足，但具体外部试用中的提示未记录。

原版词内合并可能补空格、宽图表需滚动、不新增中文书卷输入、Portable 不保证偏好随 EXE 移动、部分系统／第三方文字和网络服务边界继续保留。个人方案沿用独立导入导出；项目 schema、IDs、经文及用户内容没有更改。

原版权、产品名称、经文及 profile attribution 保留；不是重品牌化或各作者官方中译。完整使用说明见 [Windows README](README-Windows-zh-CN.md)。

## 冻结结论与维护边界

按用户明确接受的范围：精确 EXE 已在外部真实 Windows 启动和整体试用正常，W1 及最终自动回归通过，没有已报告 Windows blocker，应用源码／schema／依赖／术语不变，**本次可以冻结交付**。这不表示所有潜在 Windows 问题均不存在。

Windows 最终目录提供 EXE、SHA256SUMS、说明、报告及提交清单。EXE／ZIP／dist／scratch 不入 Git；只提交 W2／W3 文档、清单和脱敏记录。

W3 提交后核对 HEAD 与工作区，写入交付清单并冻结 `windows-validation`，停止修改。后续若必须改应用源码，应另行修订、构建并再次交真实 Windows 测试；旧哈希文件的 runtime 结果不自动继承。

没有 push、Release、PR、GitHub Actions、Windows 签名、Setup 或合并 local-cuv。交付文档见 [Windows 索引](README.md)。
