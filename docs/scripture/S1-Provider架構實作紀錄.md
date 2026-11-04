# S1：Translation Registry / Provider Adapter 最小實作

## 範圍與實際結構

基於 S0 commit `ec74f6ee432c42e5eb5212099611cf46e906d03a`，沿用 `feature/chinese-scripture-online`。S1 只建立 main passage 的小型 registry / adapter，沒有加入中文主文譯本、新 provider 整合、離線管理、下載或 cache。

全部 production 改動放在既有 `js/services/bible-service.js`：

- `PASSAGE_TRANSLATIONS`：凍結的 metadata table；僅登記 `esv / nasb / greek / hebrew`，每筆只有 `id / provider`，provider 為 `legacy`。
- `DA_BIBLE.getTranslationMetadata(id)`：嚴格 lookup，未知 / inherited / parallel-only / paste / custom ID 回傳 undefined。回傳的 metadata entry 凍結，不能由 consumer 改掉路由。
- `PASSAGE_PROVIDERS`：凍結的 provider adapter table，目前只有 `legacy`，呼叫 `fetchLegacyPassageData(id, query)`。
- `DA_BIBLE.fetchPassageData(version, query)`：保留原 API，先 lookup，再按 provider table 分派；原本選路函數僅改名為 `fetchLegacyPassageData`，函數體不變。

沒有新 global namespace、script tag、載入順序、app.js、selector、backend、CSP、parallel mapping 或保存格式改動。

## 與 S0 的差異及原因

S0 的 metadata / records / error contract 是未來設計，S1 沒有一次全做。現階段只需穩定 main ID 與 provider key；displayName、language、script、offlineAllowed、downloadable、cachePolicy、attribution 等欄位待有真正 consumer 與授權證據再加入。沒有建立新目錄或多個 provider 檔案，避免為四個同用 legacy 行為的選項引入不必要的依賴順序。

新增資料是 runtime registry，不存入 project。既有 `copyrightLabel / parallelLabel / parallelTexts` 不變；project schema 仍是 3，沒有 migration，也沒有假裝已有主文 translationId / sourceVersion 欄位。

重新讀 source 後補充 S0 未強調的一點：舊 `fetchPassageData` 對未知 ID 會使用 ESV 路徑，並不是拒絕。本次保留這個舊入口兼容行為，但不把未知 ID 註冊成 ESV；嚴格 metadata lookup 仍回 undefined。這不代表 paste/custom 交由網路接管：既有 UI 的 paste / import 路徑完全不呼叫 passage provider。新的 registry 不收錄 paste/custom，也不更改 parallel 大寫 codes。

## 不變行為

ESV / NASB 仍先官方 API（Electron bridge 或既有 Web proxy），任何 primary 失敗後才 Bolls，保留 `source` / canonical / error / result shape。Greek NT 仍 SBLGNT、Greek OT 仍 LXX；Hebrew 仍 WLC + RTL。最終來源失敗仍向呼叫端拋錯。既有代理、keys、安全邊界和網路請求數不因 wrapper 改變。

沒有新增 UI 文案或 dictionary key。現有 source-literal guard 對四個 selector ID 的增加出現次數及新 `legacy` key 發出提醒；逐項審查後只把這五項登記到既有 `docs/zh-Hant/T2-源碼文字審計.json`，分類為 internal Scripture routing ID。沒有修改 audit script、擴大 allowlist、替換整份快照或新增語法例外。

## S2 的最小擴充點

授權和 edition gate 通過後，在 `PASSAGE_TRANSLATIONS` 加入經審核的新 entry，在 `PASSAGE_PROVIDERS` 加入相應 adapter（可之後抽至獨立檔案）。adapter 接受 translation ID / query，回傳既有主文 result shape；需要 providerTranslationId 等 metadata 時才增欄位，不向 legacy 函數堆新分支。

selector option、三語 label、source attribution、span parser 與新來源的狀態文案是 S2 獨立工作，不因本次 registry 自動完成。尤其新 provider 不能假裝合節已由舊 numeric parser 支援。parallel 仍用原入口，日後須另過合節與跨章 mapping gate。

S0 所記 CUV edition / 權源、CNV/TCV 授權、Cloud CDN 聯通、CORS/CSP、source span 語義仍是 S2 gate；本次未解決或繞過，也沒有新增 S1 blocker。

## 測試

修改架構前先跑既有 Bible service / paste / persistence / parallel unit：96/96 通過。

新增 12 個 unit tests（`tests/bible-service.test.js`）：metadata identity / immutability、未知與 inherited ID、selector 值對齊、ESV bridge、NASB proxy ID、兩者 primary → fallback 次序、Greek NT 重複行與章篩選、Greek OT / Hebrew mapping 與 script flags、最終錯誤傳播、未知 ID 舊 fallback。

新增 2 個 browser E2E（`tests/e2e/scripture-registry.spec.js`）：實際四個 selector 的 fixture network 路徑與 script flags；custom paste 及 schema-3 JSON 檔重新匯入（含既有 parallel code/full text）不呼叫 passage provider。API 回應均攔截，不增加真實外網依賴。

完整驗證結果於完成段落記錄。既有 geometry assertion 不修改、不 skip；本輪任何新增失敗須修正後重驗。所有測試產物與自動更新的證據截圖不納入提交。

## 完成驗證

- `npm run check`：exit 0；lint / typecheck 通過；unit **458/458**（原446 + 新12），0 failed / skipped。
- 完整 E2E：**133 passed / 1 failed / 134 total**（原132 + 新2）；唯一失敗仍為 `relationship picker opens underneath the bracket's last line`，`tests/e2e/app.spec.js:1036` 預期 picker.y >= 501.703125、實際 5，與既有 Cloud geometry 記錄一致。新增兩項均通過，無新增 regression、無 skip、無 assertion 改動；失敗 context 與完整 log 保留於執行環境，不提交測試產物。
- i18n audit：**601/601/601**，traditionalMissingKeys=0、issues=[]、7 approved grammar exceptions 不變。
- diff 審查：僅 Bible service、unit tests、新 E2E、本實作紀錄及五項 internal-literal 審計登記。E2E 自動覆寫的22張截圖已另行保留並還原，不入提交；無環境配置、測試產物、依賴或 lockfile 變動。

S1 完成後停止，等待人工審核；不進入 S2。
