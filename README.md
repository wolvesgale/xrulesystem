# MU_replace

このリポジトリには Next.js 14 + Tailwind CSS で構築した「もち団子フェア」デモアプリケーションが含まれています。

## セットアップ

```bash
cd mochi-dango-fair-demo
npm install
npm run dev
```

http://localhost:3000 にアクセスするとトップページが表示されます。

- `/admin`: 管理者ビュー。催事スケジュールの登録、カレンダー表示、ルールフォームを確認できます。
- `/agent`: 代理店ビュー。自身の担当スケジュールとチェックリストを確認できます。

## プロジェクト構成

```
mochi-dango-fair-demo/
  app/           # Next.js App Router のページ/レイアウト
  components/    # UI コンポーネント
  lib/           # デモデータ管理
  public/        # 静的ファイル
```

Node.js 18 以降を利用することを推奨します。
