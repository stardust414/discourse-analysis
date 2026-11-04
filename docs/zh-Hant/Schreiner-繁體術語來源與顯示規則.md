# Schreiner 繁體術語來源與顯示規則

本文件記錄本輪使用者提供的來源與人工決定，不將專案通用譯名宣稱為作者官方中譯。原始出版節選／課件並未作為個人附件納入應用或 Git；以下定位與審核依使用者本輪提供的資料記錄，沒有補造書名、ISBN、版權頁或課件頁碼。

## 來源範圍

1. 使用者提供 Thomas R. Schreiner 著作的正式繁體出版譯本節選，「命題間不同關係的摘要圖」，書頁 123–124。只將下表 18 個關係名、五個分組名與中文簡稱記為該節選支持的術語。
2. 使用者提供的授課課件：`Double ground (DG) → 雙重理據`，並註明「英文二版新增」。**雙重理據來自課件，不能宣稱為上述出版節選的正式譯名。**
3. 軟體關係定義沿用專案原 English 與既有人工審定語義翻譯；不是從出版節選逐字取出的定義。其他四套 profile 的通用繁體名稱也不歸因於 Schreiner。

使用者補充中的示例／測試段仍出現「雙側理由」，但同一補充已明確正式修正並廢止其作為 Schreiner 主顯示。本輪按這項明確決定實作 **雙重理據 Double Ground（DG）**；舊詞只作通用詞和搜尋相容詞。

## 逐項對照

| relationship ID | English | Schreiner zh-Hant 主顯示名 | 出版節選中文簡稱（僅參考） | 軟體原記號（不改） | 來源 |
| --- | --- | --- | --- | --- | --- |
| series | Series | 連續性 | 連 | `S` | 出版節選 123–124 |
| progression | Progression | 漸進性 | 漸 | `P` | 出版節選 123–124 |
| alternative | Alternative | 選擇性 | 選 | `A` | 出版節選 123–124 |
| action-manner | Action-Manner | 行動與方式 | 行／方 | `Ac / Mn` | 出版節選 123–124 |
| comparison | Comparison | 比較 | 比 | `Cf` | 出版節選 123–124 |
| negative-positive | Negative-Positive | 否定與肯定 | －／＋ | `- / +` | 出版節選 123–124 |
| idea-explanation | Idea-Explanation | 概念與解釋 | 概／解 | `Id / Exp` | 出版節選 123–124 |
| question-answer | Question-Answer | 問與答 | 問／答 | `Q / A` | 出版節選 123–124 |
| ground | Ground | 理據 | 理 | `G` | 出版節選 123–124 |
| inference | Inference | 推論 | ∴ | `∴` | 出版節選 123–124 |
| action-result | Action-Result | 行動與結果 | 行／結 | `Ac / Res` | 出版節選 123–124 |
| action-purpose | Action-Purpose | 行動與目的 | 行／目 | `Ac / Pur` | 出版節選 123–124 |
| conditional | Conditional | 條件性 | 若／就 | `If / Th` | 出版節選 123–124 |
| temporal | Temporal | 時間性 | 時 | `T` | 出版節選 123–124 |
| locative | Locative | 地點性 | 地 | `L` | 出版節選 123–124 |
| bilateral | Bilateral | 雙邊的 | 雙 | `BL` | 出版節選 123–124 |
| double-ground | Double Ground | **雙重理據** | 未由出版節選記錄 | `DG` | 使用者課件，英文二版新增 |
| concessive | Concessive | 讓步性 | 讓 | `Csv` | 出版節選 123–124 |
| situation-response | Situation-Response | 處境與回應 | 處／回 | `Sit / R` | 出版節選 123–124 |

軟體的 19 行仍維持原有順序；上表為來源對照，並未重排 profile。中文簡稱僅在這份文件保留作來源 metadata，不裝入 getAbbr，不寫入 profile。

## 分組

| English | Schreiner zh-Hant | 其他 profile 的通用 zh-Hant |
| --- | --- | --- |
| Coordinate Relationships | 並列關係 | 並列關係 |
| Subordinate Relationships | 從屬關係 | 從屬關係 |
| Support by Restatement | 以再陳述輔助 | 以重述支持 |
| Support by Distinct Statement | 以額外陳述輔助 | 以不同陳述支持 |
| Support by Contrary Statement | 以對立陳述輔助 | 以相反陳述支持 |

## 顯示與搜尋實作邊界

`js/i18n/relationship-profiles.js` 是獨立的顯示資料，按 locale／profile 查詢。只有 zh-Hant＋內建 Schreiner 使用上述覆蓋；English／zh-CN 不受影響。使用者自訂 profile 或改過的關係名稱保持原值。

完整資訊以 `繁體名稱 English Name（getAbbr 的原值）` 顯示在 selector ARIA、title、focus 詳情與 Guide。圖內記號完全不改；緊湊按鈕空間不足時先隱藏中文，不截斷原記號。

搜尋同時索引出版詞、課件詞、通用繁體詞、簡體詞、English、原記號與三語關鍵詞。因此 Schreiner 的 Ground 可搜尋「理據」「理由」「Ground」「G」；Double Ground 可搜尋「雙重理據」「雙側理由」「双侧理由」「DG」。切換 BibleArc 後主顯示恢復通用詞，不把出版譯名全域替換。
