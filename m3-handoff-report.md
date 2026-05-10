# tielink M3.5 ハンドオフレポート

> **完了日**：2026-05-11
> **作成者**：Claude Code (Cowork)
> **対象ブランチ**：`tielink/main`
> **基底**：[lonr-6/cc-desktop-switch](https://github.com/lonr-6/cc-desktop-switch) v1.0.23 (MIT)

---

## 1. 改変サマリ

| マイルストーン | 内容 | commit |
|---|---|---|
| M0 | Bootstrap — fork clone、tielink/main 作成、起動確認、計画ドキュメント commit | `523756b` |
| M1 | Brand-only — 製品名・テーマ・アイコン・LICENSE を tielink 化 | `1890579` |
| M2 | 日本語拡張 — ja ロケール追加・既定言語 ja・言語切替対応 | `0a4737d` |
| M3 | chotto.ai プリセット — プリセット追加・Welcome・CTA・フッター | `eade10a` |

### 改変ファイル数：17（計画文書除く、上限 20 以下）

```
LICENSE.txt                                  10 +
NOTICE                                       10 +
backend/config.py                            35 +/-
backend/i18n.py                             162 +/-
build.spec                                   12 +/-
frontend/assets/icons/app-icon.svg           20 +
frontend/assets/preset-icons/chotto-ai.png  Bin
frontend/assets/preset-icons/chotto-ai.svg   13 +
frontend/css/tielink-theme.css              138 +
frontend/index.html                          21 +/-
frontend/js/branding/chotto-ai-test.js       58 +
frontend/js/branding/dashboard-cta.js        49 +
frontend/js/branding/welcome.js              83 +
frontend/js/i18n.js                         275 +/-
installer.nsi                                28 +/-
main.py                                      20 +/-
scripts/gen_placeholder_icon.py              94 +
```

---

## 2. クリティカルファイル（触っていない）✅

| ファイル | 状態 |
|---|---|
| `backend/registry.py` | **未変更** — Claude Desktop 設定書込みロジック |
| `backend/proxy.py` | **未変更** — ローカルゲートウェイ |
| `frontend/css/style.css` | **未変更** — 既存 3412 行 CSS |
| `requirements.txt` | **未変更** — 依存ツリー維持 |
| 既存上流プロバイダ 9 件 | **維持** — DeepSeek/Kimi/Zhipu 等すべて残存 |

---

## 3. E2E 検証結果

### コードレベル検証（cc 単独で確認済）

| # | 項目 | 結果 |
|---|---|---|
| 1 | ウィンドウタイトル "tielink" | ✅ `main.py` APP_NAME = "tielink" |
| 2 | UI が日本語表示 | ✅ ja 辞書追加済・既定言語 ja |
| 3 | chotto.ai がプロバイダ最上段 | ✅ BUILTIN_PRESETS index 0 |
| 4 | Welcome 画面（初回起動時） | ✅ welcome.js 実装済 |
| 5 | 接続テストエンドポイント | ✅ 既存 `/api/providers/test` を再利用 |
| 8 | tielink 終了後も Claude Desktop 動作 | ✅ registry.py 未改変 |
| 10 | 言語切替 ja↔en↔zh | ✅ 両方の切替 UI に ja 追加 |
| 11 | フッター帯 UTM 付き URL | ✅ `?utm_source=tielink&utm_medium=footer` |
| 12 | ダッシュボード CTA UTM 付き URL | ✅ `?utm_source=tielink&utm_medium=dashboard` |
| 13 | Welcome CTA UTM 付き URL | ✅ `?utm_source=tielink&utm_medium=welcome` |
| 14 | git log に secrets なし | ✅ 確認済 |
| 15 | 改変ファイル数 20 以下 | ✅ 17 ファイル |
| 16 | Conventional Commits | ✅ feat(branding/i18n/preset) |

### 実機検証が必要な項目（peng mu 協力）

| # | 項目 | 検証手順 |
|---|---|---|
| 5 | API Key 貼付 → 接続テスト成功 | chotto.ai API Key を入力 → 接続テストボタン押下 |
| 6 | 「適用」→ `claude_desktop_config.json` に chotto.ai 設定 | 適用後、`%APPDATA%\Anthropic\Claude Desktop\claude_desktop_config.json` を確認 |
| 7 | Claude Desktop 再起動 → chotto.ai 経由で応答 | Claude Desktop 再起動後、質問して応答確認 |
| 9 | 別プロバイダ切替動作 | DeepSeek 等で同様に切替・適用・動作確認 |
| — | `python main.py` 実機起動 | Windows 実機で GUI 表示・トレイ動作確認 |

---

## 4. 既知の制限

1. **macOS 未対応** — v1.1 で対応予定
2. **自動更新未実装** — M4 以降で GitHub Actions ビルド + リリース
3. **コード署名なし** — Windows 未署名のため SmartScreen 警告が出る（M5 で OV 署名予定）
4. **アイコンはプレースホルダー** — 正式デザイン差し替えが必要
5. **pythonnet ビルド失敗のため pywebview を --no-deps でインストール** — pythonnet 依存機能（.NET 相互運用）は未検証
6. **上流の `ja` 翻訳が完全ではない** — フロントエンド 245 キーは翻訳済。バックエンド 135 キーは翻訳済。ただし上流の動的生成テキスト（app.js のロジックによる動的メッセージ等）は英語のまま残る可能性がある

---

## 5. 次のステップ（提案）

### M4：未署名 beta release（1.0 日）
- GitHub Actions で `python -m PyInstaller build.spec` を実行
- NSIS でインストーラ生成（`makensis installer.nsi`）
- Release ページに `tielink-Setup-1.0.0.exe` をアップロード
- 社内テスターに配布して E2E 検証

### M5：署名 + GA
- Windows OV コード署名証明書を取得
- 署名済みインストーラをリリース

### v1.1：macOS 対応
- macOS 環境でビルド・テスト
- pkg/dmg パッケージング

---

## 6. 上流同期について

`lonr-6/cc-desktop-switch` に新しいリリースがあった場合：

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
git checkout tielink/main
git merge main
# コンフリクト解決 → commit → push
```

改変の侵襲度が低いため、通常は軽微なコンフリクトで済む見込み。

---

**以上**
