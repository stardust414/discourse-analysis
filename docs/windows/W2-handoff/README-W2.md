# W2 Windows 实机测试包

状态：**等待 Windows 执行；当前没有任何 Windows runtime 通过结果。**

本包用于 W2 测试，尚不是 W3 正式 Windows 发布。应用为 Discourse Analysis 3.3.1，W1 提交 `d5376dbc5725cae9a08d03209ab23e756a08f003`，来自冻结中文版本 `c02cf5be5ce69135ef617eb317e2b7362446f239`。没有 local-cuv／本地 CUNPS 功能，也没有升级依赖或改 schema。

## 先核对文件

解压到你有写入权限的测试目录。保留原文件名：

`Discourse Analysis 3.3.1 x64 Portable.exe`

SHA-256 必须为：

```text
8b69136698e7bd29fc54f86971e5bfc4d37ac62f782a46131fea6d5df320b356
```

可在 PowerShell 中执行内置命令核对：

```powershell
Get-FileHash -LiteralPath '.\Discourse Analysis 3.3.1 x64 Portable.exe' -Algorithm SHA256
```

哈希不一致就停止。Manifest.json 列出各文件的校验值；无需安装 Node、Electron、Wine 或浏览器。

## 先正常双击，再做其他检查

1. 保持 SmartScreen、Defender 和 Windows Security 开启。先用文件资源管理器正常双击 EXE；记录到可操作窗口的耗时，分清实测秒数与估算。
2. 若出现 Unknown publisher、SmartScreen、隔离或拦截，截图并记录具体状态。不要为了测试关闭保护、添加排除、批量解除文件阻止或改系统策略。若无法按正常策略启动，记录为安全提示／运行受阻，不改用脚本偷偷绕过。
3. 只测试本包的合成项目和姓名，例如 `Windows QA`。截图裁去账号、通知、个人路径、桌面私密资料；不上传密码或 Microsoft 账号信息。
4. 外层 Portable 是 NSIS 启动器，内部实际应用为 x64；它会解压到临时目录。免安装不表示 userData 必然保存在 EXE 旁边。

Windows 11 ARM 上成功运行 x64 应用应记录为 **Windows runtime verified under x64 emulation on Windows 11 ARM**。Intel／AMD x64 虚拟机也不是物理 PC；原生 x64 硬件需要测试者明确说明，不能只凭 CPU 架构代码推定。

## 怎样记录结果

- 打开 `W2-手工验证清单.md`，按步骤执行。
- `W2-results-template.csv` 的状态初始都是 `未验证`。可填写 `通过 / 失败 / 阻塞 / 未验证 / 不适用`；通过要写环境、步骤、证据文件名。没有执行不能改为通过。
- 截图建议编号 `LAUNCH-*`、`MENU-*`、`DPI-100-*`、`DPI-125-*`、`DPI-150-*`、`IME-*`、`FILES-*`、`SECURITY-*`。不用机械地拍重复截图，须能说明条件及结果。
- 收集输出默认位于本包旁的 `W2-results`，归档前先检查隐私。不要把你平时的项目或整个 AppData 打包返回。

## 可选的只读环境收集

在已有权限允许运行脚本的 PowerShell 中，可以执行：

```powershell
.\Collect-W2Evidence.ps1
.\Collect-W2Evidence.ps1 -OperatorDisplayScale 125 -WindowCondition default
```

脚本需要 Windows 及原 EXE，首先核对哈希。它记录 Windows build、CPU 架构代码、语言、当前应用窗口有效 DPI、文件版本资源及存在的用户数据候选目录。路径以 `%APPDATA%`、`%TEMP%` 等代替个人用户名，未知前缀隐藏；不读取 localStorage 内容、项目正文、账户或截图，不启动程序，不访问网络，不改设置。

如果系统策略阻止脚本或 Add-Type，**不改变 ExecutionPolicy／安全策略**，手工填写清单即可。脚本目前只经过源码检查和打包核对，尚未在 Windows／PowerShell 实际执行；报错请原样记录，经检查去除隐私后再提供。

