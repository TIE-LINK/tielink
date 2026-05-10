# Claude Code 実行指示書 ─ tielink M0〜M3 [ARCHIVED]

> **⚠️ アーカイブ注記**：本文書は cc-switch ベースの旧計画用 cc 指示書です。tielink は cc-desktop-switch ベース（v3）に基底変更されたため、現行の指示書は親ディレクトリの `cc-execution-guide-v2.md` を参照してください。本文書は将来の **tielink-cli 別製品** 検討時の参考用に保管。

> **対象**：Claude Code（cc）
> **作業ディレクトリ**：`D:\claunde\tielink\tielink\`
> **目的**：cc-switch を fork し、tielink ブランド + 日本語化 + chotto.ai 既定プリセットまで完成
> **想定所要時間**：実作業 4〜6 営業日
> **作成日**：2026-05-10
> **作成者**：Cowork 計画担当（peng mu 監督）

---

## 0. これから何をするか（30 秒）

あなた（cc）は、`farion1231/cc-switch`（MIT, Tauri 2 + React 18 + Rust）を **TIE-LINK org に fork して "tielink" ブランドに改造する**作業を行います。M3 完了時点で、以下の状態になっていれば成功です：

1. `D:\claunde\tielink\tielink\` 配下に `tielink/main` ブランチがあり、`pnpm tauri dev` が起動する
2. UI が日本語表示で、タイトルが "tielink"
3. プリセット一覧の最上段に "chotto.ai" がデフォルト選択で表示される
4. ユーザーが API Key を貼付け → ON ボタンを押すと、Claude Code Desktop で chotto.ai 経由のリクエストが動く

**M4（GitHub Actions ビルド + 署名）と M5（GA リリース）は本指示書の対象外**。

---

## 1. 必読ドキュメント（着手前に通読）

```
1. D:\claunde\tielink\tielink\tielink-implementation-plan.md  （本実装方案 v2）
2. D:\claunde\tielink\tielink\chotto-ai-cooperation-spec.md   （chotto.ai 側協力指示書）
3. D:\claunde\tielink\tielink\tiee-co-jp-redesign-sketch.md   （関連 — 製品サイト構想）
4. D:\claunde\chotto-ai\api-chotto-ai\chotto-ai-project-summary.md  （chotto.ai 全体像）
```

特に重要：v2 の **§4.2 改変の侵襲度ポリシー** と **§7 改変対象ファイル詳細リスト**。

---

## 2. 不変ルール（**絶対に破らない**）

### DO
- ✅ **データ層**を触る：`presets/*.json`（プリセット定義）の追加・並び順変更、既定値変更
- ✅ **資源層**を追加する：`src-tauri/icons/*`、`src/branding/*`、`src/i18n/locales/ja.json`
- ✅ **設定層**を変える：`package.json`、`Cargo.toml`、`tauri.conf.json` のメタ情報
- ✅ **ブランチ衛生**：すべての変更を `tielink/main` ブランチで行う。`main` は触らない
- ✅ **Conventional Commits**：`feat(branding): ...`、`feat(preset): ...`、`docs: ...`、`chore: ...`
- ✅ **小さく commit**：1 タスク = 1 commit

### DON'T
- ❌ **コア層を触らない**：`src-tauri/src/**/*.rs`、shadcn 由来の UI コンポーネント
- ❌ **既存上流プリセットを削除しない**
- ❌ **既存 i18n（en.json, zh.json）を削除しない**
- ❌ **`main` ブランチに直接 commit しない**
- ❌ **個人情報・パスワードをコミットしない**

### 困った時
- 「上流を改変しないとできない」と判断した瞬間は **必ず手を止めてユーザーに聞く**
- ファイル名・パスが想定と違う場合も **手を止めてユーザーに聞く**
- ビルドが落ちた場合は、エラーログをユーザーに見せて指示を仰ぐ

---

## 3. 事前準備（**ユーザーに依頼する手順**）

### 3-A. cc-switch を TIE-LINK org に fork
> ユーザーへ：
> 1. https://github.com/farion1231/cc-switch にアクセス
> 2. 右上「Fork」ボタンを押下
> 3. Owner = `TIE-LINK`、Repository name = `tielink`
> 4. 「Copy the main branch only」のチェックを **外す**
> 5. Create fork

### 3-B. ローカル環境前提
- **Node.js 20+** + **pnpm 9+**
- **Rust stable**
- **Git**（user.email = `info@tiee.co.jp`）
- **macOS**：Xcode Command Line Tools
- **Windows**：Visual Studio Build Tools 2022 + WebView2

### 3-C. ローカル GPG / SSH 鍵（commit 署名用、推奨）

---

## 4. M0：Bootstrap（実作業 0.5 日）

**ゴール**：clone、`tielink/main` ブランチ作成、`pnpm install` を通し、`pnpm tauri dev` で **未改変の cc-switch UI** が起動、計画ドキュメント commit。

### M0-1. Clone と remote 設定
```bash
cd /sessions/gallant-festive-dirac/mnt/tielink
mkdir -p _planning_temp
mv tielink-implementation-plan.md chotto-ai-cooperation-spec.md \
   tiee-co-jp-redesign-sketch.md cc-execution-guide.md _planning_temp/

