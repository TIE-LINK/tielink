# tielink プロジェクト実施方案 (v3)

> **更新日**：2026-05-10（v3：cc-desktop-switch ベースへ転換）
> **作成者**：Claude (Cowork)
> **承認者**：peng mu（株式会社 TIE, CO., LTD.）
> **基底**：[lonr-6/cc-desktop-switch](https://github.com/lonr-6/cc-desktop-switch) v1.0.23（MIT License）
> **対象顧客**：日本国内の **Anthropic 公式 Claude Desktop（GUI、Code タブ内蔵版）** ユーザー
> **戦略**：cc-desktop-switch を fork、最小侵襲で chotto.ai 専用ブランド化、Windows 先行、macOS は v1.1
> **関連ドキュメント**：
> - `tech-direction-pivot-decision.md`（v2 → v3 への転換判断記録）
> - `chotto-ai-cooperation-spec.md`（chotto.ai 側に依頼する協力項目）
> - `tiee-co-jp-redesign-sketch.md`（株式会社 TIE 公式サイト再設計の素描）
> - `_archive_v2_cc_switch/`（cc-switch ベースの旧計画 — 将来の CLI 派生商品で再利用可）

## 変更履歴

| 版 | 日付 | 主な変更 |
|---|---|---|
| v1 | 2026-05-10 | 初版（cc-switch ベース） |
| v2 | 2026-05-10 | GitHub admin・配色・商標等の確定情報反映（cc-switch ベース） |
| **v3** | **2026-05-10** | **基底を cc-switch → cc-desktop-switch に変更** |

---

## 0. v2 → v3 への転換サマリー

**転換理由**：peng mu の実機検証で、Anthropic 公式 Claude Desktop が `~/.claude/settings.json` も環境変数 `ANTHROPIC_BASE_URL` も読まないことが確認された。cc-desktop-switch が Claude Desktop の隠れた設定ファイル（`%APPDATA%\Anthropic\Claude Desktop\claude_desktop_config.json`）に直接書込む方式で機能を実現していることを確認し、これを fork する。

| 観点 | v2（cc-switch、廃案） | **v3（cc-desktop-switch、採用）** |
|---|---|---|
| ターゲット | Claude Code CLI / Claude Code Desktop | **Anthropic Claude Desktop（GUI 一般版）** |
| 動作実績 | ❌ Claude Desktop で機能しない | ✅ peng mu の実機検証済（Windows）|
| バックエンド | Rust + Tauri | **Python + FastAPI + uvicorn** |
| フロントエンド | React + TypeScript + shadcn/ui + Tailwind | **Vanilla JavaScript + Bootstrap 5.3** |
| パッケージング | Tauri ネイティブ bundle | **PyInstaller + NSIS** |
| バイナリサイズ | 〜10 MB | 〜50–100 MB |
| 既存 i18n | en + zh | **zh + en（ja 不在）** |
| macOS 対応 | 公式・成熟 | 維持者依存・v1.1 で対応 |
| コミュニティ規模 | 大、活発 | 小、個人プロジェクト |

---

## 1. プロジェクト目標

1. **三秒導入**：Claude Desktop ユーザーが API Key を貼付 → 「適用」を押すだけで chotto.ai 経由で動作
2. **chotto.ai のサブスク・トークン課金へのコンバージョン**を最大化
3. **乗り換え自由**：他の Anthropic 互換ゲートウェイも使えるようにし、「ロックインしない」価値を打ち出す
4. **保守コスト最小**：cc-desktop-switch の上流リリースに 1 営業日以内で追従できる構造

### 1.1 非目標（v1 では扱わない）
- macOS リリース（v1.1 で対応）
- Linux 対応
- Claude Code CLI への対応 → 別製品 `tielink-cli` で v2 検討

---

## 2. 技術スタックと事実ベース

### 2.1 cc-desktop-switch v1.0.23 の構造

| 層 | 技術 | 主要ファイル |
|---|---|---|
| エントリ | Python `main.py`（PyWebView + pystray トレイ） | `main.py` |
| バックエンド | FastAPI + uvicorn + httpx | `backend/`（11 ファイル、フラット構造） |
| フロントエンド | Vanilla JavaScript + Bootstrap 5.3 | `frontend/index.html` + `frontend/js/*.js` + `frontend/css/style.css` |
| i18n | Python/JS 辞書 | `backend/i18n.py` + `frontend/js/i18n.js`（zh + en のみ） |
| プロバイダ定義 | Python dict（`backend/config.py` BUILTIN_PRESETS） | 9 件 |
| Claude Desktop 設定書込み | Python | `backend/registry.py` |
| ローカル設定保存 | JSON | `~/.cc-desktop-switch/config.json` |
| パッケージング | PyInstaller + NSIS | `build.spec`、`installer.nsi` |

### 2.2 ライセンス
- 上流ライセンス：**MIT**（`LICENSE.txt`）
- fork 後の `LICENSE.txt` は上流をそのまま残し、末尾に TIE の追加 Copyright 行を追記

### 2.3 Claude Desktop との接続点

```
[ユーザー] → API Key 貼付け → [tielink] → claude_desktop_config.json に書込み
→ [Claude Desktop] → 起動時に設定読み込み → [chotto.ai API] → 応答
```

tielink を閉じても Claude Desktop は引き続き chotto.ai 経由で動作する（安定パス仕様）。

### 2.4 chotto.ai の現状

| キー | 値 |
|---|---|
| API ベース URL | `https://api.chotto.ai` |
| エンドポイント | `/v1/messages`（Anthropic 互換）|
| モデル別名 | `claude-haiku-4-5 → chotto-flash`、`claude-sonnet-4-6 → chotto-pro`、`claude-opus-4-7 → chotto-pro-max` |
| 登録 URL | `https://chotto.ai/sign-up`（¥500 無料クレジット付） |
| API Key 取得 | `https://api.chotto.ai/console/keys` |

---

## 3. 命名・ブランド・ドメイン

| 項目 | 値 | 備考 |
|---|---|---|
| プロダクト名 | **tielink** | 全小文字推奨 |
| Windows AppID | `jp.tielink.app` | NSIS レジストリ uninstall key |
| GitHub Org | [`TIE-LINK`](https://github.com/TIE-LINK) | admin: `info@tiee.co.jp` |
| 配布レポ URL | `https://github.com/TIE-LINK/tielink` | tag: `v1.0.0-tielink` |
| 製品 URL | **`https://tielink.jp`** | 取得済 ✅ |
| サポート窓口 | `info@tiee.co.jp` | |
| 商標 | **TIE**（商標登録 6494075）| |

### 3.1 配色パレット

```css
:root {
  --bs-body-bg: #0a0e1a;
  --bs-body-color: #f1f5f9;
  --bs-border-color: #1e2a4a;
  --bs-primary: #FF4D2E;
  --bs-primary-rgb: 255, 77, 46;
  --bs-secondary-bg: #0f1629;
  --bs-tertiary-bg: #161d35;
  --tielink-accent-blue: #3b82f6;
  --tielink-accent-purple: #8b5cf6;
  --tielink-accent-cyan: #06b6d4;
  --tielink-accent-green: #22c55e;
}
```

### 3.2 タイポグラフィ

| 用途 | フォント |
|---|---|
| UI Sans | Inter, Noto Sans JP, Hiragino Kaku Gothic ProN |
| Mono | JetBrains Mono, Fira Code |

---

## 4. Fork & 上流同期戦略

### 4.1 ブランチモデル

```
upstream/main (lonr-6/cc-desktop-switch)
        └─► origin/main  (TIE-LINK/tielink, mirror — 触らない)
                  └─► origin/tielink/main  (リリース基盤)
```

### 4.2 改変の侵襲度ポリシー

| レベル | やってよい | 避ける |
|---|---|---|
| ✅ **データ層** | `backend/config.py` のプロバイダ追加・並び順制御 | 既存上流プロバイダの削除・改変 |
| ✅ **資源層** | `frontend/assets/icons/*`、`frontend/css/tielink-theme.css`、i18n に ja 追加 | 既存 zh/en の削除 |
| ✅ **設定層** | `installer.nsi`、`build.spec`、`main.py` の APP_NAME | コア機能の挙動変更 |
| ⚠️ **コンポーネント層** | 新規 HTML/JS で CTA・Welcome を挿入 | 既存ページロジックの差し替え |
| ❌ **コア層** | 原則禁止 | `backend/registry.py`、`backend/proxy.py`、main.py のウィンドウ制御 |

---

## 5. 機能仕様

### 5.1 起動時フロー

```
[起動: python main.py]
  └─► 言語自動判定（OS locale → ja_JP なら ja）
  └─► 初回起動？（~/.tielink/config.json 存在チェック）
        ├─ Yes → Welcome 画面
        │         "tielink へようこそ"
        │         [chotto.ai に登録（¥500 無料）] ← 既定（オレンジ）
        │         [既に持っているのでスキップ]
        └─ No  → メイン画面（最後に有効化したプロバイダを表示）
```

### 5.2 メイン画面

```
┌──────────────────────────────────────────────────────────┐
│ tielink                              ⚙️ 🌐 ❔ ─ □ ✕    │
├────────────┬─────────────────────────────────────────────┤
│ プロバイダ │  chotto.ai (デフォルト)         [✓ 適用済]  │
│ ━━━━━━━━━ │  Base URL: https://api.chotto.ai             │
│ ● chotto.ai│  API Key: [sk-cht-•••••••••]         [👁]  │
│ ─ DeepSeek │  モデル: claude-haiku-4-5 / sonnet-4-6 / ...│
│ ─ Kimi     │  [🔗 API Key を取得]  [⚡ 接続テスト]        │
│ ─ ...      │  [✅ Claude 桌面版 に適用]                   │
├────────────┴─────────────────────────────────────────────┤
│ chotto.ai 月額 ¥1,980〜 · ¥500 無料試用中  [詳細を見る]  │
└──────────────────────────────────────────────────────────┘
```

### 5.3 chotto.ai プリセット定義

```python
{
    "id": "chotto-ai",
    "name": "chotto.ai",
    "baseUrl": "https://api.chotto.ai",
    "authScheme": "bearer",
    "apiFormat": "anthropic",
    "models": {
        "sonnet": "claude-sonnet-4-6",
        "haiku": "claude-haiku-4-5",
        "opus": "claude-opus-4-7",
        "default": "claude-sonnet-4-6",
    },
    "extraHeaders": {"User-Agent": "tielink/1.0.0"},
    "isBuiltin": True,
}
```

### 5.4 接続テスト

既存 `POST /api/providers/test` エンドポイントを再利用。chotto.ai の `/v1/messages` に最小ペイロード ping を送信し、レイテンシと成功/失敗を返す。

### 5.5 Claude Desktop 設定書込み（**コア層、改変しない**）

`backend/registry.py` の既存 `apply_config()` 関数をそのまま利用。

### 5.6 集客導線

| 配置 | 内容 | クリック先 |
|---|---|---|
| ダッシュボード CTA | "chotto.ai に登録（¥500 無料）" | sign-up?utm_source=tielink&utm_medium=dashboard |
| 永続フッター帯 | "chotto.ai 月額 ¥1,980〜 · ¥500 無料試用中" | pricing?utm_source=tielink&utm_medium=footer |
| Welcome 画面 CTA | "chotto.ai に登録（¥500 無料クレジット付）" | sign-up?utm_source=tielink&utm_medium=welcome |

---

## 6. ディレクトリ構造（fork 後・改変後）

```
D:\claunde\tielink\tielink\
├── _archive_v2_cc_switch/        ← v2 計画群（参考）
├── LICENSE.txt                   ← 上流 MIT + TIE 改変表記
├── NOTICE                        ← 新規
├── README.md                     ← 日本語
├── README_UPSTREAM.md            ← 上流 README
├── main.py                       ← APP_NAME 等変更
├── build.spec                    ← name 変更
├── installer.nsi                 ← PRODUCT_NAME 等変更
├── backend/
│   ├── config.py                 ← BUILTIN_PRESETS + CONFIG_DIR
│   ├── i18n.py                   ← ja 追加
│   └── registry.py               ← 触らない
├── frontend/
│   ├── index.html                ← title, lang, CSS/JS 参照
│   ├── css/
│   │   └── tielink-theme.css     ← 新規
│   ├── js/
│   │   ├── i18n.js               ← ja 追加
│   │   └── branding/             ← 新規
│   │       ├── welcome.js
│   │       ├── dashboard-cta.js
│   │       └── chotto-ai-test.js
│   └── assets/
│       ├── icons/                ← 占位アイコン
│       └── preset-icons/         ← chotto-ai.svg
└── m3-handoff-report.md          ← M3.5 完了報告
```

---

## 7. 改変対象ファイル詳細リスト

| # | ファイル | 種別 | 変更内容 |
|---|---|---|---|
| 1 | `main.py` | 設定 | APP_NAME, APP_VERSION, トレイラベル, mutex 名 |
| 2 | `installer.nsi` | 設定 | 全 PRODUCT_* 定義 |
| 3 | `build.spec` | 設定 | EXE 名 |
| 4 | `frontend/assets/icons/*` | 資源 | 占位アイコン |
| 5 | `frontend/index.html` | 設定 | title, lang, theme, CSS/JS 参照, フッター HTML |
| 6 | `frontend/css/tielink-theme.css` | 新規 | Bootstrap 変数オーバーライド |
| 7 | `frontend/js/branding/*.js` | 新規 | Welcome, CTA, 接続テスト |
| 8 | `backend/i18n.py` | 既存追記 | ja キー追加 |
| 9 | `frontend/js/i18n.js` | 既存追記 | ja 辞書 + 既定言語変更 |
| 10 | `backend/config.py` | 追記+設定 | chotto.ai プリセット + CONFIG_DIR |
| 11 | `frontend/assets/preset-icons/chotto-ai.svg` | 新規 | chotto.ai アイコン |
| 12 | `LICENSE.txt` | 追記 | TIE 改変表記 |
| 13 | `NOTICE` | 新規 | MIT 由来明示 |
| 14 | `README.md` | 置換 | 日本語 README |
| 15 | `README_UPSTREAM.md` | リネーム | 上流 README 保存 |

---

## 8. マイルストーン

| ID | 期間目安 | 完了条件 |
|---|---|---|
| **M0** ─ Bootstrap | 0.5d | fork clone、tielink/main 作成、起動確認、計画ドキュメント commit |
| **M1** ─ Brand-only | 1.0d | 製品名・アイコン・テーマ・LICENSE を tielink 化 |
| **M2** ─ ja 拡張 | 0.5d | 日本語ロケール追加、既定言語 ja |
| **M3** ─ chotto.ai プリセット | 1.5d | プリセット + Welcome + CTA + Footer |
| **M3.5** ─ E2E 検証 | 0.5d | 実機で全項目確認 + ハンドオフレポート |
| **M4** ─ 未署名 beta release | 1.0d | GitHub Actions で Windows .exe 生成 |
| **M5** ─ 署名 + GA | 証明書次第 | Windows OV 署名適用 |

---

## 9. 受け入れ基準（Definition of Done）

| # | 検証項目 | 期待結果 |
|---|---|---|
| 1 | Windows 実機で起動 | UI が日本語、タイトル "tielink" |
| 2 | chotto.ai プリセットを既定で表示 | リスト最上段、選択済 |
| 3 | API Key 貼付 → 接続テスト | 緑 ✅ + レイテンシ表示 |
| 4 | 「適用」→ claude_desktop_config.json に書込み | chotto.ai 設定確認 |
| 5 | Claude Desktop 再起動 → 応答 | chotto.ai 経由で動作 |
| 6 | tielink を閉じても Claude Desktop 動作継続 | OK |
| 7 | 別プロバイダ切替動作 | DeepSeek 等で動作 |
| 8 | Welcome 画面 | 初回起動時のみ表示 |
| 9 | ダッシュボード CTA / フッター帯 | 表示・クリックで正しい URL（utm 付） |
| 10 | 言語切替 ja ↔ en | 即座に切替 |
| 11 | 改変ファイル数 | 20 以下 |

---

## 10. リスク登録

| ID | リスク | 対策 |
|---|---|---|
| R-1 | Anthropic が設定領域を閉じる | chotto.ai 直 LP への迂回手順を README に併記 |
| R-2 | cc-desktop-switch 上流が大幅変更 | 侵襲度ポリシー死守、tielink-patches/ 維持 |
| R-3 | 上流が止まる | tielink fork が独立メンテに移行する備え |
| R-4 | PyInstaller バイナリ誤検知 | コード署名（M5）が解決策 |
| R-5 | macOS 対応遅延 | v1.0 は Windows 一本 |

---

**以上（v3）**
