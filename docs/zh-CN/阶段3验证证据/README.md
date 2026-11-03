# 阶段 3 验证证据

最终代码提交：`5aa31fb6456b7ad5c08d0eb75f989a2deb4c21c6`。报告与证据之后另作提交，不改变打包源码。

| 文件 | 含义 |
| --- | --- |
| check-final.log | 最终 npm run check：lint、typecheck、317 项 unit 通过 |
| e2e-final.log | 最终全部 44 项 E2E 通过，包含原有 30 项 |
| build-mac.log | 最终原命令 Mac arm64 构建通过；保留无有效 Developer ID 的提示 |
| native.log、result.json | 最终实际 ZIP 解压版 17 项桌面检查全部通过 |
| 验证汇总.json | 基线、源码提交、原有／新增测试数、产物路径与哈希、受保护文件检查 |
| 打包源码一致性.json | 已逐字节核对一致的 40 个包内源码／资源文件清单 |
| 01–03 的 PNG | 真实桌面窗口截图：中文启动、Gurtner 中文搜索、最终内容及安全文本 |
| e2e-svg-click-initial.log | 新测试对 SVG 点击不稳定的初次记录 |
| native-initial.log、result-initial.json | 自用脚本对 undefined 属性与 JSON 省略属性比较方式不当的初次记录 |
| native-welcome-race.log、result-welcome-race.json | 自用脚本未等欢迎页加载便操作设置的记录 |
| 桌面验证脚本.cjs.txt | 最终桌面检查脚本快照；不是应用运行代码 |

初次检查失败与最终结果分开保留，原因见阶段 3 报告。没有删除或弱化原有测试。归档的 SVG 初次日志只去除了行尾空格，原始输出仍保存在 scratch 目录。

构建日志中的输出路径是构建当时的 `dist/`；核对后为保留原版产物，阶段 3 产物移入 `dist/phase3-i18n/`。移动未修改 ZIP 内容。原版产物恢复原路径，原 ZIP 哈希已复核。

开发者复跑浏览器检查可使用现有依赖执行 `npm run check`、`npm run test:e2e`。桌面脚本快照依赖项目已有 Playwright、真实 Mac arm64 测试包及在线经文接口；它当前指向 `scratch/phase3/delivery-check/` 的解压包，使用独立测试偏好目录。再次运行需将包解压到相应路径，并改用新的空测试偏好目录，以保留“首次启动”的前提；不要把它指向日常使用的应用数据目录。