git clone https://github.com/TIE-LINK/tielink.git .
git remote add upstream https://github.com/farion1231/cc-switch.git
git fetch upstream

git remote -v
```

### M0-2. tielink/main ブランチ作成
```bash
git checkout -b tielink/main
git push -u origin tielink/main
```

### M0-3. 計画ドキュメントを戻して初回 commit
```bash
mv _planning_temp/*.md ./
rmdir _planning_temp

git add *.md
git commit -m "docs: tielink プロジェクト初期計画ドキュメント 4 種を追加"
git push origin tielink/main
```

### M0-4. 依存関係インストール
```bash
pnpm install --frozen-lockfile
```

### M0-5. dev 起動確認
```bash
pnpm tauri dev
```

期待動作：
- アプリウィンドウが開く
- タイトルバーに "CC Switch" あるいは類似の表示（まだ tielink になっていない）
- プリセットがいくつか見える

### M0-6. 上流のディレクトリ構造を実調査
```bash
git ls-files | head -50
git ls-files src/ | head -100
git ls-files src-tauri/ | head -50
```

主要ファイルの実在パスをユーザーに報告：
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- i18n の locales フォルダ
- presets / providers が定義されている場所
- App ルートコンポーネント

### M0 完了条件 ✅
- [ ] `git remote -v` に origin と upstream が見える
- [ ] `tielink/main` ブランチが origin に push されている
- [ ] 計画ドキュメント 4 件が commit され、push されている
- [ ] `pnpm tauri dev` で **未改変 cc-switch UI** が表示される
- [ ] 主要ファイルの実在パスを記録した報告

---

## 5. M1：Brand-only build（実作業 1.0 日）

**ゴール**：UI は cc-switch のままだが、**製品名・bundle ID・アイコン・LICENSE 表記**だけが tielink。

### M1-1. package.json を tielink 化
```jsonc
{
  "name": "tielink",
  "version": "0.1.0",
  "description": "Claude Code Desktop 用プロバイダ切替アプリ。chotto.ai 既定対応。",
  "author": "TIE, CO., LTD. <info@tiee.co.jp>",
  "homepage": "https://tielink.jp",
  "repository": {
    "type": "git",
    "url": "https://github.com/TIE-LINK/tielink.git"
  },
  "license": "MIT"
}
```

> **DO NOT**：`scripts`、`dependencies`、`devDependencies` は触らない。

### M1-2. src-tauri/Cargo.toml
```toml
[package]
name = "tielink"
version = "0.1.0"
description = "Claude Code Desktop 用プロバイダ切替アプリ"
authors = ["TIE, CO., LTD. <info@tiee.co.jp>"]
license = "MIT"
edition = "2021"
```

### M1-3. src-tauri/tauri.conf.json
```jsonc
{
  "productName": "tielink",
  "version": "0.1.0",
  "identifier": "jp.tielink.app",
  "app": {
    "windows": [
      {
        "title": "tielink"
      }
    ]
  },
  "bundle": {
    "active": true,
    "category": "DeveloperTool",
    "copyright": "Copyright (c) 2024 farion1231 (cc-switch). Modifications copyright (c) 2026 TIE, CO., LTD.",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

### M1-4. アイコン差し替え（占位）
```python
# scripts/gen_placeholder_icon.py（新規作成）
from pathlib import Path
import subprocess

SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF4D2E"/>
      <stop offset="50%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="220" fill="#0a0e1a"/>
  <circle cx="512" cy="512" r="320" fill="none" stroke="url(#g)" stroke-width="40"/>
  <text x="512" y="600" text-anchor="middle"
        font-family="Inter,Arial" font-weight="900" font-size="420"
        fill="#f1f5f9" letter-spacing="-12">t</text>
</svg>'''

OUT = Path("src-tauri/icons")
OUT.mkdir(exist_ok=True)
(OUT / "icon.svg").write_text(SVG)

sizes = [(32, "32x32.png"), (128, "128x128.png"),
         (256, "128x128@2x.png"), (1024, "icon.png")]
for size, name in sizes:
    subprocess.run(["rsvg-convert", "-w", str(size), "-h", str(size),
                    str(OUT / "icon.svg"), "-o", str(OUT / name)], check=True)
```

### M1-5. LICENSE と NOTICE
```bash
cat >> LICENSE << 'EOF'

---

Modifications copyright (c) 2026 TIE, CO., LTD.

This product is a derivative work of cc-switch (https://github.com/farion1231/cc-switch),
licensed under the MIT License.
EOF

cat > NOTICE << 'EOF'
tielink
Copyright (c) 2026 TIE, CO., LTD.

This product is a derivative work of:
  cc-switch — https://github.com/farion1231/cc-switch
  Copyright (c) 2024 farion1231
  Licensed under the MIT License (see LICENSE)

tielink customizations:
  - Brand replacement (icons, identifier, product name)
  - Default Japanese localization (ja.json)
  - chotto.ai (https://chotto.ai) preset added as default
  - Sidebar CTA + footer banner for chotto.ai onboarding

For tielink-specific issues:    info@tiee.co.jp
For underlying cc-switch issues: https://github.com/farion1231/cc-switch/issues
EOF
```

### M1-6. README 差し替え
```bash
git mv README.md README_UPSTREAM.md

cat > README.md << 'EOF'
# tielink

Claude Code Desktop 用プロバイダ切替アプリ。chotto.ai を既定対応。

- 公式：https://tielink.jp
- ダウンロード：https://github.com/TIE-LINK/tielink/releases/latest
- お問い合わせ：info@tiee.co.jp

## ベース技術

本アプリは [farion1231/cc-switch](https://github.com/farion1231/cc-switch)（MIT）の fork です。

詳細：[tielink-implementation-plan.md](./tielink-implementation-plan.md)
EOF
```

### M1-7. 検証 + commit
```bash
pnpm tauri dev
# → タイトルが "tielink"
# → アイコンが新アイコン
# → 機能は cc-switch のまま動く

git add -A
git commit -m "feat(branding): tielink ブランド名・bundle ID・占位アイコン適用"
git push origin tielink/main
```

### M1 完了条件 ✅
- [ ] ウィンドウタイトルが "tielink"
- [ ] Dock / タスクバーアイコンが占位の橙〜紫グラデーション
- [ ] cc-switch の機能は元のまま動く
- [ ] LICENSE と NOTICE が存在
- [ ] commit が push されている

---

## 6. M2：日本語化（実作業 1.0 日）

**ゴール**：UI 全体が日本語表示。設定画面で英語切替も可能。

### M2-1. i18n 構造の調査
```bash
find src/ -type d -name "locales" -o -type d -name "i18n"
cat src/i18n/locales/en.json | head -50
```

### M2-2. ja.json 作成
**`en.json` を起点に翻訳**：

```bash
cp src/i18n/locales/en.json src/i18n/locales/ja.json
```

`Read` で開き、すべての値を日本語に翻訳。

翻訳ガイドライン：
- "Preset" → 「プリセット」
- "Provider" → 「プロバイダ」
- "API Key" → 「API キー」
- "Switch" / "Enable" → 「有効化」
- "Disable" → 「無効化」
- "Settings" → 「設定」
- "Help" → 「ヘルプ」

### M2-3. デフォルト言語を ja に
```ts
i18n.init({
  resources: { en, zh, ja },
  lng: getInitialLanguage(),
  fallbackLng: 'ja',
});

function getInitialLanguage(): string {
  const stored = localStorage.getItem('tielink:lang');
  if (stored && ['ja', 'en', 'zh'].includes(stored)) return stored;
  const sys = navigator.language?.split('-')[0];
  if (['ja', 'en', 'zh'].includes(sys)) return sys;
  return 'ja';
}
```

### M2-4. 言語切替 UI
```tsx
// src/branding/language-switcher.tsx（新規）
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <select
      value={i18n.language}
      onChange={(e) => {
        i18n.changeLanguage(e.target.value);
        localStorage.setItem('tielink:lang', e.target.value);
      }}
    >
      <option value="ja">日本語</option>
      <option value="en">English</option>
    </select>
  );
}
```

### M2-5. 検証 + commit
```bash
pnpm tauri dev

git add -A
git commit -m "feat(i18n): 日本語ロケール追加・既定言語を ja に"
git push origin tielink/main
```

### M2 完了条件 ✅
- [ ] OS locale ja_JP で UI が完全に日本語
- [ ] 設定画面で英語に切替えられる
- [ ] 改変ファイル数が 10 以下

---

## 7. M3：chotto.ai プリセット + 接続テスト + フッタ + Welcome（実作業 1.5 日）

### M3-1. プリセット定義の構造調査
```bash
grep -rn "anthropic" src/ --include="*.ts" --include="*.tsx" --include="*.json" | head -20
grep -rn "ANTHROPIC_BASE_URL" src/ --include="*.ts" --include="*.tsx" --include="*.json" | head -20
```

### M3-2. chotto.ai プリセット追加
```jsonc
// src/presets/builtin/chotto-ai.json
{
  "id": "chotto-ai-default",
  "name": "chotto.ai",
  "displayName": "chotto.ai",
  "description": "株式会社 TIE が提供する日本向け Anthropic 互換 API ゲートウェイ。¥500 無料試用付き。",
  "category": "claude-code",
  "isDefault": true,
  "pinned": true,
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.chotto.ai",
    "ANTHROPIC_AUTH_TOKEN": ""
  },
  "links": {
    "signup":  "https://chotto.ai/sign-up?utm_source=tielink&utm_medium=preset_signup",
    "apiKey":  "https://api.chotto.ai/console/keys",
    "pricing": "https://api.chotto.ai/pricing?utm_source=tielink&utm_medium=preset_pricing",
    "docs":    "https://api.chotto.ai/chotto/docs.html",
    "support": "mailto:info@tiee.co.jp"
  },
  "icon": "chotto-ai.svg"
}
```

プリセット読込ロジックの **配列の先頭** に挿入。

### M3-3. プリセットアイコン
```bash
cp .../chotto-ai/public/logo.svg src/assets/preset-icons/chotto-ai.svg
```

### M3-4. 接続テスト機能
```ts
// src/branding/chotto-ai-test.ts（新規）
export async function testChottoAiConnection(apiKey: string): Promise<{
  ok: boolean;
  latencyMs: number;
  error?: string;
}> {
  const start = performance.now();
  try {
    const res = await fetch('https://api.chotto.ai/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Anthropic-Version': '2023-06-01',
        'User-Agent': `tielink/${import.meta.env.VITE_APP_VERSION ?? 'dev'}`,
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }],
      }),
      signal: AbortSignal.timeout(5000),
    });
    const latencyMs = Math.round(performance.now() - start);
    if (res.status === 401 || res.status === 403)
      return { ok: false, latencyMs, error: 'API キーが無効です' };
    if (!res.ok)
      return { ok: false, latencyMs, error: `HTTP ${res.status}` };
    return { ok: true, latencyMs };
  } catch (e: any) {
    return { ok: false, latencyMs: -1, error: e.message ?? '接続エラー' };
  }
}
```

### M3-5. サイドバー CTA
```tsx
// src/branding/sidebar-cta.tsx（新規）
import { useTranslation } from 'react-i18next';

export function ChottoAiSidebarCta() {
  const { t } = useTranslation();
  return (
    <a
      href="https://chotto.ai/sign-up?utm_source=tielink&utm_medium=sidebar"
      target="_blank" rel="noopener noreferrer"
      className="block px-3 py-2 mt-auto rounded-lg
                 bg-gradient-to-r from-[#FF4D2E] to-[#8b5cf6]
                 text-white text-sm font-medium hover:opacity-90"
    >
      {t('cta.signupChottoAi')}
    </a>
  );
}
```

### M3-6. 永続フッター帯
```tsx
// src/branding/footer-bar.tsx（新規）
export function ChottoAiFooterBar() {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-t
                    border-[#1e2a4a] bg-[#0f1629] text-xs text-[#94a3b8]">
      <span>chotto.ai 月額 ¥1,980〜 · ¥500 無料試用中</span>
      <a
        href="https://api.chotto.ai/pricing?utm_source=tielink&utm_medium=footer"
        target="_blank" rel="noopener noreferrer"
        className="text-[#3b82f6] hover:underline"
      >
        詳細を見る →
      </a>
    </div>
  );
}
```

### M3-7. ウェルカム画面（初回起動）
```tsx
// src/branding/welcome-screen.tsx（新規）
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function WelcomeScreen() {
  const { t } = useTranslation();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('tielink:welcome_seen')) setShown(true);
  }, []);

  if (!shown) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-[#0a0e1a]/95 backdrop-blur">
      <div className="max-w-md p-8 rounded-xl bg-[#161d35] border border-[#1e2a4a]">
        <h1 className="text-2xl font-bold text-[#f1f5f9] mb-2">tielink へようこそ</h1>
        <p className="text-[#94a3b8] mb-6">
          Claude Code Desktop で chotto.ai を 3 秒で。
        </p>
        <div className="space-y-2">
          <a
            href="https://chotto.ai/sign-up?utm_source=tielink&utm_medium=welcome"
            target="_blank" rel="noopener noreferrer"
            onClick={() => { localStorage.setItem('tielink:welcome_seen', '1'); setShown(false); }}
            className="block py-3 px-4 rounded-lg bg-[#FF4D2E] hover:bg-[#FF6B4F]
                       text-white text-center font-semibold"
          >
            chotto.ai に登録（¥500 無料クレジット付）
          </a>
          <button
            onClick={() => { localStorage.setItem('tielink:welcome_seen', '1'); setShown(false); }}
            className="block w-full py-3 px-4 rounded-lg border border-[#1e2a4a]
                       text-[#94a3b8] hover:text-[#f1f5f9]"
          >
            既に持っているのでスキップ
          </button>
        </div>
      </div>
    </div>
  );
}
```

### M3-8. ja.json に CTA 文言を追加
```jsonc
{
  "cta": {
    "signupChottoAi": "chotto.ai に登録（¥500 無料）",
    "openConsole": "コンソールを開く",
    "testConnection": "接続テスト"
  },
  "welcome": {
    "title": "tielink へようこそ",
    "subtitle": "Claude Code Desktop で chotto.ai を 3 秒で。",
    "signupCta": "chotto.ai に登録（¥500 無料クレジット付）",
    "skip": "既に持っているのでスキップ"
  },
  "footer": {
    "promo": "chotto.ai 月額 ¥1,980〜 · ¥500 無料試用中",
    "details": "詳細を見る →"
  }
}
```

### M3-9. E2E 検証（**ユーザー協力必須**）
> **ユーザーへ**：
> 1. chotto.ai のアカウント／API Key を準備
> 2. tielink を `pnpm tauri dev` で起動
> 3. ウェルカム画面 → 「既に持っているのでスキップ」
> 4. プリセット最上段「chotto.ai」が選択済
> 5. API Key 貼付 → 「接続テスト」 → 緑 ✅
> 6. ON ボタン
> 7. **`~/.claude/settings.json`** に以下が書き込まれている：
>    ```json
>    "env": {
>      "ANTHROPIC_BASE_URL": "https://api.chotto.ai",
>      "ANTHROPIC_AUTH_TOKEN": "sk-..."
>    }
>    ```
> 8. Claude Code Desktop でチャット → 応答が返る
> 9. ターミナル `claude --version && claude "say hi"` も確認
> 10. OFF → settings.json から env が除去
> 11. UTM 計測：chotto.ai PostHog で `utm_source=tielink`

### M3-10. commit
```bash
git add -A
git commit -m "feat(preset): chotto.ai 既定プリセット + 接続テスト + Welcome / Sidebar / Footer"
git push origin tielink/main
```

### M3 完了条件 ✅
- [ ] M3-9 の E2E が全項目 ✅
- [ ] 改変ファイル数が 15 以下、新規ファイル中心
- [ ] `pnpm tauri build` が macOS / Windows どちらかで通る

---

## 8. ハンドオフ：M3 完了報告（**必須出力**）

`D:\claunde\tielink\tielink\m3-handoff-report.md` を作成：

```markdown
# tielink M3 完了報告

完了日: YYYY-MM-DD
完了者: Claude Code

## 完了したこと
- M0 / M1 / M2 / M3 の各タスク

## 改変サマリ
- 新規ファイル: N
- 改変既存ファイル: M
- 改変行数: +A / -B
- `git diff main..tielink/main --stat` の出力

## E2E 検証結果
- 項目 1〜12 の OK / NG

## 既知の制限
- まだ未対応のこと

## 次のステップ（M4 提案）
- GitHub Actions で CI ビルド
- macOS Apple Developer ID 署名 + notarize
- Windows OV 証明書取得・署名
- 自動更新（Tauri Updater + GitHub Releases endpoint）
- v1.0.0-tielink タグでリリース

## 質問・要相談
- ...
```

---

## 9. 困った時のフォールバック

### 9-A. ファイル構造が想定と違う
- **やる**：実構造を `git ls-files src/ | head -50` で示し、ユーザーに確認
- **やらない**：勝手に推測して改変

### 9-B. 上流コードを改変しないと出来ないと思った
- **やる**：手を止めて、3 行で説明、回避案を 1〜2 案提案
- **やらない**：「とりあえず改変」する

### 9-C. ビルドが落ちた
- **やる**：エラーログ全文をユーザーに見せる
- **やらない**：エラーで動かないままさらに改変を重ねる

### 9-D. 翻訳の語彙に迷った
- **やる**：v2 plan を参考に、迷ったらユーザーに 2〜3 案で選んでもらう
- **やらない**：自分のセンスで創作

### 9-E. chotto.ai の API 仕様が想定と違う
- **やる**：`chotto-ai-project-summary.md` の §6 を再確認
- **やらない**：自分で chotto.ai のサーバを叩いて確かめる（最小限のみ）

---

## 10. 付録：git config 推奨値

```bash
git config user.name "TIE Development"
git config user.email "info@tiee.co.jp"
git config commit.gpgsign true   # 鍵がある場合
```

---

## 11. 付録：参照ドキュメント

| ファイル | 用途 |
|---|---|
| `tielink-implementation-plan.md` | **真実の単一ソース** |
| `chotto-ai-cooperation-spec.md` | chotto.ai 側に依頼 P0 項目 |
| `tiee-co-jp-redesign-sketch.md` | tielink プロジェクト**外側**の話（M0〜M3 では参照不要） |
| `D:\claunde\chotto-ai\api-chotto-ai\chotto-ai-project-summary.md` | chotto.ai API 全体像 |
| `D:\chotto-ai\` | chotto.ai LP（参照のみ） |

---

## 12. 付録：完了後 cc が報告すべきこと（チェックリスト）

M3 完了時点で：

- [ ] origin = `TIE-LINK/tielink`、upstream = `farion1231/cc-switch`
- [ ] 作業ブランチは `tielink/main`
- [ ] 全 commit が Conventional Commits 形式
- [ ] 計画ドキュメント 4 件が repo に commit 済
- [ ] `pnpm tauri dev` で UI が日本語、chotto.ai が既定選択
- [ ] E2E（M3-9）の 12 項目が全 ✅
- [ ] 改変ファイル数が 15 以下
- [ ] secrets / API Key / パスワードが repo に紛れていない
- [ ] m3-handoff-report.md を作成

---

**以上（ARCHIVED — v3 cc-execution-guide-v2.md に置換）**
