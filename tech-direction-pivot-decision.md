# 技術方向の見直し ─ 比較と推奨

> **更新日**：2026-05-10
> **作成者**：Cowork（peng mu の指摘を受けて）
> **ステータス**：**決定済**（Option A 採用：cc-desktop-switch ベース）
> **背景**：peng mu が「Anthropic 公式 Claude Desktop は UI から Base URL を変更できず、システム環境変数も読まない」と指摘。cc-desktop-switch が機能していると報告。

---

## 0. TL;DR（30 秒）

**結論**：cc-switch は Claude Code CLI をターゲットにしており、**「Claude Desktop」（Anthropic の汎用デスクトップアプリ）は別物**で、独自の 3P プロバイダ設定機構を持つ。cc-desktop-switch は **その「Claude Desktop の隠れた 3P 設定」に直接書き込む**ことで切替えを実現している。

**採用決定**：Option A — ベースを cc-switch から cc-desktop-switch に切替え。

---

## 1. 事実関係の整理

### 1.1 「Claude Code」と「Claude Desktop」の区別

| 名称 | 形態 | env 変数 / settings.json | カスタム Base URL |
|---|---|---|---|
| **Claude Code（CLI）** | ターミナルコマンド `claude` | ✅ 読む | ✅ `ANTHROPIC_BASE_URL` |
| **Claude Code Desktop** | 開発者向け GUI | ⚠️ plugins parity | ⚠️ 検証必須 |
| **Claude Desktop**（汎用）| 一般ユーザー向け GUI | ❌ 読まない | ❌ UI 不可 |

### 1.2 cc-switch の本当のターゲット

README: "A cross-platform desktop All-in-One assistant tool for **Claude Code**, Codex, OpenCode, openclaw & **Gemini CLI**."

→ **Claude Code (CLI)** が中心であり、**「Claude Desktop」とは書いていない**。

### 1.3 cc-desktop-switch のアプローチ

> "「一键应用到 Claude 桌面版」会写入 Claude Desktop 在当前系统上使用的本机配置。"

→ Claude Desktop には **設定 UI に出ていない 3P プロバイダ設定領域** が存在し、cc-desktop-switch はそこに書き込んでいる。

---

## 2. 2 製品の技術差分

| 項目 | cc-switch | cc-desktop-switch |
|---|---|---|
| **対象アプリ** | Claude Code CLI 等 | Claude Desktop（GUI） |
| **書込み先** | `~/.claude/settings.json` | `claude_desktop_config.json`（OS 依存） |
| **技術スタック** | Tauri + React + Rust | Python + FastAPI + Bootstrap |
| **バイナリサイズ** | 〜10 MB | 〜50-100 MB |
| **License** | MIT | MIT |
| **i18n 既存** | en + zh | zh + en（ja 不在） |
| **GitHub Stars** | 多数 | 78 |

---

## 3. 方向修正オプション

### Option A：cc-desktop-switch ベースに切替え（**採用**）

**長所**：
- ✅ Claude Desktop で実際に動く（peng mu 検証済）
- ✅ chotto.ai が Anthropic 互換なので安定パスが使える
- ✅ ターゲット顧客の現実に即している
- ✅ MIT で fork 可能

**短所**：
- ⚠️ Python ベースの大型バイナリ（~50-100MB）
- ⚠️ macOS 対応が遅れがち
- ⚠️ コミュニティ規模が小さい

### Option B：cc-switch ベース継続（**非採用**）
→ chotto.ai の主要顧客像と乖離するため不採用。

### Option C：ハイブリッド（**非採用、v2 候補**）
→ 工数大、v1 を Option A で出してから v2 で Tauri 移植を検討。

---

## 4. Anthropic 側の動向リスク

cc-desktop-switch のアプローチ（隠れた設定領域への直書込み）は、Anthropic が将来的に閉じる可能性がある。

リスク低減策：
1. chotto.ai 単独 LP / API キー手動コピペの代替手順を常に併記
2. Anthropic の Claude Desktop リリースノートを毎週監視
3. 閉鎖時にはブラウザ拡張・IDE プラグイン等への pivot を許容

---

## 5. 検証結果（peng mu 実機）

### 検証 1：cc-desktop-switch v1.0.23 Windows 起動 → ✅
### 検証 2：chotto.ai をプロバイダ登録 → 実応答確認 → ✅
### 検証 3：macOS → v1.1 以降で対応

→ **Option A 採用決定**

---

**以上**
