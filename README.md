# tielink

<p align="center">
  <a href="README_UPSTREAM.md">English (upstream)</a> |
  <a href="README_UPSTREAM.md">简体中文 (upstream)</a> |
  <strong>日本語</strong>
</p>

<p align="center">
  <a href="https://github.com/TIE-LINK/tielink/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/TIE-LINK/tielink?style=social"></a>
  <a href="LICENSE.txt"><img alt="License" src="https://img.shields.io/github/license/TIE-LINK/tielink"></a>
  <a href="https://www.python.org/"><img alt="Python" src="https://img.shields.io/badge/Python-3.11%2B-blue?logo=python"></a>
</p>

**tielink** は、Anthropic 公式 Claude Desktop ユーザーが API プロバイダをワンクリックで切り替えられる Windows デスクトップアプリです。chotto.ai をはじめとする Anthropic 互換 API プロバイダを管理し、Claude Desktop に即座に適用できます。

> 本プロジェクトは [lonr-6/cc-desktop-switch](https://github.com/lonr-6/cc-desktop-switch)（MIT License）のフォークです。

## クイックスタート

1. [tielink をダウンロード](https://github.com/TIE-LINK/tielink/releases/latest)
2. プロバイダプリセットを選択（chotto.ai 推奨）
3. API Key を貼付け
4. 「Claude 桌面版 に適用」をクリック
5. Claude Desktop を完全に再起動

## chotto.ai について

chotto.ai は tielink の推奨プロバイダです。Anthropic 互換 API を提供し、Claude Desktop からシームレスに利用できます。

- **登録**: [chotto.ai/sign-up](https://chotto.ai/sign-up?utm_source=tielink&utm_medium=readme)（¥500 無料クレジット付）
- **API Key 取得**: [api.chotto.ai/console/keys](https://api.chotto.ai/console/keys)
- **ドキュメント**: [api.chotto.ai/chotto/docs.html](https://api.chotto.ai/chotto/docs.html)

## ダウンロード

最新リリースは以下から入手できます：

```text
https://github.com/TIE-LINK/tielink/releases/latest
```

- `tielink-Setup-x.x.x.exe` — Windows インストーラ

## 開発

```powershell
git clone https://github.com/TIE-LINK/tielink.git
cd tielink
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## 技術スタック

- バックエンド: Python, FastAPI, httpx, uvicorn
- フロントエンド: HTML, CSS, JavaScript (Vanilla), Bootstrap 5.3
- 設定保存先: `~/.tielink/config.json`
- パッケージング: PyInstaller, NSIS

## ライセンス

MIT License。詳しくは [LICENSE.txt](LICENSE.txt) および [NOTICE](NOTICE) を参照してください。

## 免責事項

本プロジェクトは Anthropic、Claude、CC Desktop Switch、またはサードパーティモデルプロバイダとは提携していません。API キーはお使いのマシンにローカル保存されます。
