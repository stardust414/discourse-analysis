# W2 Windows 实机验证报告（外部用户试用记录）

更新日期：2026-11-04。**证据等级：External Windows runtime user validation。** 用户明确报告，固定 W1 EXE 已复制到另一台真实 Windows 电脑试用，实际运行正常。由此记录启动及整体试用通过；这不是 60 项专项全部通过，也不是本会话直接连接设备采集的结果。

## 版本与提交

- worktree：`<windows-worktree>`；分支 `windows-validation`。
- W1 commit：`d5376dbc5725cae9a08d03209ab23e756a08f003`，父提交为中文冻结版 `c02cf5be5ce69135ef617eb317e2b7362446f239`。
- W1 提交后工作区干净，再开始 W2。提交仅含已审核源码、测试、审计、报告和证据，未含 scratch、node_modules、二进制或浏览器缓存。
- 本次按明确授权先提交本 W2 实际记录与准备资料，再进入 W3。W2／W3 commit、最后 HEAD 与干净状态由 W3 交付清单记录。

## 事实来源及局限

[外部 Windows 用户试用记录](W2-evidence/外部Windows用户试用记录.json)保留陈述范围：

| 实际完成项目 | 状态 | 来源 |
| --- | --- | --- |
| EXE 在真实 Windows 电脑启动并运行 | 通过 | 由用户在外部 Windows 电脑实际运行验证 |
| 整体实际试用正常 | 通过 | 由用户在外部 Windows 电脑实际运行验证；具体功能操作未逐项记录 |

Windows 版本／build、CPU、启动耗时、userData、运行时 Electron API、DPI、IME、安全软件提示均未记录。没有收到截图或 PowerShell 采集结果，不补造数据。不写 Windows x64 runtime validated on external Windows hardware 或 native x64 hardware verified。

本机 Mac 没有 Windows 环境的早期调查仍然成立，但它不能否定用户后来在外部 Windows 完成的实际试用。[准备与环境检查](W2-evidence/准备与环境检查.json)、[交接核验](W2-evidence/交接核验.json)和 W2-handoff 是此前准备阶段的历史记录；其中 runtime=false 表示当时状态。60 项待填表保留“未验证”，不批量升级为通过。

## 保留的专项交接资料

[测试包](../../dist/Discourse-Analysis-3.3.1-zh-CN-W2-validation-kit.zip)、[手工清单](W2-handoff/W2-手工验证清单.md)、[使用方法](W2-handoff/README-W2.md)、[60 项模板](W2-handoff/W2-results-template.csv)、[包校验](W2-evidence/测试包校验.json)继续保留。它们可以用于以后补充专项，不是本次有限外部试用的已执行结果。

## 36 项答复