脚本的 `Status=metadata_only_not_a_test_pass` 是有意的。发现进程不等于完整 runtime 通过；文件版本资源不等于实测 `app.getVersion()`。AppData 候选目录不等于实测 `app.getPath('userData')`。这两个 Electron API 值需要开发者在 Windows 调试会话另行采集；没有条件时填写未验证，不凭推断补数值。偏好跨重启保留可以独立手工测试。

## DPI 的特别要求

真正到 Windows“设置 → 系统 → 屏幕 → 缩放”分别选 100%、125%、150%，按系统提示处理，并记录设置截图。不要用应用缩放、浏览器缩放或 VM 的 Retina 分辨率代替。每档检查小窗口（约 800×600）、默认窗口、最大化，按清单核查关键界面。

收集器的 `OperatorReportedDisplayScale` 是测试者填报值，不会证明你已修改系统。`GetDpiForWindow` 的值与窗口 DPI awareness 有关，仅作旁证，不能自动将所有窗口标成相应系统缩放测试通过。

## Mac 旧项目与数据比较

`fixtures/mac-frozen-project.json` 是冻结仓库中阶段 5 实际 Mac 保存的项目文件的原字节副本，具有合成署名、评论、回复、摘要、ESV 与 CUV 平行栏。来源和哈希见 `fixtures/provenance.json`；经文及原署名来源未改。先选择内置 **Gurtner**，再打开这个项目。

项目 JSON 原本不保存当前 profile；个人方案仍用原应用的独立导入／导出机制，不要为测试往项目里添加 profile 或语言字段。

将同一项目在 Windows 打开、另存为，分别导出 PNG／PDF，再各自恢复并另存 JSON。比较文件时可用：

```powershell
.\Compare-Project.ps1 -Reference '.\fixtures\mac-frozen-project.json' -Candidate '.\W2-results\windows-saved.json' -OutputFile '.\W2-results\compare.json'
```

脚本只读比较所有字段，忽略根字段 `exportedAt`，数组顺序仍有意义；只报告差异字段名和哈希，不输出评论等正文。非零退出码 2 表示有数据差异。比较通过只证明两个 JSON 内容一致，不代替实际在界面打开／导出恢复。

可选 `-ReferenceProfile ... -CandidateProfile ...` 同时比较两份独立 profile。先在同一方案下导出一份，重新导入再导出；不要把不同内置方案比较成应相同。

把 Windows 另存的 JSON／方案放入只含本次测试数据的小包，交回 Mac 冻结版做反向打开；本阶段的另一开发分支不可作为 Mac 冻结兼容验证目标。

## CON 方案样例

`fixtures/reserved-CON.daprofile.json` 是本包合成的个人方案，显示名 `CON`、ID `w2-con-fixture`。导入后导出，应得到安全文件名（例如 `_CON.daprofile.json`），显示名仍是 CON。此样例不改内置 profile 或专业译名。完成该独立测试后切回 Gurtner，继续旧项目对比。

## 返回哪些文件

返回填写的 CSV、必要的截图、脱敏环境 JSON、比较结果，以及本次测试新生成的项目／方案文件。不要返回整个 AppData、浏览器缓存、Microsoft 账户资料或非测试项目。

若当前只有 Windows 11 ARM，这一轮可以继续，不因没有 Intel／AMD PC 而作废；W3 前仍建议完成一台原生 x64 PC 的最终 smoke。

## 参考

- [Microsoft GetDpiForWindow](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getdpiforwindow)：窗口有效 DPI 的取值受 DPI awareness 影响。
- [Microsoft Win32_Processor](https://learn.microsoft.com/en-us/windows/win32/cimwin32prov/win32-processor)：架构代码 9 为 x64，12 为 ARM64；物理／虚拟仍需人工确认。

本包不包含 Setup，不签名，不安装工具，不修改安全策略，不上传数据。测试结束停在 W2，待人工审核后才考虑 W3。
