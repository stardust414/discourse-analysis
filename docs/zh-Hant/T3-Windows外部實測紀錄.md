# T3 Windows 外部實測紀錄

分類：**External Windows runtime validation passed**。

來源是使用者在本次對話中的明確確認：T2 產生的 Windows Portable 已複製到外部真實 Windows 電腦，成功啟動，實際試用正常，未發現使用問題。確認記錄日期為 2026-11-04；實際試用日期未記錄。本機沒有 Windows 環境，本輪沒有執行 Windows 自動收集或取得額外截圖。

## 精確二進位綁定

T2 原檔：`dist/t2-zh-Hant-win/Discourse Analysis 3.3.1 x64 Portable.exe`

SHA-256：`2b7df895b607b4d59764e64fd9a8ef4a1f8b71371011bc05fca5b919005584a9`

T3 開始時重新計算原檔校驗值，完全一致；正式檔逐位元組複製後再比較，內容及 SHA-256 不變。沒有重新建置、簽名、修改資源或把其他 EXE 的試用結果挪用過來。

正式檔：`dist/final-zh-Hant/windows/Discourse Analysis-3.3.1-zh-CN-zh-Hant-win-x64-portable.exe`

## 已確認

| 項目 | 結果 | 證據來源 |
| --- | --- | --- |
| 這個精確 SHA-256 的 EXE 在外部 Windows 電腦實際運行 | 通過 | 使用者確認＋本輪原檔 hash／正式檔位元組核對 |
| 成功啟動 | 通過 | 使用者確認 |
| 實際試用正常 | 通過 | 使用者確認 |
| 未發現使用問題或 blocker | 通過 | 使用者確認 |

沒有提供逐項操作清單，因此不擴寫具體哪些快捷鍵、匯出或輸入法邊界曾被測試，也不產生假造的通過項數。

## 未記錄／未專項驗證

| 項目 | 狀態 |
| --- | --- |
| Windows 10／11 或其他具體版本 | 未記錄 |
| Windows build number | 未記錄 |
| Intel／AMD／ARM、CPU 型號／架構 | 未記錄 |
| 是否 native x64 hardware、是否 x64 emulation | 未確認／未記錄 |
| DPI 100%／125%／150% 矩陣 | 未專項驗證 |
| Microsoft IME、候選 Enter、Backspace／focus 邊界 | 未專項驗證 |
| SmartScreen／Unknown Publisher 實際提示 | 未專項記錄 |
| Defender 掃描、隔離或其他防毒行為 | 未專項記錄 |
| UNC、長路徑與完整 Windows 路徑矩陣 | 未專項驗證 |
| 各種 Windows build／主題／原生對話框與快捷鍵完整清單 | 未專項驗證 |

內部應用為 PE32+ x64 是 T2 構建檢查的結果，不代表已證明測試電腦為原生 x64。應用資源版本 3.3.1／PE 產品版本 3.3.1.0 也來自包檢查；未聲稱在外部電腦執行 app.getVersion 或 PowerShell 收集。

## 自動驗證、簽名與凍結範圍

446 unit、132 browser E2E 和三語 audit 是 Mac／Chromium 的 repository verification，不是 Windows runtime 專項測試。

EXE 未簽名、無 Authenticode，未修改 SmartScreen／Defender 或任何安全政策。未記錄的安全提示不推測為「一定沒有」。

依使用者本輪明確凍結標準，這些未覆蓋專項不阻塞個人／同學用途的交付。沒有宣稱 Windows 全平台認證；若未來要擴大公開分發，可另行安排專項驗證與正式簽名。

機讀紀錄見 [external-windows-runtime.json](T3-evidence/external-windows-runtime.json)。T2 報告原「Windows 未實測」是當時狀態，保留歷史；本紀錄追加此次使用者後續提供的外部試用事實，不回寫或偽造 T2 測試清單。
