# tiee.co.jp 再設計 ─ 素描（v0.2）

> **更新日**：2026-05-10（v0.2：tielink.jp 取得済反映、tielink 基底を cc-desktop-switch に変更したことに伴う v3 反映）
> **作成者**：Claude (Cowork)
> **ステータス**：素描（discussion-grade）。確定スペックではない
> **目的**：株式会社 TIE の現行コーポレートサイト（lolipop ホスティング）を、3 製品（tielink / chotto.ai / vroom.buzz）を統合した **製品ハブ** として GitHub Pages 上に再構築するための初期構想
> **関連**：`tielink-implementation-plan-v3.md`、`chotto-ai-cooperation-spec.md`

---

## 0. 前提と現状

| 項目 | 現状 | 移行後 |
|---|---|---|
| ドメイン | `tiee.co.jp`（ムームードメイン管理） | 同（DNS のみ切替え） |
| ホスティング | lolipop（共有レンタルサーバ） | **GitHub Pages** + Cloudflare CDN |
| 言語 | 日本語のみ（推定） | 日本語デフォルト + 英語切替 |
| 構造 | 一般的な企業サイト | 製品ハブ + 会社情報 |
| 製品紹介 | （未整理） | tielink / chotto.ai / vroom.buzz の 3 列構成 |
| HTTPS | 不明 | GitHub Pages 自動（無料 Let's Encrypt） |

DNS の切替えのみでドメインは保持。ムームードメイン側で A レコード / CNAME を GitHub Pages に向ける。

---

## 1. サイト全体のサイトマップ

```
tiee.co.jp/
├── /                              ← トップ：ヒーロー + 3 製品カード + 会社情報
├── /products/
│   ├── /tielink/                  ← tielink ランディング（DL ボタン主役）または tielink.jp への 301
│   ├── /chotto-ai/                ← chotto.ai 紹介（→ chotto.ai 本体への誘導）
│   └── /vroom-buzz/               ← vroom.buzz 紹介（→ vroom.buzz 本体への誘導）
├── /company/
│   ├── /about/                    ← 会社概要（登記情報、代表挨拶）
│   ├── /careers/                  ← 採用（v2 で）
│   └── /contact/                  ← お問い合わせ（info@tiee.co.jp）
├── /legal/
│   ├── /terms/                    ← サイト利用規約
│   ├── /privacy/                  ← プライバシーポリシー（GA / PostHog 明記）
│   └── /tokushoho/                ← 特商法表記（chotto.ai 側へ統合 or 個別）
└── /press/                        ← プレスリリース・更新履歴（v2 で）
```

> 注：`chotto.ai` 本体（API ゲートウェイ・LP）は別ドメインのまま運用継続。tiee.co.jp 上の `/products/chotto-ai/` は **概要紹介 + 本サイトへの導線**のみ。

---

## 2. 技術スタック（推奨）

| 層 | 推奨 | 理由 |
|---|---|---|
| フレームワーク | **Next.js 15（App Router、SSG モード）** | chotto.ai LP と同一スタック、コンポーネント・スタイル流用容易 |
| デプロイ | GitHub Pages（`TIE-LINK/tiee-website` レポを `gh-pages` に出力） | 無料、CDN 内蔵、tielink と同じ org で管理、HTTPS 自動 |
| CSS | TailwindCSS 4 | chotto.ai LP と同一 |
| 配色 | chotto.ai ダーク基調 + 製品ごとのアクセント色 | §3 参照 |
| i18n | `next-intl`（ja / en） | 標準的、SSG と相性良い |
| アナリティクス | PostHog（chotto.ai と同一プロジェクト、別 group） | 統合 funnel 分析が容易 |
| お問い合わせフォーム | Formspree / Cloudflare Workers | サーバレス、lolipop からの脱却を完遂 |

---

## 3. 配色とブランド統合

### 3.1 全体の世界観

サイト全体の基調は **chotto.ai のダーク・ニューラルネット系パレット**（`tielink-implementation-plan-v3.md §3.1` と同一）。各製品カードで **アクセント色を切り替える** ことで、製品ごとの個性を視覚的に表現。

| 製品 | アクセント色 | 由来 |
|---|---|---|
| tielink | **`#FF4D2E`** | tielink オレンジ（接続を象徴） |
| chotto.ai | **`#3b82f6` + `#8b5cf6`** | chotto.ai ブルー〜パープル（既存 LP 流用） |
| vroom.buzz | **TBD**（VROOM_BUZZ_Brand_Guidelines_v4.pptx 抽出後決定） | 動画系 |

