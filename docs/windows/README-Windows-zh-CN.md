# Discourse Analysis 3.3.1 简体中文 Windows x64 Portable

这是 **Discourse Analysis 3.3.1 简体中文 Windows x64 Portable 本地化构建**，产品名和内部版本仍为 Discourse Analysis 3.3.1，不是上游新官方版本。基于原上游 `98da0241c38eef936be0f06cf736aa607dda0b62` 和中文冻结仓库 `c02cf5be5ce69135ef617eb317e2b7362446f239`。

不包含另一功能分支的 local-cuv／离线新标点和合本。当前应用沿用原有联网载入及粘贴文本功能。

## 文件与核对

正式文件：[Discourse Analysis-3.3.1-zh-CN-win-x64-portable.exe](../../dist/final-windows-zh-CN/Discourse%20Analysis-3.3.1-zh-CN-win-x64-portable.exe)

大小：69,657,199 bytes。SHA-256：

```text
8b69136698e7bd29fc54f86971e5bfc4d37ac62f782a46131fea6d5df320b356
```

它是已在外部真实 Windows 电脑试用的 W1 原 EXE 的**字节级副本**，仅改交付文件名，没有重新 build。外部用户试用时使用原名 `Discourse Analysis 3.3.1 x64 Portable.exe`；本次没有声称改名后又在 Windows 重测。

需要核对时，可在 PowerShell 使用内置命令：

```powershell
Get-FileHash -LiteralPath '.\Discourse Analysis-3.3.1-zh-CN-win-x64-portable.exe' -Algorithm SHA256
```

哈希不一致应停止使用并向交付者核对来源。交付目录另有 SHA256SUMS.txt 和交付清单.json。

## 如何使用

目标平台为 Windows 10／11 x64。将 EXE 放在有写入权限、来源可信的位置，正常双击启动；不需要另装 Node 或 Electron，也没有 Setup 安装步骤。用户外部试用已报告正常启动和整体运行，但其 Windows 版本、CPU 和 build 没有记录，不能理解为已全面覆盖所有 Windows 环境或已认证原生 Intel／AMD 硬件。

Portable 会解压运行内部应用。**免安装不意味着所有用户偏好都随 EXE 移动。** 本机语言和方案沿用原存储机制，实际 Windows userData 路径没有专项记录。保留日常项目文件的备份。

若遇到系统安全提示，先确认来源和哈希，按电脑既有策略处理；无法正常启动时记录提示并联系交付者。不关闭 SmartScreen／Defender、不添加排除、不改变系统安全策略。

## 界面语言与专业关系

设置中可选择 English、简体中文、Follow System／跟随系统。语言为本机偏好，不进入项目 JSON。文字切换机制、英文 fallback、五套记号方案和中文／英文／原简称搜索继承已冻结实现。

关系选择器默认显示中文与当前 profile 原始简称／符号；空间不足先压缩中文，完整英文简称优先保留。关系指南、tooltip 和详情提供完整双语名称。缩写、大小写、空格、符号和星号按当前方案原值显示；用户自定义名称原样保留，方便与英文教材和课件对应。

本次专业译名遵循 [v1.1 规范](../zh-CN/中文界面翻译规范-v1.1.md)与[审核表](../zh-CN/专业术语审核表-v1.1.md)，不代表各作者认可的官方中译。

## 基本操作

以现有格式输入经文，例如 `John 1:1-5` 或 `1 Cor 10:1-13`，选择译本后载入，也可粘贴文本。普通分析状态在文字中定位光标后按 Enter 拆分，点击圆点建立关系；双击通常用于选词。评论、摘要、结构图和平行栏沿用原功能。

用“保存／另存为”保留项目 JSON，“打开”可读取 JSON 和本软件带恢复数据的 PNG／PDF。个人记号方案另行导入／导出；项目 JSON 原本不包含当前本机 profile。

PNG／PDF 可包含完整恢复数据，包括评论、摘要和署名。分享前确认其中内容适合分享，不把它们当作自动匿名化图片。

## 验证范围

- **自动验证**：对应源码 unit 351／351、E2E 109／109、i18n 600／600；这些在 Mac 上执行，不称为 Windows runtime 测试。
- **构建验证**：内部应用 PE32+ x64、3.3.1、图标／资源与包完整性，固定 SHA-256；外层是打包器原有的 32 位 NSIS 启动器。
- **外部真实 Windows 用户验证**：用户报告正常启动、整体实际试用正常；没有逐项操作日志或截图。
- **未专项覆盖**：DPI 全矩阵、IME 边界、菜单／快捷键细项、原文／主题／所有路径／UNC、各 API、所有安全软件及所有 Windows build；不把整体正常改写成全部专项通过。

## 签名与已知限制

当前 EXE **unsigned、无 Authenticode、未做 Windows code signing**。SmartScreen／Unknown Publisher／Defender 是否出现提示，用户未专项记录；不承诺一定出现或一定没有出现。签名和公开分发以后另行处理。

原版词内拆分后合并可能补空格；大图表／平行栏可能需要滚动；中文书卷名输入没有新增；部分系统／第三方内容的语言由外部决定。大写 `.JSON` 命令行边界、实际 Windows 文件关联和 userData 尚未专项验证，普通文件打开优先使用应用按钮。

本次面向用户和同学使用冻结，不是 Windows 平台全面认证。若以后发现必须改源码的阻塞问题，应建立新的修订、重新构建并将新哈希文件重新交 Windows 实测，不能让新 EXE 继承本文件的试用结论。

## 来源与后续资料

原项目：[josiahhoi/discourse-analysis](https://github.com/josiahhoi/discourse-analysis)。原版权、MIT 声明、经文来源、profile 和页脚署名保留，见[原 README](../../README.md)。本地化没有改变品牌、经文数据或取得额外经文授权。

详见 [W2 实际记录](W2-Windows实机验证报告.md)、[W3 最终交付报告](W3-Windows最终交付报告.md)和[Windows 文档索引](README.md)。维护原则参见[维护与上游同步](../zh-CN/维护与上游同步.md)，Windows 冻结另须保留本 EXE 的精确二进制身份。
