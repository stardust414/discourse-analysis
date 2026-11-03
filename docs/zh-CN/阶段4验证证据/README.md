# 阶段 4 验证证据

应用源码提交：`5979b0f64cd38f6696533acd2c160ccbacf92c4e`。随后的覆盖映射、测试稳定性和报告提交不改变包内应用源码。

| 文件 | 含义 |
| --- | --- |
| check-final.log | 最终 check：lint、typecheck、335 unit 通过 |
| e2e-final.log | 最终完整 60 E2E 通过 |
| coverage-final.json | 600 英文键、595 中文键、五个明确回退、37 文件／2,365 条源码文本记录，无未知显式键或新未审文本 |
| build-mac.log | 原版本依赖构建成功；保留无有效 Developer ID 的原提示 |
| native-final.log、result.json | 实际 ZIP 解压版最终 26 项桌面检查全部通过 |
| native-menus.json | 原生菜单的实际中英文标签、角色、结构及快捷键对照 |
| verification.json | 包内 41 个文件一致性、受保护源码／函数、测试数、产物哈希和原版 ZIP 未变的核对 |
| e2e-geometry-first.log、e2e-geometry-repeat.log | 原折叠测试首次完整运行及重复检查的空坐标失败记录 |
| e2e-geometry-baseline.log | 固定原版干净源码重复 5 次，1 次复现同样坐标读取失败 |
| e2e-geometry-stable.log | 仅增加测试等待后，该场景连续 10 次通过 |
| 00–12 的 PNG | 原生窗口截图；五套指南分别取证。截图关闭有限入场动画以避免截在淡入中途，未改变应用动画 |
| 桌面验证脚本.cjs.txt | 最终本机检查脚本快照；使用独立测试目录，含真实经文网络读取 |
| 打包核对脚本.cjs.txt | 产物、固定源码和最终测试结果的核对脚本快照 |

JSON、PNG、PDF 的实际测试导出文件保留在任务 scratch 目录，未作为用户项目加入仓库。所有测试姓名、评论、摘要及项目代码都是任务用样例。云同步只检查界面和错误，不向真实云端写入。

原折叠场景的几何误差断言、标签断言及其他原断言均保留。等待处理不修改应用业务代码；失败记录没有用成功结果覆盖。

普通验证：`npm run check`、`npm run test:e2e`、`node scripts/audit-i18n.cjs`。运行 E2E 时使用任务中原已安装的浏览器缓存，未安装新版本。Mac 构建只用命令行指定独立输出目录，未改变 package.json。

桌面脚本当前指向 `scratch/phase4/delivery-final/` 的解压包及 `native-profile-delivery-final` 隔离偏好目录；如需重跑首次启动，应换用新的空测试目录。原版对照源码已移至任务临时目录外，避免 Node 自动发现并重复计数原版 unit tests。完整初始开发日志及自用文件仍在 scratch/phase4，不属于应用源码。

归档的 runner 日志只规范化行尾空格；原始输出仍保存在 scratch/phase4。