### 3.2 ロゴ並び

- ヘッダ左上：`TIE` 法人ロゴ（商標 6494075 デザインを流用）
- 右上：言語切替（JA / EN）+ お問い合わせリンク
- フッタ左：法人住所、登記情報
- フッタ右：3 製品ロゴ（リンク付き）

---

## 4. トップページ構成

```
┌──────────────────────────────────────────────────┐
│ TIE                              JA / EN  Contact │
├──────────────────────────────────────────────────┤
│                                                  │
│  ヒーロー                                        │
│  「日本のソフトウェア基盤を、もっと近く。」     │
│  株式会社 TIE は、AI と接続を軸とした 3 つの     │
│  プロダクトを開発・運営しています。              │
│                                                  │
├──────────────────────────────────────────────────┤
│  製品                                            │
│  ┌────────────┬────────────┬────────────┐        │
│  │  tielink   │ chotto.ai  │ vroom.buzz │        │
│  │  ━━━━━━━   │  ━━━━━━━━  │  ━━━━━━━   │        │
│  │  Claude    │  Claude    │  動画      │        │
│  │  Desktop   │  互換 API  │  プラット  │        │
│  │  用切替    │  ゲート    │  フォーム  │        │
│  │            │  ウェイ    │            │        │
│  │            │            │            │        │
│  │  [DL  →]  │ [LP   →]  │  [近日 →]  │        │
│  │  オレンジ  │  青〜紫    │  TBD       │        │
│  └────────────┴────────────┴────────────┘        │
├──────────────────────────────────────────────────┤
│  会社概要 / 沿革 / お問い合わせ                  │
└──────────────────────────────────────────────────┘
```

3 製品カードは **同じ情報密度** で並べる。視覚的にどれかを大きくしないことで、**「TIE は単一製品の会社ではなく、製品群を持つ会社」** の印象を与える。

---

## 5. `/products/tielink/` ページ構成（v3 — cc-desktop-switch ベース反映）

```
┌──────────────────────────────────────────────────┐
│ TIE > Products > tielink                         │
├──────────────────────────────────────────────────┤
│                                                  │
│  tielink                                         │
│  Anthropic Claude Desktop で chotto.ai を 3 秒で。 │
│                                                  │
│  [▶ Windows DL]  [GitHub →]  (macOS は v1.1)    │
│                                                  │
│  ┌──────────────────────────────────────┐         │
│  │  [スクリーンショット / アニメ GIF]    │         │
│  └──────────────────────────────────────┘         │
│                                                  │
├──────────────────────────────────────────────────┤
│  特徴                                            │
│   1. API Key 貼付けだけで OK                      │
│   2. Anthropic Claude Desktop（GUI 一般版）対応    │
│   3. tielink を閉じても Claude Desktop は動く     │
│   4. OSS（MIT、cc-desktop-switch ベース）         │
│   5. DeepSeek/Kimi/智谱 等 6+ プロバイダも対応    │
├──────────────────────────────────────────────────┤
│  使い方（5 ステップ）                            │
│  - スクリーンショット 5 枚                        │
├──────────────────────────────────────────────────┤
│  動作環境                                        │
│  Windows 10/11（v1.0）、macOS 12+（v1.1 予定）    │
├──────────────────────────────────────────────────┤
│  FAQ                                             │
│  - chotto.ai 以外のプロバイダも使えますか？      │
│  - データはどこに保存されますか？                │
│  - 自動更新の挙動は？                            │
├──────────────────────────────────────────────────┤
│  サポート：info@tiee.co.jp                        │
└──────────────────────────────────────────────────┘
```

DL ボタンは GitHub Releases の最新成果物に **永続リンク** で直リンク：

```
v1.0（Windows のみ）:
  https://github.com/TIE-LINK/tielink/releases/latest/download/tielink-Windows-Setup.exe
  https://github.com/TIE-LINK/tielink/releases/latest/download/tielink-Windows-Portable.zip

v1.1 以降（macOS 追加予定）:
  https://github.com/TIE-LINK/tielink/releases/latest/download/tielink-macOS-arm64.dmg
  https://github.com/TIE-LINK/tielink/releases/latest/download/tielink-macOS-arm64.pkg
```

> **tielink.jp 取得済の扱い**：`tiee.co.jp/products/tielink/` は **`tielink.jp` への 301 redirect** を採用、または同一コンテンツミラー（SEO は canonical で `tielink.jp` 優先）。tiee.co.jp 上では「3 製品ハブ」の存在感は維持しつつ、tielink の「正面玄関」は `tielink.jp` に一本化する。

