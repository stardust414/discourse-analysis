# T3 最終驗證證據

日期：2026-11-04。全部為文件、紀錄與 metadata；沒有正式二進位或測試 userData。

| 文件 | 內容與邊界 |
| --- | --- |
| preflight.json | T2 最終 HEAD／branch；從乾淨狀態開始 repository verification |
| check-final.log | npm run check：lint／typecheck／446 unit，0 failed |
| e2e-final.log | 全部 132 Chromium E2E；獨立 18976 伺服器，非 Windows runtime |
| audit-final.json | 三語各 601、繁體 missing 0、七項語法例外不變、issues 0 |
| binary-copy-verification.json | 先驗證兩個原檔固定 SHA，再複製及逐位元組比較；沒有 rebuild |
| source-verification.json | 正式 Mac ZIP 的 app.asar 全部 43 應用源碼符合 210b3bb；依賴／audit／測試仍與 488e504 一致 |
| zip-verification.json | 正式 Mac ZIP CRC 及 app.asar hash |
| external-windows-runtime.json | 使用者確認的外部啟動／試用事實、精確 EXE 綁定，以及未記錄／未專項驗證清單 |
| regression-side-effects.json | 回歸產生的三張 T2 截圖差異另存 scratch，原歷史 T2 證據逐位元組保留 |
| final-verification.json | 分開記錄自動測試、構建來源、Mac 舊精確包 20／20、外部 Windows 試用和交付 metadata 位置 |
| SHA256SUMS.txt | 兩個正式檔固定校驗值 |

T3 不重新建置／啟動新二進位。Mac runtime 沿用精確相同 ZIP 的 T2 20／20；Windows runtime 來自使用者本輪確認，不能擴寫為 native x64 或 Windows 專項全面通過。

T2 source／build 證據保留原狀。T3 最後文件 commit 的完整值與 clean 狀態在提交後寫入 `dist/final-zh-Hant/delivery-metadata.json` 與同目錄的 `凍結與交付紀錄.txt`；它們不進 Git，以免最後 commit 自引用。此處的 application source commit 只指包內應用源碼。
