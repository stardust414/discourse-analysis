# 繁體普通 UI 術語審核表 v0.1

T1 建議稿，**未作 zh-Hant 定稿，也未接入 production**。依 English 原意與已審 zh-CN 語義建立共同詞表，不做臺灣／香港兩套混搭。表中 A 是短詞本身可沿用；完整 key 的分類另按上下文，不能以一個詞推定整句已核准。B 即使字形轉換可得到同字詞，也仍需軟體操作語境確認。

| # | English | zh-CN | 建議 zh-Hant | 類型 | 是否純轉換 | 需人工確認 | 備註 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UI01 | Settings | 设置 | 設定 | B | 否 | 是 | 全域選項；不混用設置。 |
| UI02 | Interface | 界面 | 介面 | B | 否 | 是 | 臺灣介面／香港界面；建議統一介面。 |
| UI03 | Interface language | 界面语言 | 介面語言 | B | 否 | 是 | 不將 locale 寫入專案。 |
| UI04 | Follow System | 跟随系统 | 跟隨系統 | B | 否 | 是 | 跟隨／跟從地域選項；建議跟隨。 |
| UI05 | Simplified Chinese | 简体中文 | 簡體中文 | B | 否 | 是 | zh-Hant 字典的現有 language.chinese；不改 zh-CN 代碼。 |
| UI06 | Traditional Chinese（新選項） | 繁體中文（新選項） | 繁體中文 | B | 否 | 是 | T2 新增 language.traditional，三字典同增。 |
| UI07 | Save | 保存 | 儲存 | B | 否 | 是 | 備選存檔；全域建議儲存。 |
| UI08 | Save As | 另存为 | 另存新檔 | B | 否 | 是 | 與儲存、匯出區分。 |
| UI09 | Open | 打开 | 開啟 | B | 否 | 是 | 打開／開啟地域習慣；保留與載入的動作區別。 |
| UI10 | Load / Fetch Passage | 载入／载入经文 | 載入／載入經文 | B | 否 | 是 | 可沿用載入，仍需與開啟／匯入一致區分。 |
| UI11 | Import | 导入 | 匯入 | B | 否 | 是 | 不改匯入檔案資料。 |
| UI12 | Export | 导出 | 匯出 | B | 否 | 是 | 不一律改為下載。 |
| UI13 | Download | 下载 | 下載 | B | 否 | 是 | 字形可得，動作仍需與匯出區分。 |
| UI14 | Upload | 上传 | 上傳 | B | 否 | 是 | 目前 600 key 未見獨立上傳文案；詞表備用，不新增功能。 |
| UI15 | File | 文件 | 檔案 | B | 否 | 是 | 檔案／文件地區差異；文件另留給 Document。 |
| UI16 | Document | 文档 | 文件 | B | 否 | 是 | 可編輯分析內容；備選分析文件，與磁碟檔案分開。 |
| UI17 | Project | 项目 | 專案 | B | 否 | 是 | 專案／項目需人工選定，不混用。 |
| UI18 | Project code / ID | 项目代码 | 專案代碼 | B | 否 | 是 | 只是顯示說明；projectId/code 參數原值不動。 |
| UI19 | Search | 搜索／筛选 | 搜尋／篩選 | B | 否 | 是 | 搜尋與篩選語義分開。 |
| UI20 | Delete / Remove / Clear | 删除／移除／清除 | 刪除／移除／清除 | B | 否 | 是 | 雖部分可字形轉換，不能把三種操作合為一詞。 |
| UI21 | Undo | 撤销 | 復原 | B | 否 | 是 | 建議與 Redo 成對；備選復原／重做。 |
| UI22 | Redo | 重做 | 取消復原 | B | 否 | 是 | 備選重做；不得改 Ctrl+Y／Ctrl+Shift+Z。 |
| UI23 | Restore | 恢复 | 還原 | B | 否 | 是 | 草稿／連線還原；不等同 Undo 或 Reply。 |
| UI24 | Recovery | 恢复（草稿恢复） | 復原（草稿復原） | B | 否 | 是 | 功能名可用草稿復原，動作用還原草稿；需整體批准。 |
| UI25 | Cancel | 取消 | 取消 | A | 是 | 否 | 用詞可沿用，不能與 Undo 混用。 |
| UI26 | Discard | 放弃更改 | 放棄變更 | B | 否 | 是 | 確認框需說明後果，不改為忽略。 |
| UI27 | Dismiss | 忽略 | 忽略 | B | 否 | 是 | 保留原操作結果，不當作刪除／放棄更改。 |
| UI28 | Comment | 评论 | 評論 | B | 否 | 是 | 多人審閱情境建議沿用評論；備選註解，需人工決定。 |
| UI29 | Reply | 回复 | 回覆 | B | 否 | 是 | 不是回復或復原。 |
| UI30 | Send reply | 发送回复 | 傳送回覆 | B | 否 | 是 | 傳送／發送地域習慣；本表建議傳送。 |
| UI31 | Copy | 复制 | 複製 | B | 否 | 是 | 複而不是復；不轉換剪貼簿中的內容。 |
| UI32 | Cut | 剪切 | 剪下 | B | 否 | 是 | 不改原生 menu role。 |
| UI33 | Paste | 粘贴 | 貼上 | B | 否 | 是 | 貼上／貼入地域習慣；建議貼上。 |
| UI34 | Clipboard | 剪贴板 | 剪貼簿 | B | 否 | 是 | 不混用剪貼板。 |
| UI35 | Data | 数据 | 資料 | B | 否 | 是 | 資料／數據；本表建議資料，不改 JSON 字段。 |
| UI36 | Default | 默认 | 預設 | B | 否 | 是 | 不變更實際預設值。 |
| UI37 | Custom | 自定义 | 自訂 | B | 否 | 是 | 與原資料名稱 Custom 分離；使用者命名不翻譯。 |
| UI38 | Create | 创建 | 建立 | B | 否 | 是 | 建立／創建選定後一致。 |
| UI39 | Add / Append | 添加／追加 | 新增／追加 | B | 否 | 是 | Add 一般新增，Append 追加；不一律新增。 |
| UI40 | Replace | 替换 | 取代 | B | 否 | 是 | 備選替換；s.S0622 另有方向問題。 |
| UI41 | Change | 更改 | 變更 | B | 否 | 是 | 保留修改對象與操作後果。 |
| UI42 | Switch | 切换 | 切換 | A | 是 | 否 | 詞可沿用；星號、模式的具體對象仍須按專業句檢查。 |
| UI43 | Link | 链接 | 連結 | B | 否 | 是 | URL 原字串不變。 |
| UI44 | Cloud Sync | 云同步 | 雲端同步 | B | 否 | 是 | 不新增雲功能。 |
| UI45 | Password / API key | 密码／密钥 | 密碼／金鑰 | B | 否 | 是 | 不改實際憑據或技術 error 值。 |
| UI46 | Publish / Update | 发布／更新 | 發布／更新 | B | 否 | 是 | 發不是髮，保留 publish 與 upload 區別。 |
| UI47 | Owner | 所有者 | 擁有者 | B | 否 | 是 | 姓名原值保持。 |
| UI48 | Mouse / cursor | 鼠标／光标 | 滑鼠／游標 | B | 否 | 是 | 鼠標／光標為備選地域用詞，需確認。 |
| UI49 | Click / Double-click | 点击／双击 | 按一下／按兩下 | B | 否 | 是 | 不把按兩下寫成拆分功能。 |
| UI50 | Right-click | 右键点击 | 按右鍵 | B | 否 | 是 | 觸控等其他輸入方式不新增。 |
| UI51 | Window / View | 窗口／视图 | 視窗／檢視 | B | 否 | 是 | 應用原生 Zoom 視窗不等於內容縮放。 |
| UI52 | Sidebar / column / row | 侧栏／栏／行 | 側欄／欄／行 | B | 否 | 是 | 不將 row 一律改成列，以免與 column 混淆。 |
| UI53 | Scroll | 滚动 | 捲動 | B | 否 | 是 | 捲動／滾動地域差異需確認。 |
| UI54 | Expand / Collapse | 展开／折叠 | 展開／收合 | B | 否 | 是 | 面板可用此對；圖結構折疊的專業語義另列，不刪內容。 |
| UI55 | Indent | 缩进 | 縮排 | B | 否 | 是 | 縮進為備選；Block Diagram 名稱須同時批准。 |
| UI56 | Highlight | 高亮 | 醒目標示 | B | 否 | 是 | 備選醒目提示／突顯；不用可能表示選區的反白替代持久高亮。 |
| UI57 | Color | 颜色 | 顏色 | A | 是 | 否 | 顏色可沿用；不改實際色碼。 |
| UI58 | Pink | 粉色 | 粉紅色 | B | 否 | 是 | 需用詞決定，不只將字形轉換。 |
| UI59 | Help / Tips | 帮助／提示 | 說明／提示 | B | 否 | 是 | 說明／幫助地域差異需確認。 |
| UI60 | Close / Done | 关闭／完成 | 關閉／完成 | A | 是 | 否 | 沿用；不和取消混用。 |
| UI61 | Sync / on / off | 同步／开启／关闭 | 同步／開啟／關閉 | A | 是 | 否 | 短詞可沿用；雲端完整句仍用共通詞表。 |
| UI62 | Field / cell | 字段／单元格 | 欄位／儲存格 | B | 否 | 是 | 變數／JSON field 名不翻譯。 |
| UI63 | Unknown / Anonymous | 未知／匿名 | 未知／匿名 | A | 是 | 否 | 只翻 UI 缺值提示，不替使用者恰好輸入的 Anonymous 改名。 |