---

## 6. `/products/chotto-ai/` ページ構成

短い概要 + chotto.ai 本体（`https://chotto.ai`）への誘導が主目的。

```
┌──────────────────────────────────────────────────┐
│  chotto.ai                                       │
│  Claude API を 1/5 以下に。日本円・適格請求書対応│
│                                                  │
│  [chotto.ai 公式へ →]  [tielink で使う →]        │
├──────────────────────────────────────────────────┤
│  3 行で                                          │
│  - Anthropic 互換 API ゲートウェイ                │
│  - 月額 ¥1,980〜、¥500 無料試用                  │
│  - Claude Code・Cursor からコード変更なしで使える│
└──────────────────────────────────────────────────┘
```

---

## 7. `/products/vroom-buzz/` ページ構成

VROOM_BUZZ ブランドガイドライン抽出後に詳細化。現状はプレースホルダのみ：

```
┌──────────────────────────────────────────────────┐
│  vroom.buzz                                      │
│  動画 ＿＿＿（ブランド未確定）                   │
│                                                  │
│  Coming soon. 詳細は近日公開。                   │
│                                                  │
│  [メール通知を受け取る →]                        │
└──────────────────────────────────────────────────┘
```

---

## 8. 移行スケジュール（推奨）

| マイルストーン | 期間目安 | 内容 |
|---|---|---|
| **W1** | 1 週 | Next.js プロジェクト雛形、配色・i18n 整備、トップ + tielink ページのみ |
| **W2** | 1 週 | chotto.ai / vroom.buzz / company / legal ページ |
| **W3** | 0.5 週 | お問い合わせフォーム、PostHog 統合、SEO（robots.txt / sitemap.xml） |
| **W4** | 0.5 週 | GitHub Pages デプロイ、ムームードメインで DNS 切替、現 lolipop サーバ停止 |

tielink プロジェクトの **M5（GA）と並行**で進めるのが現実的。tielink GA と同時に新 tiee.co.jp を公開し、メディア訴求と相乗効果を狙う。

---

## 9. 移行リスク

| リスク | 対策 |
|---|---|
| 旧 tiee.co.jp の SEO 喪失 | 新サイトに `301 redirect` を設定（旧 URL → 新 URL の対応表を移行前に作る） |
| 旧サイトのコンテンツ・画像の所在が不明 | 移行開始前に lolipop から **完全バックアップ**（FTP 経由 zip 取得） |
| ムームードメインでの DNS 切替えに失敗 | TTL を 300 秒に下げて切替え、即時ロールバック可能に |
| Formspree 等 SaaS の費用 | 月数百円程度。問い合わせ件数を見て自前 Workers Function に移行検討 |

---

## 10. tielink プロジェクトとの境界

tielink プロジェクト（`tielink-implementation-plan-v3.md`）と本サイト再設計は **独立して進められる**。優先度順序：

1. **tielink M0〜M3.5**（chotto.ai プリセット込みの未署名 beta）：tielink プロジェクトのみで進行可
2. **tielink M4（未署名 beta release）**：DL リンクは GitHub Releases 直で OK、tiee.co.jp 改修は不要
3. **tielink M5（GA）+ 新 tiee.co.jp 公開**：同時リリースで相乗効果

つまり、tielink M0 を本日着手しても tiee.co.jp 再設計は後追いで間に合う。

---

## 11. 未確定事項

| # | 項目 | 状態 | 備考 |
|---|---|---|---|
| 1 | 旧 tiee.co.jp の現コンテンツ一覧 | ⏳ | lolipop からエクスポート要 |
| 2 | 会社概要の文言 | ⏳ | 登記情報、代表挨拶（peng mu）、設立年月日 |
| 3 | vroom.buzz のブランド完成度 | ⏳ | VROOM_BUZZ_Brand_Guidelines_v4.pptx 抽出待ち |
| 4 | tielink.jp ドメイン取得 | ✅ | 取得済。`/products/tielink/` は `tielink.jp` への 301 redirect を採用、または同一コンテンツミラー（SEO は canonical で `tielink.jp` 優先） |
| 5 | 採用ページの優先度 | 🔵 | v1 は不要、v2（数か月後）で議論 |
| 6 | プレスリリース機構 | 🔵 | RSS フィード必要かどうか |

---

**以上（v0.2）**
