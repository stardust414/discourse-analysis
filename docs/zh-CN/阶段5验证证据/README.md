# 阶段 5 验证证据

这些是本阶段最终源代码和实际 Mac arm64 包的测试、构建与截图证据。报告见上级目录《阶段5报告》《阶段5视觉检查记录》。所有演示评论、署名、摘要及原文排版样例为验证数据；真实联网经文仅为 John 1:1–3 ESV／CUV，没有连接或改写用户云端项目。

- `验证汇总.json`：固定上游、已验证源代码提交、343 unit／107 E2E、600／600 字典、20 项 Mac 工作流及 30 组矩阵、41 个包内源码文件一致性、包大小和 SHA-256、受保护文件与函数核验。
- `check-final.log`：`npm run check`，含 lint、类型检查及全量 unit。
- `e2e-final.log`：全量 107 E2E。沿用阶段 2.5 下载的浏览器，运行时指定 `PLAYWRIGHT_BROWSERS_PATH="$PWD/scratch/phase25/browsers"`，未安装或升级组件。
- `audit-final.json`：`node scripts/audit-i18n.cjs`，故意 fallback 0，37 个文件／2,397 个源码文本记录。
- `build-mac.log`：`npm run build:mac -- --config.directories.output=dist/phase5-zh-CN`；保留原无有效 Developer ID 签名的提示。
- `native-result.json`、`native-final.log`：实际 ZIP 解压后启动 arm64 程序，独立 `--user-data-dir`，20 项工作流及 30 组窗口矩阵；无 pageErrors。
- `native-supplement.json`／日志：同一实际包的云端加入输入与导出菜单两主题、100% 平行栏编辑视野及原有 75% 档收侧栏双栏全貌补查；只打开输入，不执行加入或发布。
- `native-native-menus.json`：实际包中 English／中文菜单角色与标签。
- `浏览器矩阵.json`：40 条浏览器矩阵记录，每条包含五套指南检查。
- `native-workflow-project.json`：用于保存、重新打开、PNG／PDF 恢复、切换语言和重启后逐项对比的项目样例。
- `preflight.json`：修改前双击／Enter 操作结论和布局测量；`native-before.json`／`BEFORE-dark-settings.png` 保留阶段 4 包深色字段修正前证据。
- `N-*.png`：实际 Mac Electron 页面；`B-*.png`：浏览器页面。布局稳定后采集，不以细微字体像素差异判失败。详见视觉检查记录中的条件和用途。

## 复现说明

从仓库根目录运行 `npm run check`、上述浏览器命令、`node scripts/audit-i18n.cjs` 和 Mac 构建命令。桌面验证需要将产物解压至脚本引用的 `scratch/phase5/delivery-review`，并使用一个全新隔离数据目录；脚本首次启动断言需要 Welcome。不要直接对用户真实数据目录运行首次启动脚本。

`native-workflow.cjs`、`native-supplement.cjs` 和 `verify.cjs` 为本次实际执行脚本的留档，原执行位置是仓库根目录下的 `scratch/phase5/`。若复现，先复制回该位置，核对输出及隔离路径；其中 verify 的相对 require 是按原位置编写的。脚本引用的 ZIP、解压目录、截图和本机数据目录不随 Git 分发。截图及最终结果已在本证据目录保存。

初次完整 E2E 因浏览器目录未指定而在启动前失败，随后使用原有目录重跑通过；该诊断在本机 `scratch/phase5/e2e-browser-path-error.log`。桌面验证脚本初期曾修正工具导入和对平行栏续行的错误预期，原本就存在的业务规则及断言没有改动。最终证据取修正脚本后的完整运行。

这些检查没有处理签名／notarization、升级依赖、改动项目 schema、关系或方案 IDs，也没有修复原版词内合并补空格行为。未做 Windows 实机和完整屏幕阅读器认证。
