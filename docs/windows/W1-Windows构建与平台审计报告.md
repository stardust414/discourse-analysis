# W1：Windows 构建与平台审计报告

日期：2026-11-04。阶段范围仅为 **W1**。结论：**Build verified；Windows runtime 尚未验证**。已生成可供 W2 使用的 Windows x64 Portable 测试产物，没有进入 W2。

## 1. Windows 分支和 worktree 在哪里？

- worktree：`<windows-worktree>`
- 分支：`windows-validation`
- HEAD：`c02cf5be5ce69135ef617eb317e2b7362446f239`；本轮修改暂未提交，具体原因见第 24 项。

原目录 `<zh-cn-worktree>` 仍由另一会话使用。创建前确认它位于 `feature/local-cuv`，且有未提交工作。本任务没有在原目录执行 checkout、switch、reset、clean 或写入源码。

## 2. 是否确认从指定冻结 commit 创建？

是。先只读检查 Git 状态、分支、HEAD、worktree 和指定 commit；确认目标目录及 Windows 分支不存在后，执行：

```sh
git worktree add <windows-worktree> \
  -b windows-validation c02cf5be5ce69135ef617eb317e2b7362446f239
```

创建后新 worktree 的 HEAD 精确一致，工作区干净；原目录的分支、HEAD 与状态在创建前后相同。证据见 [创建前记录](W1-evidence/worktree-preflight.json)。固定上游仍是 3.3.1 / `98da0241c38eef936be0f06cf736aa607dda0b62`，术语为 v1.1。

## 3. 是否完全没有触碰 feature/local-cuv？

没有读取、合并或修改该分支的功能源码，没有复制原目录未提交源码。本轮只在原目录读取了用户授权的 Git 元数据。另一会话继续开发导致其 HEAD／状态随后变化，这是并行工作状态；本任务没有把它切回旧 HEAD。

依赖在新 worktree 内按冻结 lockfile 用 `npm ci --offline --no-audit --no-fund` 独立建立，没有链接原目录 node_modules；浏览器下载到新 worktree 自己的 scratch，E2E 使用独立端口 18876 且禁止复用已有服务器。这样不会误连另一会话的应用页面。

`codex/zh-cn-i18n` 引用仍为指定冻结 commit。[结束时元数据](W1-evidence/worktrees-after.json)记录两个 worktree 的路径、分支、HEAD 与 Git 状态。

## 4. 当前 Windows target 是什么？

原配置已支持 **Windows x64 Portable**：