| 编号 | 问题 | 当前结果 |
| --- | --- | --- |
| 1 | 使用什么 Windows 环境？ | 由用户在另一台真实 Windows 电脑实际试用；本机 Mac 仍无 Windows 环境。证据等级为 External Windows runtime user validation。 |
| 2 | Windows 版本／build？ | Windows 10／11 及具体 build **未记录**。 |
| 3 | ARM 还是原生 x64？ | CPU／ARM／Intel／AMD／虚拟化细节 **未记录**；不能写 native x64 hardware verified。 |
| 4 | EXE 真正启动？ | **通过：由用户在外部 Windows 电脑实际运行验证。** |
| 5 | app version？ | 二进制文件资源和 package 为 3.3.1；运行时 app.getVersion() **未记录**，不以静态版本替代。 |
| 6 | Follow System？ | 整体试用正常，但 Follow System 未逐项记录，继续标为**未验证**。 |
| 7 | English？ | English 未逐项记录，**未验证**。 |
| 8 | 简体中文？ | 简体中文切换／重启专项未逐项记录，**未验证**。 |
| 9 | Windows menu？ | Windows 原生菜单专项未逐项记录，**未验证**。 |
| 10 | Ctrl 快捷键？ | Ctrl 组合及焦点专项未逐项记录，**未验证**。 |
| 11 | 微软拼音 IME？ | 微软拼音真实候选窗／Enter／Backspace 边界未逐项记录，**未验证**。 |
| 12 | 中文字体？ | 中文字体专项未逐项记录，**未验证**。 |
| 13 | Greek？ | Greek 专项未逐项记录，**未验证**。 |
| 14 | Hebrew／RTL？ | Hebrew／RTL 专项未逐项记录，**未验证**。 |
| 15 | Light／Dark？ | Light／Dark 专项未逐项记录，**未验证**。 |
| 16 | DPI 100%？ | Windows Display Scale 100% 专项未逐项记录，**未验证**。 |
| 17 | DPI 125%？ | Windows Display Scale 125% 专项未逐项记录，**未验证**。 |
| 18 | DPI 150%？ | Windows Display Scale 150% 专项未逐项记录，**未验证**。 |
| 19 | JSON？ | JSON 保存／关闭／重新打开专项未逐项记录，**未验证**。 |
| 20 | PNG？ | PNG 导出／查看／恢复专项未逐项记录，**未验证**。 |
| 21 | PDF？ | PDF 导出／查看／恢复专项未逐项记录，**未验证**。 |
| 22 | profile import／export？ | 个人方案导入／导出及 CON 名称专项未逐项记录，**未验证**。 |
| 23 | 中文／空格路径？ | 中文／空格／长路径／UNC 专项未逐项记录，**未验证**。 |
| 24 | Mac 项目在 Windows 打开？ | Mac 项目在 Windows 打开的专项未逐项记录，**未验证**。 |
| 25 | Windows 保存后 Mac 能打开？ | Windows 保存后回 Mac 冻结版专项未逐项记录，**未验证**。 |
| 26 | ESV／NASB／Greek／Hebrew？ | 各译本网络／fallback 专项未逐项记录，**未验证**；不能据整体试用列出服务成功名单。 |
| 27 | SmartScreen／Defender？ | SmartScreen／Unknown Publisher／Defender **未专项记录**；不假定有提示或无提示。 |
| 28 | W2 发现并修复什么？ | 没有收到实际 Windows blocker 报告；无 W2 应用修复。仅保存用户陈述、既有交接资料和更新报告。 |
| 29 | unit 最终多少？ | 沿用对应源码 W1 自动成绩 **351／351**；不是 Windows runtime 测试。 |
| 30 | E2E 最终多少？ | 沿用对应源码 W1 Mac browser 成绩 **109／109**；不是 Windows runtime 测试。 |
| 31 | i18n audit？ | 沿用 W1 通过结果 **600／600**；应用及字典未改。 |
| 32 | 当前 EXE SHA-256？ | `8b69136698e7bd29fc54f86971e5bfc4d37ac62f782a46131fea6d5df320b356`；原文件已重新核对一致，外部电脑单独哈希日志未提供。 |
| 33 | 改依赖／schema？ | 没有修改应用源码、依赖、lockfile、schema、profile 或专业术语。 |
| 34 | 工作区干净？ | W1 提交后干净进入 W2；本次已获明确授权提交 W2 实际记录与准备资料，提交完成状态见后续 W3 交付清单。 |
| 35 | 仍需 native x64 PC？ | 未确认 CPU，不能声明原生 x64 硬件通过；原生 x64 final smoke 及其他专项仍可补充，但按用户修订标准不作为此次个人／同学使用冻结的阻塞。 |
| 36 | 建议进入 W3？ | **按用户修订策略可以进入 W3**：仅冻结精确已试用二进制，不重新 build；未执行的专项保留未验证。 |

## Windows 实机已验证

**限用户陈述：启动正常、整体实际试用正常。** 仅关联固定 SHA-256 的 W1 原二进制；未逐项列出的操作不推断为通过。本会话没有直接执行 Windows 程序。

## Windows ARM x64-emulation 已验证

**未验证／环境架构未记录。** 不推断 Windows ARM 模拟或原生 Intel／AMD 硬件结果。

## 尚未专项验证

三种语言切换／重启、菜单、Ctrl、微软拼音边界、字体／原文／RTL、Light／Dark、Windows Display Scale 100／125／150%、JSON／PNG／PDF／profile 具体往返、中文／空格／长路径／UNC、Mac 往返、各网络服务、userData／临时目录、任务栏／窗口动作及安全软件提示仍保留未验证或未专项记录。

原版词内合并可能补空格、项目 JSON 不含当前本机 profile、Portable 不保证偏好跟随 EXE、大写 .JSON 命令行边界继续保留。不能为了补满清单而编造结果。

## 冻结结论

依用户最新修订标准，本次面向用户与同学使用，可按“精确二进制启动及整体试用正常、W1 自动回归通过、无已报告 Windows blocker、源码／schema／依赖／术语不变”的依据冻结。专项未覆盖不必冒充交付阻塞或全面认证。

W3 不重新构建，只把固定 W1 原 EXE 原字节复制／改名。当前无 Authenticode，SmartScreen／Defender 未专项记录；没有修改安全策略、签名、合并 local-cuv 或推送发布。
