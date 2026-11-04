# T2 驗證證據

- `check.log`：lint、typecheck、446/446 unit；其中保留 351 項基線，新增 95 項。
- `e2e-all.log`：132/132 Chromium E2E；保留 109 項基線，新增 23 項。
- `audit.json`：601/601/601，zh-Hant missing=0，無新未審源碼文字。
- `mac-smoke.json`／`mac-smoke.log`／`mac-smoke.cjs`：實際解壓測試 ZIP 的 Mac arm64 packaged 應用，獨立 userData；20 項結果與重跑工具。
- `build-mac.log`／`build-win.log`：沿用原 builder／鎖定依賴，只指定獨立測試輸出目錄。
- `mac-package.json`／`win-package.json`：必要資源逐檔雜湊及 app.asar metadata。
- `pe-inspection.json`／`inspect-pe.py`：Windows 內部 PE32+ x64、3.3.1.0、圖示及零 Authenticode certificate table；Portable 外啟動器是原 NSIS i386 stub，不等於內部 app 架構。
- `payload-integrity.log`：純內嵌 7z CRC／解壓完整性。直接對外 EXE 使用舊 7za 會提示尾端有資料（原 NSIS 格式也如此）；抽出精確 payload 後無警告，且全部 73 個檔案逐位元組等於 win-unpacked。
- `verification.json`／`SHA256SUMS`：來源提交、未變更的重要源碼、測試成績及測試包雜湊。
- PNG：穩定畫面截圖，只有測試樣例與網路經文；沒有帳戶、密碼或一般使用者資料。

`sourceCommit` 指兩個包中的應用源碼版本；之後的提交只加強測試或整理文件，未改包內應用檔案。43 個實際應用源檔已逐檔與兩個 app.asar 比較一致，無額外 tests／docs／scratch／私人資料。

測試包不是正式凍結包，沒有推送或發佈。Windows 新 EXE 尚未實機測試；T3 須把本次精確 SHA-256 的 EXE 交外部 Windows 電腦試用。
