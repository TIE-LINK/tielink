# chotto.ai 側 協力指示書 — tielink デスクトップアプリ連携

> **宛先**：chotto.ai 開発担当
> **更新日**：2026-05-10（v2：cc-desktop-switch ベースへの変更に伴う修正）
> **作成者**：tielink プロジェクト（Cowork）
> **目的**：tielink との連携で chotto.ai 側に対応を依頼する項目を網羅
> **関連**：`D:\claunde\chotto-ai\api-chotto-ai\chotto-ai-project-summary.md`

---

## 0. tielink とは

tielink は、**Anthropic 公式 Claude Desktop（GUI）** ユーザーが API プロバイダを **API Key 貼付 → 「適用」ボタン** だけで切り替えられる Windows デスクトップアプリ。`lonr-6/cc-desktop-switch`（MIT, Python + FastAPI + Bootstrap）の fork。chotto.ai は既定プロバイダとして最上段に配置される。

---

## 1. chotto.ai 側に依頼する対応項目

### P0 ─ M3 までに必須

#### P0-1. `https://chotto.ai/sign-up` ルート確認
- `?utm_source=tielink&utm_medium=sidebar` を受け付けること
- フォーム送信完了後も `utm_*` を保持（cookie または postMessage）

#### P0-2. PostHog で `utm_source=tielink` を識別可能に
- 保存済 Insight 3 件：登録完了率 / 課金転換率 / DAU
- `posthog.capture('sign_up_complete', { utm_source, utm_medium })`
- `client_app=tielink` プロパティの付与

#### P0-3. User-Agent 計測
- tielink が付与する `User-Agent: tielink/<version>` をアクセスログに記録
- Go バックエンドでパース：`client_app=tielink`

#### P0-4. API Key 発行 URL の確定
- `https://api.chotto.ai/console/keys` が安定しているか確認
- 未ログインユーザーが直接アクセスした場合のリダイレクト対応

---

### P1 ─ v1.0.0 GA までに望ましい

#### P1-1. tielink 専用 LP セクション
- chotto.ai LP に「Claude Desktop で使う」セクション追加
- tielink ダウンロードへの導線

#### P1-2. ドキュメント連携
- `https://api.chotto.ai/chotto/docs.html` に「tielink を使う場合」の章を追加

#### P1-3. tielink 経由率の可視化
- 管理画面に tielink 経由リクエスト比率の統計カード追加

---

### P2 ─ v1.1 以降での検討

#### P2-1. ワンクリック登録（OAuth-like フロー）
- tielink 起動 → chotto.ai OAuth → API Key 自動発行 → tielink に callback

#### P2-2. プリセットの遠隔配信
- `https://api.chotto.ai/cdn/tielink-preset.json` でモデル別名・価格等を遠隔更新

---

## 2. chotto.ai 側で「やらなくてよい」こと

- API スキーマ変更（Anthropic 互換のままで OK）
- 認証方式変更（`Authorization: Bearer <key>` で OK）
- モデル別名変更（claude-* → chotto-* マッピング維持）
- 課金体系変更

---

## 3. tielink 側でやり、chotto.ai に影響が出ること

| tielink の動作 | chotto.ai への影響 |
|---|---|
| `User-Agent: tielink/<version>` 送出 | アクセスログで識別可能に |
| `utm_source=tielink` 付き URL | LP でパラメータ受取必要 |
| 接続テスト（最小 ping） | rate limit に影響しない想定 |

---

## 4. 連絡先

- tielink 側 PM：peng mu（`mupeng@toki.waseda.jp`）
- 実装窓口：`info@tiee.co.jp`
- GitHub Issue：`TIE-LINK/tielink`

**緊急停止フロー**：
1. chotto.ai 側で当該 API Key を無効化
2. nginx で `User-Agent: tielink/*` を一時的に 503
3. tielink 側で hot-fix（最大 24 時間）

---

**以上**
