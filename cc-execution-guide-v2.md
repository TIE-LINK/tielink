# Claude Code 実行指示書 v2 ─ tielink M0〜M3.5（cc-desktop-switch ベース）

> **対象**：Claude Code（cc）
> **作業ディレクトリ**：`D:\claunde\tielink\tielink\`
> **基底**：[lonr-6/cc-desktop-switch](https://github.com/lonr-6/cc-desktop-switch)（MIT, Python + FastAPI + Bootstrap）
> **目的**：cc-desktop-switch を fork し、tielink ブランド + 日本語化 + chotto.ai 既定プリセット + Windows 実機 E2E まで完成させる
> **想定所要時間**：3〜5 営業日
> **作成日**：2026-05-10
> **作成者**：Cowork（peng mu 監督）

---

## 0. これから何をするか（30 秒）

あなた（cc）は、`lonr-6/cc-desktop-switch`（MIT, Python + FastAPI + Vanilla JS + Bootstrap 5.3）を **TIE-LINK org に fork して "tielink" ブランドに改造する**作業を行います。M3.5 完了時点で、以下の状態になっていれば成功です：

1. `D:\claunde\tielink\tielink\` 配下に `tielink/main` ブランチがあり、`python main.py` が起動する
2. UI が日本語表示で、タイトルが "tielink"
3. プロバイダ一覧の最上段に "chotto.ai" がデフォルト選択で表示される
4. ユーザーが API Key を貼付け → 「Claude 桌面版 に適用」を押すと、`%APPDATA%\Anthropic\Claude Desktop\claude_desktop_config.json` に書込まれ、Claude Desktop 再起動後に chotto.ai 経由で応答が返る

**M4（GitHub Actions ビルド + Windows 署名 + リリース）と v1.1（macOS 対応）は本指示書の対象外**。M3.5 完了後に人間（peng mu）にハンドオフします。

> **v1 との違い**：v1（cc-switch ベース）から **基底プロジェクトを変更**しました。背景は `tech-direction-pivot-decision.md` を参照。v1 の cc 指示書は `_archive_v2_cc_switch/cc-execution-guide.md` に退避しています。

---

## 1. 必読ドキュメント（着手前に通読）

最初の 1 タスクで以下をすべて Read してください：

```
1. D:\claunde\tielink\tielink\tielink-implementation-plan-v3.md   ← 本実装方案 v3（最重要）
2. D:\claunde\tielink\tielink\tech-direction-pivot-decision.md    ← なぜ cc-switch から cc-desktop-switch に転換したか
3. D:\claunde\tielink\tielink\chotto-ai-cooperation-spec.md       ← chotto.ai 側協力指示書
4. D:\claunde\tielink\tielink\tiee-co-jp-redesign-sketch.md       ← 関連 — 製品サイト構想
5. D:\claunde\chotto-ai\api-chotto-ai\chotto-ai-project-summary.md ← chotto.ai 全体像
```

**もし上記いずれかが読めない場合は、ここで停止してユーザーに確認してください。**

特に重要なのは v3 の **§4.2 改変の侵襲度ポリシー** と **§7 改変対象ファイル詳細リスト**。違反する改変は絶対にしてはいけません。

---

## 2. 不変ルール（**絶対に破らない**）

### DO
- ✅ **データ層**：`backend/api_adapters/` のプロバイダ追加・並び順変更（既存削除はしない）
- ✅ **資源層**：`frontend/assets/icons/*`、`frontend/css/tielink-theme.css`（新規）、`backend/i18n/locales/ja.json`（既存追記）
- ✅ **設定層**：`main.py` の `APP_NAME`、`installer.nsi` の `PRODUCT_NAME`、`build.spec` の name/icon、`frontend/index.html` の title
- ✅ **ブランチ衛生**：`tielink/main` で作業。`main` は触らない（上流追従専用）
- ✅ **Conventional Commits**：`feat(branding): ...`、`feat(preset): ...`、`docs: ...`、`chore: ...`
- ✅ **小さく commit**：1 タスク = 1 commit

### DON'T
- ❌ **コア層を触らない**：
  - `backend/registry.py`（または同等：Claude Desktop 設定書込みロジック）— **絶対に触らない**
  - `backend/proxy/` または `backend/gateway/`（実験ゲートウェイ）
  - `main.py` のウィンドウ生成・トレイ生成・シングルインスタンスロックロジック（APP_NAME 変更だけは OK）
  - PyWebView や pystray の呼び出し方
- ❌ **既存上流プロバイダを削除しない**：DeepSeek, Kimi, 智谱, 阿里云, Qiniu, SiliconFlow を残す。順序を変えるだけ
- ❌ **既存 i18n（en.json, zh-CN.json）を削除しない**：`ja.json` を**追記**するだけ
- ❌ **Bootstrap 既定 CSS を破壊しない**：tielink 用 CSS は **`frontend/css/tielink-theme.css` で `--bs-*` 変数オーバーライド**のみ。既存 CSS ファイルは原則触らない
- ❌ **`main` ブランチに直接 commit しない**
- ❌ **個人情報・パスワードをコミットしない**：`~/.tielink/config.json`、`.env`、API Key は `.gitignore` 必須
- ❌ **`requirements.txt` に依存追加しない**（v1.0 では）：上流の依存ツリーをそのまま維持

### 困った時
- 「上流コア層を改変しないと出来ない」と思ったら **必ず手を止めてユーザーに確認**
- ファイル名・パスが想定と違う、ディレクトリ構造が想定と違う場合も **手を止めてユーザーに確認**
- `python main.py` が起動しない、`pip install` が落ちた場合は、エラー全文をユーザーに見せて指示を仰ぐ

---

## 3. 事前準備（**ユーザーに依頼する手順**）

### 3-A. cc-desktop-switch を TIE-LINK org に fork
> ユーザーへ：以下を実施してください。
> 1. https://github.com/lonr-6/cc-desktop-switch にアクセス
> 2. 右上「Fork」ボタンを押下
> 3. Owner = `TIE-LINK`、Repository name = `tielink` に設定
> 4. 「Copy the main branch only」のチェックを **外す**
> 5. Create fork
> 6. 完了したら `https://github.com/TIE-LINK/tielink` を cc に教えてください

### 3-B. ローカル環境前提
- **Python 3.11+**（cc-desktop-switch の requirements.txt が 3.11 想定）
- **pip**、できれば `python -m venv` で仮想環境を作成
- **Git**（`user.name`、`user.email = info@tiee.co.jp`）
- **Windows の場合**（v1 のメインターゲット）：
  - **NSIS**（インストーラ生成、M4 で必要）：`choco install nsis` または手動 DL
  - **WebView2 ランタイム**（Edge ベース、Windows 11 には標準同梱）

確認コマンド：
```bash
python --version    # 3.11+
pip --version
git --version
```

---

## 4. M0：Bootstrap（実作業 0.5 日）

**ゴール**：fork されたレポをローカルに clone、`tielink/main` ブランチを作成、依存関係インストール、`python main.py` で **未改変の cc-desktop-switch** が起動することを確認、計画ドキュメント 5 件を初回 commit。

### M0-1. Clone と remote 設定
```bash
git clone https://github.com/TIE-LINK/tielink.git .
git remote add upstream https://github.com/lonr-6/cc-desktop-switch.git
git fetch upstream
git fetch upstream --tags
git remote -v
```

> ❗ **clone 後、上流の `LICENSE.txt` が "MIT" であることを確認**：`grep -i "MIT License" LICENSE.txt` が一致すること。

### M0-2. tielink/main ブランチ
```bash
git checkout -b tielink/main
git push -u origin tielink/main
```

### M0-3. 計画ドキュメントを commit
```bash
git add *.md _archive_v2_cc_switch/
git commit -m "docs: tielink プロジェクト計画ドキュメント v3 を追加"
git push origin tielink/main
```

### M0-4. Python 環境セットアップ
```bash
python -m venv .venv
.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

### M0-5. 起動確認
```bash
python main.py
```

期待動作：
- デスクトップウィンドウが開く（PyWebView ベース）
- システムトレイにアイコンが現れる（pystray）
- ウィンドウタイトルは **"CC Desktop Switch"**（M1 で tielink 化）
- いくつかのプロバイダが見える

### M0-6. リポジトリ実構造を調査・記録
主要ファイルのパスと変数名を grep で特定し記録する。

### M0 完了条件
- [ ] `git remote -v` に origin と upstream が見える
- [ ] `tielink/main` ブランチが origin に push されている
- [ ] 計画ドキュメントが commit・push されている
- [ ] `python main.py` で未改変 cc-desktop-switch UI が表示される
- [ ] 主要ファイルの実在パスを記録した報告がある

→ 全部 ✅ なら M1 へ。

---

## 5. M1：Brand-only build（実作業 1.0 日）

**ゴール**：製品名・インストーラ名・アイコン・LICENSE 表記だけが tielink になっている状態。

### M1-1. main.py の APP_NAME / ウィンドウタイトル
- `APP_NAME = "tielink"`、`APP_VERSION = "1.0.0"`
- トレイラベル日本語化、mutex 名変更
- ❗ ウィンドウサイズ、URL、シングルインスタンスロック等のロジックは触らない

### M1-2. installer.nsi
- PRODUCT_NAME, PRODUCT_VERSION, PRODUCT_DIR, PRODUCT_PUBLISHER, OutFile 等を tielink 化

### M1-3. build.spec
- EXE 名を `tielink` に

### M1-4. アイコン差し替え
- `scripts/gen_placeholder_icon.py` で SVG/PNG/ICO 生成

### M1-5. frontend/index.html の title
- `<title>tielink</title>`、`lang="ja"`、`data-bs-theme="dark"`

### M1-6. tielink-theme.css（新規）
- Bootstrap 5.3 変数オーバーライド、ダーク基調 + #FF4D2E オレンジ

### M1-7. LICENSE と NOTICE
- LICENSE.txt 末尾に TIE 改変表記追記、NOTICE 新規作成

### M1-8. README 差し替え
- README.md → README_UPSTREAM.md、新しい日本語 README.md 作成

### M1 完了条件
- [ ] ウィンドウタイトルが "tielink"
- [ ] Bootstrap の primary 色がオレンジ系
- [ ] cc-desktop-switch の機能は元のまま
- [ ] LICENSE.txt と NOTICE が存在

---

## 6. M2：日本語拡張（実作業 0.5 日）

**ゴール**：既存 i18n に ja を追加、既定言語を ja に。

### M2-1. 既存 ja の有無確認 → ケース B（不在）
- `backend/i18n.py` の TRANSLATIONS に `"ja"` 追加
- `frontend/js/i18n.js` の dictionaries に `"ja"` 追加

### M2-2. tielink 固有キー追加
- `tielink.*` 名前空間の文言を ja/en 両方に追加

### M2-3. 既定言語を ja に
- `frontend/js/i18n.js`：`currentLanguage = "ja"`
- `backend/config.py`：`DEFAULT_CONFIG["settings"]["language"] = "ja"`
- ブラウザ言語自動検出 + localStorage 永続化

### M2-4. 言語切替ボタンに「日」追加
- `frontend/index.html` の言語切替に ja ボタン追加

### M2 完了条件
- [ ] OS locale ja_JP の Windows で UI が日本語
- [ ] 言語切替 ja↔en↔zh が動作
- [ ] tielink 名前空間の文言が UI 上で参照可能

---

## 7. M3：chotto.ai プリセット + UI 統合（実作業 1.5 日）

**ゴール**：プロバイダ最上段に chotto.ai が既定選択で表示、接続テスト動作、Welcome / Dashboard CTA / Footer 帯。

### M3-1. プロバイダ定義の構造調査 → `backend/config.py` BUILTIN_PRESETS

### M3-2. chotto.ai プリセット追加
- `BUILTIN_PRESETS` の index 0 に chotto.ai を追加
- `load_config()` で初回起動時に chotto.ai を自動登録

### M3-3. プリセットアイコン
- `frontend/assets/preset-icons/chotto-ai.svg` に chotto.ai favicon を流用

### M3-4. 接続テスト機能
- 既存 `POST /api/providers/test` を再利用（新規エンドポイント不要）

### M3-5. ダッシュボード CTA（サイドバー不在のためダッシュボードページに配置）

### M3-6. 永続フッター帯（M1-6 で index.html に追加済みの HTML）

### M3-7. Welcome 画面（初回起動）
- `frontend/js/branding/welcome.js` 新規

### M3-8. 既定選択を chotto.ai に
- 新規ユーザー：`activeProvider = "chotto-ai"`
- 既存ユーザー：前回設定を継承

### M3-9. ローカル設定ディレクトリ変更
- `~/.cc-desktop-switch/` → `~/.tielink/`

### M3-10. E2E 検証（ユーザー協力必須）

### M3 完了条件
- [ ] M3-10 の E2E 全項目 ✅
- [ ] `git diff main..tielink/main --stat` で改変ファイル数が 20 以下

---

## 8. ハンドオフ：M3.5 完了報告（**必須出力**）

M3.5 完了後、cc は以下を `m3-handoff-report.md` に作成：
- 完了日、改変サマリ、E2E 検証結果、既知の制限、次のステップ

---

## 9. 困った時のフォールバック

### 9-A. ファイル構造が想定と違う
- **やる**：実構造を `git ls-files` で示し、ユーザーに確認
- **やらない**：「これだろう」と推測して改変

### 9-B. コア層を改変しないと出来ないと思った
- **やる**：手を止めて、何故そう思ったかを説明、回避案を提案、ユーザーに選択させる
- **やらない**：「とりあえず改変」する

### 9-C. `python main.py` が落ちた / `pip install` が落ちた
- **やる**：エラーログ全文をユーザーに見せる、最後の改変を要約、revert か別解かを聞く
- **やらない**：エラーで動かないままさらに改変を重ねる

---

**以上**

着手前に必ず本指示書 + v3 plan を通読してください。**判断に迷ったら手を動かす前にユーザーに質問する**ことが、いきなり実装するよりも常に正解です。
