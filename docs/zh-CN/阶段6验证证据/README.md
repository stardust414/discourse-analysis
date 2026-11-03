# 阶段 6 最终验证证据

本目录保存本次冻结交付的最终记录。普通用户请先看上级目录的 README-zh-CN 与阶段6最终交付报告。

| 文件 | 内容 |
| --- | --- |
| `start.json` | 开始回归时的完整 commit、空 git status、原版和阶段 3／4／5 包的哈希 |
| `check-final.log` | 从干净状态执行 `npm run check`：lint、typecheck、343 unit |
| `e2e-final.log` | 原有浏览器缓存环境下全量 107 E2E |
| `audit-final.json` | 600／600 字典、无问题、故意 fallback 0 |
| `build-mac.log` | 原有构建方式生成 Mac arm64，保留无有效 Developer ID 提示 |
| `zip-check.json` | 正式命名 ZIP 的 CRC、单一 app 根目录、无测试目录、哈希及原构建字节相同 |
| `ZIP文件清单.txt` | 253 个正常打包条目，便于审查未混入测试资料 |
| `codesign-inspect.log` | 只读签名检查：原 Electron adhoc、无 TeamIdentifier，不是 Developer ID |
| `Mac最终smoke记录.json` | 从最终 ZIP 启动的 20 项检查、实际系统 locale、无 pageErrors，以及原版 3.3.1 读取比较 |
| `native-final.log` | 实机逐步通过日志 |
| `最终验证汇总.json` | 41 个应用文件对应 Git blob／SHA-256，受保护函数／文件，版本、架构、环境、包与结果 |
| `01–04*.png` | 最终包选择器／指南／重启项目及固定原版打开中文项目；布局稳定后采集 |
| `native-final.cjs`、`verify-final.cjs` | 实际执行脚本留档；不属于应用运行时 |

执行命令：

```sh
npm run check
PLAYWRIGHT_BROWSERS_PATH="$PWD/scratch/phase25/browsers" npm run test:e2e
node scripts/audit-i18n.cjs
npm run build:mac -- --config.directories.output=dist/phase6-build
```

生成原名 ZIP 后复制为 `dist/final-zh-CN/Discourse Analysis-3.3.1-zh-CN-arm64-mac.zip`，先核对 CRC，再从该文件解压启动。详细方法见维护文档；本阶段没有安装、升级或签名。

脚本原执行位置在仓库根目录下 `scratch/phase6/`。若以后复现，先复制到该位置，审查输出目录并更换为全新的隔离 userData；首次启动断言需要 Welcome。`verify-final.cjs` 的相对 require 按原位置编写；原版兼容比较还需要保留的阶段 2.5 原版解压包。不要把测试首次启动脚本指向真实日常用户目录。没有随本目录复制任何 userData、测试导出文件或 Playwright 浏览器。

验证脚本初期曾修正 ASAR 文件路径写法与读取大图标所需的进程输出 buffer；属于验证工具调整，应用与测试断言未改动。最终保存的是成功运行的脚本和结果。

最终 Git 文档提交只补充本报告与证据，不改变已测应用；本机 `dist/final-zh-CN/交付清单.json` 记录最后提交和干净状态。ZIP 校验值也单独存于该目录 SHA256SUMS.txt。