| 配置 | 当前值 |
| --- | --- |
| 原命令 | `npm run build:win` → `electron-builder --win --x64` |
| target | `portable`，不是 Setup 安装器 |
| architecture | x64 |
| appId | `com.discourseanalysis.app` |
| productName | Discourse Analysis |
| 内部应用版本 | 3.3.1 |
| Windows 图标 | `build/icon.png`，builder 转成 ICO 并写入 PE 资源 |
| artifactName | `${productName} ${version} ${arch} Portable.${ext}` |
| files 白名单 | index.html、styles.css、app.js、main.js、preload.js、js/** |
| extraResources | 未配置；本轮不新增离线经文或其他资源 |

`build.sh` 是开发用的 macOS／POSIX shell 脚本，会运行 npm install；本轮直接使用原 npm 命令，避免它重新解析依赖。它不是 Windows 应用的运行时依赖。

## 5. 是否成功生成 Windows x64 Portable？

是。实际执行：

```sh
DEBUG=electron-builder npm run build:win -- \
  --config.directories.output=dist/w1-win-x64
```

只指定独立输出目录和构建诊断日志，没有改变 target、版本、打包技术或签名设置。[构建日志](W1-evidence/build-win.log)记录成功完成。

## 6. 是否生成 NSIS？

没有另行生成 **NSIS Setup 安装器**。原配置没有安装范围、卸载及更新方案，本轮优先完成 Portable，没有增加安装器相关行为。

Portable 本身使用原 electron-builder 的 NSIS 自解压启动器，因此日志会出现 makensis、NSIS 和内嵌 7z；这不表示额外生成了安装版 Setup。

## 7. 产物文件名？

`Discourse Analysis 3.3.1 x64 Portable.exe`

[打开测试 EXE](../../dist/w1-win-x64/Discourse%20Analysis%203.3.1%20x64%20Portable.exe)。它位于 Windows worktree 的 `dist/w1-win-x64/`，保留本阶段允许的默认名称，属于待 W2 验证的测试构建。

## 8. 文件大小？

**69,657,199 bytes**，约 66.43 MiB。

## 9. SHA-256？

```text
8b69136698e7bd29fc54f86971e5bfc4d37ac62f782a46131fea6d5df320b356
```

输出目录另有 SHA256SUMS.txt。[验证汇总](W1-evidence/验证汇总.json)包含产物路径、大小、哈希和每个应用文件的 SHA-256。

## 10. 是否确认 PE x64？

**实际应用是 PE32+ x86-64（Machine 0x8664）。** 外层 Portable 是原打包器生成的 **PE32 i386 NSIS 启动器（0x14c）**，其内部封装并启动 x64 应用。不能把外层也说成 PE64，或仅凭文件名判断架构。

已直接从最终 EXE 提取 73 个封装文件，与 win-unpacked 全部逐字节比较一致；再核对 app.asar 的 41 个应用源码／资源和 package.json，均与本轮已测工作文件一致。没有混入 tests、scratch、个人资料或另一功能分支内容。

外层与内部 PE 版本资源、应用 package 元数据均为 3.3.1；Windows 固定数字资源中的四段式 `3.3.1.0` 是原 builder 的版本表示。实际图标数据与配置生成的 ICO 图像一致。[PE 记录](W1-evidence/pe-inspection.json)包含这些结果；运行时 app.getVersion 等值仍需 W2 再确认。

7-Zip 检查外层时能读到内部 7z，提示“archive 后还有数据”；这里是自解压封装的尾部数据，不直接作为损坏结论。单独截取该完整 7z 后，完整性检查 **Everything is Ok、无警告**，并完成上述全部文件比较。Portable 模板原本关闭 NSIS CRCCheck，本轮未改变；因此不把这些检查夸大为整个启动器的签名认证或 Windows 运行验证。原始[封装检查](W1-evidence/exe-integrity.log)、[内部数据检查](W1-evidence/payload-integrity.log)均保留。

## 11. Windows build 是否需要 Wine？

本机的实际构建使用了已有缓存 `wine-4.0.1-mac`，执行 `rcedit-x64.exe` 写入图标和版本资源。缓存的 winCodeSign 工具目录、NSIS 和 Electron 28.3.3 win32-x64 也被复用。

没有新装或升级 Wine／Electron／electron-builder。Wine 只是 macOS 打包时的辅助工具；没有用 Wine 启动本应用来声称通过 Windows 实机。winCodeSign 目录名也不表示执行过代码签名，本轮无签名凭据，外层与内部 EXE 的 Authenticode 表均为空。

## 12. 是否发现 macOS-only 代码？

`main.js` 有原来的 macOS `open-file`／`activate` 生命周期处理，同时有 Windows／Linux 的命令行 JSON 路径处理。它们不构成“应用只能在 Mac 上运行”的 API 依赖。

原生菜单翻译器读取现有 Electron 菜单并保留 role／动作／accelerator，没有主动安装一套 Mac 菜单到 Windows。开发模式 DevTools、菜单缩放／全屏等使用 Electron 原有机制。Windows 的实际菜单结构和快捷键行为留 W2。

## 13. 是否发现路径问题？

没有发现运行时硬编码 `/Users/...` 或按 POSIX 分隔符拼装本地文件的代码。main 使用 `path.join(__dirname, ...)`、`loadFile` 和 `path.resolve`，preload 传文件内容，原生菜单字典也通过 path.join 读取。未发现应用运行时调用 POSIX shell 来保存文件。

JSON／PNG／PDF／profile 通过文件输入、Blob 下载或受条件控制的浏览器保存接口；桌面 file: 路径不使用网页的 showSaveFilePicker。云相关本机偏好仍用原 localStorage。

需要 W2 特别验证中文／空格用户名目录、盘符、UNC／网络目录、下载和保存目录、长路径。原命令行过滤只匹配小写 `.json`，大写 `.JSON` 启动参数是一个原有边界；本轮不新增文件关联或重写打开流程。

Portable 启动器会临时解压应用并设置 PORTABLE_EXECUTABLE_DIR；应用没有据此把 userData 改到 EXE 文件夹。因此“Portable”表示免安装启动，不能据此承诺所有偏好随 EXE 移动。实际 Windows 用户数据位置和文件关联效果必须在 W2 核查。

## 14. 是否发现 Windows 非法文件名风险？

发现并作了最小修复：原 PNG／PDF 直接将 `John 1:1` 等引用写入文件名，导出菜单 JSON 也直接拼入引用，自定义文件名未完整处理；profile 的 ASCII slug 仍可能是 CON 等设备保留名。

现在只对**下载建议文件名**统一处理 Windows 禁用字符、ASCII 控制字符、设备保留名（含后缀、大小写及相关上标数字）、开头空格、末尾空格／句点和空值。正常名称保持，正文、经文范围、姓名、个人方案和项目 JSON 中的原值不改变。profile 原 slug 规则继续使用，只补保留名防护。

中英文 E2E 实际生成 JSON、PNG、PDF、profile 文件并检查名称；PNG／PDF 恢复后逐项比较项目数据。未声称穷举所有文件系统或超长路径限制。

规则依据：[Microsoft 文件与路径命名说明](https://learn.microsoft.com/en-gb/windows/win32/fileio/naming-a-file)。

## 15. Ctrl／Cmd 快捷键设计是否跨平台？

源码以 `ctrlKey || metaKey` 处理保存、撤销、重做和格式操作；重做支持 Ctrl+Y／Ctrl+Shift+Z。文字输入框保留其原生编辑行为。原生菜单 role 与已有 accelerator 原样传递，Windows 风格菜单模型验证 Ctrl／Alt 组合没有被翻译成 Cmd。

提示为 Ctrl/Cmd，不是 Windows 只显示 Cmd。未改原英文或中文措辞。原版没有应用级 Ctrl+O，本轮没有增加；打开文件使用按钮。全选、菜单缩放、开发者快捷键、原生菜单与业务撤销之间的交互仍需 Windows 实测。

## 16. 中文 IME 代码是否跨平台设计？

是。关系搜索使用 compositionstart／compositionend、isComposing；Enter 防护也检查 keyCode 229。命题编辑的 Enter／Backspace 同样保护组合输入。这些逻辑没有按 macOS 条件启用，现有自动测试保留。

Windows 微软拼音等真实输入法的候选词提交、Enter、焦点和关系搜索必须留 W2，模拟事件不叫 Windows runtime test。

## 17. Windows 字体／DPI 有哪些待实机验证风险？

字体栈已有 Microsoft YaHei、system-ui 和 sans-serif fallback；Windows 的 system-ui 可使用系统 UI 字体。没有新增字体文件，也没有为了 Windows 改 CSS。Greek／Hebrew 字体与 RTL 保留原实现。

Light／Dark 使用 HTML data-theme 和 CSS 变量，没有依赖 macOS nativeTheme；WebKit 滚动条规则属于 Chromium 兼容层。真实 Windows 字形、行高、原生控件、浅深主题、禁用／placeholder 及长双语标签仍需检查。

W1 的浏览器布局回归使用产品原有缩放，不冒充 Windows 系统 DPI。**100%／125%／150% Windows 系统缩放全部留 W2**，包括显示器切换、窗口最大化和文字截断。

编码方面，应用文件 UTF-8 检查通过；粘贴解析归一化 CRLF／CR，.env 的逐行 trim 也可处理 CRLF。新增测试检查 CRLF JSON 读取与 Unicode 内容。没有把仓库整体转成 CRLF。

## 18. npm run check 结果？

通过：lint、typecheck 和全部 unit。见 [check 日志](W1-evidence/check-final.log)。

## 19. unit 多少／多少？

**351／351**，原 343 项不变，新增 8 项平台逻辑测试：文件名字符／设备名／空名／Unicode、建议名称与原数据边界、CRLF JSON，以及 Windows 风格菜单模型。它们不是 Windows 实机测试。

## 20. E2E 多少／多少？

**109／109**，原 107 项全部保留，没有删减或放宽。新增 English／简体中文各一项完整下载名称与数据恢复测试。测试服务器严格位于新 worktree，不复用其他服务器。

新增测试初次等待了浏览器原生 Save picker，而非桌面下载分支，导致超时；修正测试环境为不提供该浏览器接口后，按桌面原有下载分支验证并通过。没有为测试改保存行为。见 [E2E 日志](W1-evidence/e2e-final.log)。

## 21. i18n audit？

通过：**600 English／600 zh-CN keys**，故意 fallback 0，37 个源码文件、2,398 条源码文本记录。没有新增翻译或改专业术语。

新增源码文本只是文件名清理函数的技术 fallback `discourse`，已人工确认不是新增 UI 待译项。W1 使用独立 [源码文本审计快照](W1-源码文本审计.json)，audit 指向此快照；历史阶段 5 快照没有覆盖。没有简单重置审计来掩盖漏译。

## 22. 本阶段修改了哪些源码？

| 文件 | 改动 |
| --- | --- |
| `js/services/persistence.js` | 增加 filename-only 清理，接入自定义及默认 JSON 建议名 |
| `js/services/export-service.js` | PNG／PDF 下载名调用同一清理；嵌入项目数据函数不变 |
| `js/utils/ui-menus.js` | 导出菜单 JSON 下载名调用清理 |
| `js/services/notation-ui.js` | 方案文件下载名补设备保留名防护；方案名与数据不改 |
| `scripts/audit-i18n.cjs` | 切到本 Windows worktree 的 W1 审计快照 |

新增 1 个 unit 文件、1 个 E2E 文件、W1 审计快照、报告及证据。main／preload、HTML／CSS、字典、专业显示层、profiles、关系 IDs／常量、项目状态、拆分／合并逻辑均与冻结版一致。保存序列化和项目标准化函数也逐段一致。包内 41 个应用文件仅上述 4 个应用文件有预期变化。

## 23. 是否修改依赖／lockfile？

没有。package.json／package-lock.json 与冻结提交逐字节一致。Electron 28.3.3、electron-builder 24.13.3、Playwright 1.61.1 仍为原锁定版本。独立安装只使用既有 npm 缓存；npm 11 未运行 Electron postinstall，不影响本轮 builder 使用既有 Windows Electron 缓存。

唯一另下载的是匹配现有 Playwright 版本的 Mac headless 浏览器及 ffmpeg，放在 Windows worktree 自己的 scratch 中；不是项目依赖升级，不进入 EXE。没有安装 Windows、不创建 GitHub Actions、不改变签名。

## 24. 当前工作区是否干净？

**不干净：本轮源码、测试、报告和证据保留为待审核的未提交修改。** Windows 分支 HEAD 仍是冻结起点，完整包内文件哈希和 [源码补丁](W1-evidence/source-changes.patch)用于绑定本测试产物。

本仓库 [CLAUDE.md](../../CLAUDE.md) 明确要求：“Never run `git commit` unless explicitly asked by the user.” 本轮 W1 请求没有明确要求提交，因此没有擅自 commit，也没有 push。这里不是测试失败或未完成构建；审核后可另行决定本地提交。

原工作目录继续由另一会话使用，没有要求它干净、切分支或清理；冻结分支引用未改动。

## 25. 是否建议进入 W2？

建议在人工审核本报告、文件名修复和测试产物后进入 W2。W1 的构建和回归条件已满足，目前没有发现必须升级依赖或修改数据格式才能继续的阻塞问题。Windows 实机结果仍为未验证，不能直接当正式 Windows 版交付。

## 已验证

- 从指定冻结 commit 建立独立 worktree，冻结分支引用保持不变。
- 原构建流程在 Apple Silicon Mac 成功生成 Portable，未升级组件。
- 内部 Electron 应用 PE32+ x64、3.3.1 版本和实际配置图标；外层 NSIS 启动器架构单独记录。
- 内嵌 7z 数据无警告通过完整性检查；从 EXE 提取的 73 个文件与构建目录一致；41 个应用文件逐一匹配已测源码。
- 351 unit、109 E2E、i18n audit 通过；项目数据与专业译名边界保持。

## 只做了静态／模拟检查

- 运行时路径拼接、平台生命周期、菜单 role／accelerator、Ctrl／Meta 分支。
- Windows 风格菜单模型、文件名规则、Unicode／CRLF 数据读取、IME composition 事件。
- 字体 fallback、主题 CSS、DPI 风险及原白名单的资源覆盖。

## 必须 Windows 实机验证

- EXE 真正启动、运行时版本、首次启动与重启后的语言／profile／userData。
- Windows 10／11 x64 的中文字体、Greek／Hebrew、Light／Dark、真实系统 DPI 100／125／150%。
- 微软中文 IME、Ctrl 保存／撤销／重做／全选、菜单快捷键及焦点。
- 原生对话框、文件选择器、中文／空格／UNC／长路径、JSON／PNG／PDF／方案导入导出和实际保存位置。
- 任务栏、最大化／最小化、文件关联及小写／大写扩展名边界。
- SmartScreen、Defender／其他杀毒软件行为；未向任何在线扫描服务上传文件。
- 若未来决定做安装版，另验证安装／卸载／范围／注册表；本轮没有 Setup 可供此项验证。

**W1 到此停止。没有进入 W2／W3，没有 push、PR、Release、签名或公开发布。**
