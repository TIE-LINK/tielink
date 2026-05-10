# tielink プロジェクト実施方案 (v2) [ARCHIVED]

> **⚠️ アーカイブ注記**：本文書は cc-switch ベースの旧計画です。Anthropic 公式 Claude Desktop が `~/.claude/settings.json` を読まないことが判明したため、tielink は cc-desktop-switch ベース（v3 計画）に基底変更されました。本文書は将来の **tielink-cli 別製品**（CLI ユーザー向け）検討時の参考用に保管。

> **更新日**：2026-05-10（v2：第二回ヒアリング反映）
> **作成者**：Claude (Cowork)
> **承認者**：peng mu（株式会社 TIE, CO., LTD. — Apple Developer Account Holder）
> **基底**：[farion1231/cc-switch](https://github.com/farion1231/cc-switch) v3.14.1（MIT License）
> **対象顧客**：日本国内の Claude Code CLI / Claude Code Desktop（開発者向け）ユーザー
> **戦略**：cc-switch を fork、最小侵襲で chotto.ai 専用ブランド化、上流の継続追従を最重要視
> **関連ドキュメント**：
> - `chotto-ai-cooperation-spec.md`（chotto.ai 側に依頼する協力項目）
> - `tiee-co-jp-redesign-sketch.md`（株式会社 TIE 公式サイト再設計の素描）

## 変更履歴

| 版 | 日付 | 主な変更 |
|---|---|---|
| v1 | 2026-05-10 | 初版作成、4 段階ヒアリング後 |
| v2 | 2026-05-10 | GitHub admin・Windows OV 予算・配色決定（chotto.ai パレット + `#FF4D2E`）・サポートメール `info@tiee.co.jp`・商標 6494075 反映・tiee.co.jp 再設計を別文書に切出し |

---

## 0. エグゼクティブ・サマリー

cc-switch は Tauri 2.8 + React + Rust で構築された、Claude Code / Codex / Gemini CLI など複数 AI コーディング CLI のプロバイダ切替えに特化したクロスプラットフォーム・デスクトップアプリ（Win/macOS/Linux）。MIT ライセンスで、50+ プリセット、システムトレイ、自動アップデータ、i18n フレームワーク（react-i18next）が既に整っている。

本案では cc-switch を **fork** し、以下の改造を **データ駆動・最小コード変更** の方針で実装する：

| 領域 | 方針 |
|---|---|
| ブランド | "tielink"、占位ロゴ＋色調変更で先行、後日正式アセットに差し替え |
| 既定プリセット | chotto.ai（`https://api.chotto.ai`、Anthropic 互換）を最上段・既定値 |
| 環境変数 | 最小集 `ANTHROPIC_BASE_URL` + `ANTHROPIC_AUTH_TOKEN`、モデル名は後端マッピングに委ねる |
| 言語 | 日本語デフォルト、英語切替可 |
| 他プリセット | 全保持・低調表示 |
| 集客導線 | 左サイドバー底部 + 永続フッター帯で chotto.ai の登録/¥500 無料試用を訴求 |
| 配布 | GitHub Releases（[TIE-LINK org](https://github.com/TIE-LINK)）+ 双 platform 署名（macOS は既存 Apple Developer ID、Windows は OV 証明書を並行申請） |

**所要工数の推定**：M0 から M3（未署名 beta）まで実工数 4〜6 営業日。

---

## 1. 立项背景と目標

### 1.1 課題
- chotto.ai の見込み顧客は、Claude Code の「環境変数を手で書き換える」設定が心理的障壁になっている。
- 既存ツール cc-switch は中華圏ユーザー向けで日本語 UI が未整備。

### 1.2 目標
1. **三秒導入**：Claude Code インストール済みのユーザーが、tielink を起動 → API Key を貼付 → 「ON」を押すだけで chotto.ai 経由で Claude Code が動く状態に到達する。
2. **chotto.ai のサブスク・トークン課金へのコンバージョン**を最大化。
3. **乗り換え自由**：他の Anthropic 互換ゲートウェイも使える。
4. **保守コスト最小**：cc-switch の上流リリースに 1 営業日以内で追従できる構造。

### 1.3 非目標（v1 では扱わない）
- Codex / Gemini CLI / OpenCode 等の **CLI 系** の積極推進
- chotto.ai 以外のゲートウェイのプリセット内容を「最新化」する作業
- iOS / Android / Web 版

---

## 2. 技術スタックと事実ベース

### 2.1 cc-switch v3.14.1 の構造

| 層 | 技術 |
|---|---|
| デスクトップシェル | Tauri 2.8（Rust） |
| バックエンド | Rust（serde、tokio、tauri-plugin-{updater,process,dialog,store,log}） |
| フロントエンド | React 18 + TypeScript + Vite |
| UI | TailwindCSS 3.4 + shadcn/ui |
| 状態 | TanStack Query v5 + react-hook-form + zod |
| i18n | react-i18next |

### 2.2 ライセンスと著作権

- 上流ライセンス：**MIT**
- fork 後の `LICENSE` は上流をそのまま残し、末尾に株式会社 TIE の追加 Copyright 行を追記。

### 2.3 Claude Code Desktop との接続点（v2 時点の想定 — **後に v3 で誤り確認**）

Claude Code（CLI および 2026-04 リリースの Desktop 版）は次の優先順位でプロバイダ設定を読むと **想定** していた：
1. プロセス環境変数 `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`
2. `~/.claude/settings.json` の `env` セクション

**注意**：v3 計画で確認された通り、Anthropic 公式 Claude Desktop（GUI）はこの想定が成立しない。本計画は CLI / Claude Code Desktop（開発者向け）専用として理解すべき。

### 2.4 chotto.ai の現状（"chotto-ai-project-summary.md" より）

| キー | 値 |
|---|---|
| API ベース URL | `https://api.chotto.ai` |
| エンドポイント | `/v1/messages`（Anthropic 互換） |
| モデル別名 | `claude-haiku-4-5 → chotto-flash`、`claude-sonnet-4-6 → chotto-pro`、`claude-opus-4-7 → chotto-pro-max` |
| 登録 URL | `https://chotto.ai/sign-up`（¥500 無料クレジット付き） |
| API Key 取得 | `https://api.chotto.ai/console/keys` |
| 料金 LP | `https://api.chotto.ai/pricing` |
| プラン | Starter ¥1,980 / Standard ¥4,980 / Pro ¥9,980（月額） |

---

## 3. 命名・ブランド・ドメイン

| 項目 | 値 | 備考 |
|---|---|---|
| プロダクト名 | **tielink** | 全小文字推奨 |
| Bundle Identifier (macOS) | `jp.tielink.app` | |
| Windows AppID | `jp.tielink.app` | |
| GitHub Org | [`TIE-LINK`](https://github.com/TIE-LINK) | 既設。admin: `info@tiee.co.jp`（**2FA 設定済 ✅**） |
| 配布レポ URL | `https://github.com/TIE-LINK/tielink` | |
| 製品 URL（一次） | **`https://tielink.jp`** | 取得済 ✅ |
| 製品 URL（二次） | `https://tiee.co.jp/tielink/` | tiee.co.jp 再設計後に併設 |
| サポート窓口 | `info@tiee.co.jp` | |
| 商標 | **TIE**（商標登録 6494075、出願 2021-3284、登録 2022-01-04） | "tielink" 単体は別途 J-PlatPat 確認推奨 |

### 3.1 配色パレット

chotto.ai のダーク基調パレット + tielink オレンジ `#FF4D2E` のハイブリッド：

| 役割 | Hex |
|---|---|
| Background base | `#0a0e1a`（Geek Black） |
| Background secondary | `#0f1629` |
| Background elevated | `#161d35` |
| Border | `#1e2a4a` |
| **tielink Primary（CTA / ON 状態）** | **`#FF4D2E`** |
| **tielink Primary Hover** | **`#FF6B4F`** |
| Accent Blue（リンク・通常情報） | `#3b82f6` |
| Accent Cyan | `#06b6d4` |
| Accent Purple | `#8b5cf6` |
| Accent Green（成功） | `#22c55e` |
| Text Primary | `#f1f5f9` |
| Text Secondary | `#94a3b8` |
| Text Muted | `#475569` |

### 3.2 タイポグラフィ

| 用途 | フォント |
|---|---|
| UI Sans | Inter, Noto Sans JP, Hiragino Kaku Gothic ProN |
| Mono | JetBrains Mono, Fira Code |

### 3.3 占位ロゴ

正式アセット完成までの暫定として、chotto.ai のニューラルネットワークメッシュの線画モチーフを継承しつつ、最外層のリンク色を `#FF4D2E` に置換。`tielink-icon-placeholder.{svg,png,icns,ico}` を `src-tauri/icons/` に配置。

---

## 4. Fork & 上流同步戦略（**最重要**）

### 4.1 ブランチ・モデル

```
upstream/main (farion1231/cc-switch)
        │
        └─► origin/main  (TIE-LINK/tielink, mirror — 触らない)
                  │
                  └─► origin/tielink/main  (我々のリリース基盤)
                            │
                            ├─► origin/tielink/<feature>
                            └─► tags  v1.0.0-tielink, ...
```

### 4.2 改変の侵襲度ポリシー（**死守ルール**）

| レベル | やってよい | 避ける |
|---|---|---|
| ✅ **データ層** | `presets/*.json` の追加・並び順制御 | 既存上流プリセットの削除・改変 |
| ✅ **資源層** | `src-tauri/icons/*`、`src/branding/*`、`src/i18n/locales/ja.json` の新規 | 既存 `en.json`/`zh.json` の文字列削除 |
| ✅ **設定層** | `tauri.conf.json` の `productName`、`identifier` 等 | コア機能の挙動を変える Rust マクロや React Hook の改変 |
| ⚠️ **コンポーネント層** | サイドバー底部とフッターに新規 React コンポーネントを追加 | 既存コンポーネント内に分岐・条件追加 |
| ❌ **コア層** | （原則禁止） | コア Rust / IPC / store のロジック改変 |

### 4.3 同期 SOP

毎週月曜 9:00 JST：

```bash
git fetch upstream
git checkout main
git merge --ff-only upstream/main
git push origin main

git checkout tielink/main
git rebase main

# 衝突確認 → 5 分以内に手で解消できる量を超えたら原因調査

pnpm install
pnpm tauri dev

git tag v3.14.2-tielink
git push origin tielink/main --tags
```

---

## 5. 機能仕様

### 5.1 起動時フロー（新規ユーザー）

```
[起動]
  └─► 言語自動判定（OS locale）
  └─► 初回起動か？
        ├─ Yes → ウェルカムページ
        │         "tielink へようこそ"
        │           [chotto.ai に登録（¥500 無料クレジット付）]
        │           [既に持っているのでスキップ]
        └─ No  → メイン画面
```

### 5.2 メイン画面レイアウト

```
┌──────────────────────────────────────────────────────────┐
│  tielink                              ⚙️  ❔  ─ □ ✕  │
├────────────┬─────────────────────────────────────────────┤
│ プリセット │  chotto.ai (デフォルト)         [● ON]     │
│ ━━━━━━━━━ │  ┌───────────────────────────────────────┐  │
│ ● chotto.ai│  │ Base URL:    https://api.chotto.ai    │  │
│ ─ Anthropic│  │ API Key:     [sk-cht-•••••••••]  [🔄] │  │
│ ─ OpenR... │  │                                       │  │
│            │  │ [API Key を取得 →]  [接続テスト]       │  │
│            │  └───────────────────────────────────────┘  │
├────────────┴─────────────────────────────────────────────┤
│ chotto.ai 月額 ¥1,980〜 · ¥500 無料試用中  [詳細を見る] │
└──────────────────────────────────────────────────────────┘
```

### 5.3 chotto.ai プリセットの初期値

```json
{
  "id": "chotto-ai-default",
  "name": "chotto.ai",
  "description": "株式会社TIE が提供する日本向け Anthropic 互換 API ゲートウェイ",
  "category": "claude-code",
  "isDefault": true,
  "pinned": true,
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.chotto.ai",
    "ANTHROPIC_AUTH_TOKEN": ""
  },
  "links": {
    "signup":  "https://chotto.ai/sign-up",
    "apiKey":  "https://api.chotto.ai/console/keys",
    "pricing": "https://api.chotto.ai/pricing",
    "docs":    "https://api.chotto.ai/chotto/docs.html",
    "support": "mailto:info@tiee.co.jp"
  },
  "icon": "chotto-ai.svg"
}
```

### 5.4 接続テスト機能

`POST https://api.chotto.ai/v1/messages` に最小ペイロード（`max_tokens: 1`、システムメッセージ "ping"）を送信。HTTP 200 + 有効な JSON が返れば緑、認証エラー（401/403）なら赤、その他エラーなら黄。**所要時間 < 2 秒**。

### 5.5 「ON / OFF」一鍵切替

cc-switch 既存の挙動を流用：
- ON：`~/.claude/settings.json` の `env.ANTHROPIC_BASE_URL` と `env.ANTHROPIC_AUTH_TOKEN` を上書き
- OFF：それら 2 キーのみ削除

### 5.6 集客導線

| 配置 | 内容 | クリック先 |
|---|---|---|
| サイドバー底部 | "chotto.ai に登録（¥500 無料）" | `https://chotto.ai/sign-up?utm_source=tielink&utm_medium=sidebar` |
| 永続フッター帯 | "chotto.ai 月額 ¥1,980〜 · ¥500 無料試用中" | `https://api.chotto.ai/pricing?utm_source=tielink&utm_medium=footer` |
| ヘルプメニュー | "chotto.ai 公式" / "API Key 発行" / "サポート" | §5.3 links を流用 |

---

## 6. ディレクトリ構造（fork 後）

```
D:\claunde\tielink\tielink\
├── .github/workflows/
│   ├── release.yml
│   └── upstream-sync.yml
├── LICENSE
├── NOTICE
├── README.md
├── README_UPSTREAM.md
├── package.json
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── icons/
│   └── src/                      ← Rust コア（**触らない**）
├── src/
│   ├── App.tsx
│   ├── branding/
│   │   ├── footer-bar.tsx
│   │   ├── sidebar-cta.tsx
│   │   └── welcome-screen.tsx
│   ├── i18n/locales/
│   │   ├── ja.json
│   │   ├── en.json
│   │   └── zh.json
│   └── presets/
│       └── chotto-ai.json
├── tielink-patches/
└── tielink-implementation-plan.md
```

---

## 7. 改変対象ファイル詳細リスト

| # | ファイル | 種別 | 変更内容 |
|---|---|---|---|
| 1 | `package.json` | 設定 | `name`, `version`, `description`, `author`, `homepage` |
| 2 | `src-tauri/Cargo.toml` | 設定 | `name`, `version` |
| 3 | `src-tauri/tauri.conf.json` | 設定 | `productName`, `identifier`, `bundle.icon[]`, `updater.endpoints` |
| 4 | `src-tauri/icons/*` | 資源 | 占位アイコン |
| 5 | `src/i18n/locales/ja.json` | 新規 | 全 UI 文字列の日本語訳 |
| 6 | `src/i18n/index.ts` | 設定 | デフォルト言語を `ja` に |
| 7 | `src/presets/chotto-ai.json` | 新規データ | §5.3 |
| 8 | `src/presets/index.ts` | 設定 | 配列先頭に chotto-ai を pin |
| 9 | `src/branding/*.tsx` | 新規 | フッター帯・CTA・ウェルカム |
| 10 | `src/App.tsx` | 差し込み | フッター帯と sidebar CTA を 1〜2 行で |
| 11 | `LICENSE` | 追記 | TIE 改変表記末尾追加 |
| 12 | `NOTICE` | 新規 | MIT 由来明示 |
| 13 | `README.md` | 置換 | 日本語版 |

---

## 8. マイルストーン

| ID | 期間目安 | 完了条件 |
|---|---|---|
| **M0** ─ Bootstrap | 0.5d | TIE-LINK/tielink レポ作成、cc-switch から fork、`pnpm tauri dev` で起動確認 |
| **M1** ─ Brand-only build | 1.0d | 設定変更 + 占位アイコン、タイトルが "tielink" |
| **M2** ─ ja.json | 1.0d | UI が完全に日本語表示、英語切替も動作 |
| **M3** ─ chotto.ai プリセット + 接続テスト + フッター | 1.5d | 起動 → API Key 貼付 → ON → Claude Code Desktop で動作 |
| **M4** ─ 未署名 beta release | 1.0d | GitHub Actions が tag push で Win/macOS 双方の成果物を生成 |
| **M5** ─ 署名 + GA | 並行 | macOS notarize、Windows OV 取得・署名 |

**v1.0.0-tielink リリース予定**：Windows OV 証明書発行リードタイム（5〜10 営業日）に依存。

---

## 9. CI / CD

### 9.1 GitHub Actions

`.github/workflows/release.yml`：

```yaml
name: Release
on:
  push:
    tags: ['v*-tielink']
jobs:
  build:
    strategy:
      matrix:
        include:
          - os: macos-14
            target: aarch64-apple-darwin
          - os: macos-14
            target: x86_64-apple-darwin
          - os: windows-latest
            target: x86_64-pc-windows-msvc
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
      - uses: dtolnay/rust-toolchain@stable
      - run: pnpm install --frozen-lockfile
      - uses: tauri-apps/tauri-action@v0
        env:
          APPLE_TEAM_ID: TD474525G3
          # ... secrets
        with:
          tagName: ${{ github.ref_name }}
          releaseDraft: true
```

### 9.2 必要な GitHub Secrets

| Secret 名 | 内容 |
|---|---|
| `APPLE_CERT_P12_BASE64` | Developer ID Application 証明書（.p12）を base64 化 |
| `APPLE_CERT_PASSWORD` | .p12 のパスワード |
| `APPLE_ID` | Apple ID |
| `APPLE_APP_SPECIFIC_PWD` | App-specific password |
| `APPLE_SIGNING_IDENTITY` | `"Developer ID Application: TIE, CO., LTD. (TD474525G3)"` |
| `WIN_CERT_PFX_BASE64` | Windows OV 証明書（.pfx）を base64 化 ⚠️ |
| `WIN_CERT_PASSWORD` | .pfx のパスワード ⚠️ |
| `TAURI_UPDATER_KEY` | Tauri 更新マニフェスト署名用秘密鍵 |
| `TAURI_UPDATER_KEY_PASSWORD` | 上記秘密鍵のパスフレーズ |

> ⚠️ **後の v3 で訂正**：2023-06-01 以降、Code Signing は HSM 必須化により .pfx ダウンロード不可。v3.1 では SSL.com eSigner Cloud Signing への移行を採用。

---

## 10. コード署名の詳細

### 10.1 macOS（既存リソースで即実行可能）

| 項目 | 値 |
|---|---|
| 法人名 | TIE, CO., LTD. |
| Team ID | **TD474525G3** |
| 種別 | Apple Developer Program（組織） |
| Account Holder | peng mu |
| 登録更新日 | 2022-12-29 |

### 10.2 Windows（v1 では未取得 → 段階対応）

#### v1.0.0：未署名で先行 GA
- インストーラに SmartScreen 警告。README に手順を記載。

#### v1.0.1 以降：OV 証明書を取得
| 項目 | 推奨 |
|---|---|
| 証明書種別 | **OV（Organization Validation）コードサイニング証明書** |
| 主要 CA | DigiCert / Sectigo / GlobalSign / SSL.com |
| 推定価格 | 年間 ¥30,000〜¥80,000（OV）|
| 取得期間 | 5〜10 営業日 |

> **後の v3 で訂正**：HSM 必須化により Cloud HSM 署名サービス（SSL.com eSigner）が必須。

---

## 11. 自動更新

### 11.1 アーキテクチャ

```
[tielink クライアント]
   └─► 起動時 + 24h ごとにチェック
         GET https://github.com/TIE-LINK/tielink/releases/latest/download/latest.json
   └─► 新版なら notify → ユーザー承認時に自動更新
```

### 11.2 latest.json の生成

`tauri-action` が tag push 時に自動生成。

---

## 12. 上流追従の自動監視

`.github/workflows/upstream-sync.yml` で毎週月曜にチェック、差分があれば自動 issue 起票。

---

## 13. 受け入れ基準（Definition of Done）

| # | 検証項目 | 期待結果 |
|---|---|---|
| 1 | macOS 実機で .dmg をインストール、起動 | UI が日本語表示、タイトル "tielink" |
| 2 | Spotlight 検索 | "tielink" でヒット |
| 3 | chotto.ai プリセットを既定で表示 | リスト最上段、選択済 |
| 4 | API Key 貼付 → 接続テスト | 緑 ✅ |
| 5 | ON → `~/.claude/settings.json` に env が書き込まれている | OK |
| 6 | Claude Code Desktop で "Hello" → 応答 | OK |
| 7 | Claude Code CLI で動作確認 | OK |
| 8 | OFF → settings.json から env が除去 | OK |
| 9 | 初回起動ウェルカム | "chotto.ai に登録" 既定 focus |
| 10 | サイドバー CTA / フッター帯 | utm 付 URL でジャンプ |
| 11 | 言語切替 ja → en | 即座に切替 |
| 12 | Windows 実機で .msi インストール | OK |
| 13 | 自動更新シミュレーション | OK |
| 14 | macOS notarize | "Notarized Developer ID" |
| 15 | UTM 計測 | chotto.ai PostHog で観測 |

---

## 14. リスク登録

| ID | リスク | 影響 | 確率 | 対策 |
|---|---|---|---|---|
| R-1 | Windows OV 証明書の発行遅延 | 中 | 中 | macOS 先行 GA |
| R-2 | cc-switch 上流が大規模 refactor | 中 | 低 | §4.2 侵襲度ポリシー死守 |
| R-3 | Claude Code Desktop が settings.json 読込位置変更 | 高 | 低 | リリースノート監視 |
| R-4 | chotto.ai 側の API URL / モデル別名変更 | 高 | 低 | プリセット遠隔配信を v1.1 で導入 |
| R-5 | MIT 表記漏れによるライセンス違反 | 中 | 極低 | CI で存在チェック |
| R-6 | Apple Developer Program の更新切れ | 高 | 極低 | 期限カレンダー監視 |
| R-7 | utm 経由のユーザー識別不可 | 低 | 中 | PostHog ダッシュボードに保存 |
| R-8 | 商標 "tielink" 派生語の衝突 | 中 | 低 | TIE 6494075 登録済、tielink 派生語サーチ M0 で実施 |
| R-9 | GitHub Org 乗っ取り | 致命 | 低 | `info@tiee.co.jp` の **2FA 必須** |
| R-10 | Apple App-specific password / .p12 流出 | 高 | 低 | GitHub Secrets のみに保管、年次ローテーション |

---

## 15. v1 以降のロードマップ

| バージョン | 主な内容 |
|---|---|
| v1.0.x | バグ修正のみ |
| v1.1 | プリセットの遠隔配信対応 |
| v1.2 | macOS Sparkle 風の段階的リリース |
| v1.3 | tielink 内蔵ダッシュボード |
| v1.4 | 法人 SSO（OIDC）対応 |
| v2.0 | TIE 製品全体のハブへ拡張 |

---

## 16. 参考リンク

- **基底プロジェクト**：[farion1231/cc-switch](https://github.com/farion1231/cc-switch) ／ [LICENSE (MIT)](https://github.com/farion1231/cc-switch/blob/main/LICENSE) ／ [v3.14.1 tag](https://github.com/farion1231/cc-switch/tree/v3.14.1)
- **chotto.ai**：[ランディング](https://chotto.ai) ／ [API Console](https://api.chotto.ai) ／ [Pricing](https://api.chotto.ai/pricing) ／ [Docs](https://api.chotto.ai/chotto/docs.html)
- **Claude Code**：[公式 Docs](https://code.claude.com/docs/en) ／ [Desktop ガイド](https://code.claude.com/docs/en/desktop) ／ [DL ページ](https://claude.com/download)
- **Tauri**：[2.x ドキュメント](https://v2.tauri.app/) ／ [Updater Plugin](https://v2.tauri.app/plugin/updater/)
- **Apple**：[Developer ID 概要](https://developer.apple.com/developer-id/) ／ [Notarization](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)
- **社内文書**：`D:\claunde\chotto-ai\api-chotto-ai\chotto-ai-project-summary.md`

---

## 17. 付録 A：M0 で実行する具体的コマンド

```bash
# 1. ローカル作業ディレクトリ準備
cd D:\claunde\tielink\tielink

# 2. fork & clone
git clone https://github.com/TIE-LINK/tielink.git .
git remote add upstream https://github.com/farion1231/cc-switch.git
git fetch upstream

# 3. tielink ブランチ作成
git checkout -b tielink/main

# 4. 依存関係
pnpm install
cargo --version  # 1.78+ 推奨

# 5. ローカル起動
pnpm tauri dev

# 6. README plan を初回コミット
git add tielink-implementation-plan.md
git commit -m "docs: 添付実施方案 v1"

# 7. M1（branding）に着手
```

---

## 18. 付録 B：商標・名称チェック

`tielink` は短くキャッチー。リリース前に以下を確認：

1. **J-PlatPat** で「tielink」「タイリンク」「ティーリンク」を検索（区分 9: ソフトウェア、42: SaaS）
2. **USPTO TESS** で同名検索
3. **github.com/tielink** および npm `tielink` パッケージ名のスクワット状況
4. ドメイン：`tielink.jp`、`tielink.io`、`tielink.app`

このうち少なくとも 1 と 4 は M0 と並行で実施推奨。

---

## 19. 質問・未確定事項のリスト（v2 で更新）

| # | 項目 | 状態 | 備考 |
|---|---|---|---|
| 1 | TIE-LINK GitHub org admin | ✅ **解決** | admin: `info@tiee.co.jp`、2FA 設定済 |
| 2 | 占位ロゴの色 | ✅ **解決** | chotto.ai ダーク基調 + tielink オレンジ `#FF4D2E` |
| 3 | Windows 証明書の予算 | ✅ **解決** | OV ¥30〜80k/年、SSL.com OV 推奨 |
| 4 | chotto.ai 側の協力 | ✅ **解決** | 別文書 `chotto-ai-cooperation-spec.md` |
| 5 | 公式サイト DL ページ | ✅ **解決** | tiee.co.jp 全面再設計、別文書 |
| 6 | サポートメール | ✅ **解決** | `info@tiee.co.jp` |
| 7 | 商標 | ✅ **解決** | TIE 商標 6494075 登録済 |
| 8 | VROOM_BUZZ ブランド詳細 | ⏳ **保留** | OneDrive パス到達不可 |
| 9 | tielink.jp ドメイン取得 | ✅ **解決** | 取得済 |
| 10 | chotto.ai 専用 LP の作成主体 | ⏳ **保留** | 別文書参照 |

---

## 20. v2 で追加した運用上の注意

### 20.1 セキュリティ（最重要）
- **`info@tiee.co.jp` の Google アカウント／GitHub アカウントは 2FA 必須**。バックアップコードは紙で印刷し金庫保管。
- パスワードはパスワードマネージャに一元管理。
- Apple .p12 と Windows .pfx は **GitHub Secrets のみに保管**（後の v3 で eSigner Cloud に移行）。
- admin 権限は **常に 2 名以上が保有**（バス係数対策）。

### 20.2 ライフサイクル監視
| 期限 | アクション | 担当 |
|---|---|---|
| Apple Developer Program 更新 | 毎年 12 月 | peng mu |
| Windows OV 証明書 更新 | 取得日から 1 年 | peng mu |
| Tauri Updater 鍵ローテーション | 2 年に 1 度 | tielink 開発担当 |
| ドメイン更新（tiee.co.jp、tielink.jp） | 毎年 | peng mu |

---

**以上（v2、ARCHIVED）**