## 完整句高優先審核：s.S0622

- 原 English：`Replace the current {newTranslation} column (including any edits) with {oldTranslation}? Ctrl+Z undoes this.`
- 現 zh-CN：`确定用 {newTranslation} 替换当前 {oldTranslation} 栏（包括所有编辑内容）？可按 Ctrl+Z 撤销。`
- 呼叫點 `js/utils/ui-menus.js`：`newTranslation: DA_STATE.parallelLabel` 是目前譯本，`oldTranslation: code` 是新選譯本。名稱雖容易誤解，但不得改參數 ID 或業務行為。
- 建議 zh-Hant：`確定以 {oldTranslation} 取代目前的 {newTranslation} 欄（包含所有編輯內容）？可按 Ctrl+Z 復原。`
- 狀態：**需人工確認，非純轉換**。English 及實際呼叫支持上述方向，現 zh-CN 句子方向相反。T1 僅登記，不修改凍結來源。T2 的 zh-Hant 應依實際語義；是否另修 zh-CN 文案需明確批准，不藉此改核心流程。

## 待選定的地域與產品用詞組

建議人工按組批准，而不是每個 key 另選詞：

1. 專案／檔案／文件、資料、預設、自訂。
2. Undo／Redo：復原／取消復原；Restore 還原、Reply 回覆、Copy 複製分開。
3. 滑鼠／游標、按一下／按兩下、視窗／檢視、捲動。
4. 評論或註解：本表建議沿用評論，配回覆；不可對同一功能混用兩者。
5. 醒目標示、展開／收合、縮排；其中 Block Diagram／Bracket View 模式名須與專業表同步批准。
6. 英文關鍵詞提示建議沿用「關鍵詞」，不一處關鍵字、一處關鍵詞；專業連接詞語義按 v1.1。

所有格式參數、快捷鍵和 URL 原樣保留，中文全角標點按現語境使用；不強制把引號改成地區出版樣式。完整 600 key 與 B 類清單見 [全量分類](T1-600-key分類清單.md)／[機讀證據](T1-600-key分類審計.json)。本表不是全量句子譯文；T2 需逐句翻譯、審閱、測試。
