# copilot-project-demo-frontend

バックエンドの API をブラウザーから試す、ローカル専用の vanilla JavaScript SPA です。アプリ間の認証は実装していません。

## 起動方法

1. `copilot-project-demo-backend` を起動し、API が `http://localhost:3000` で利用できる状態にします。
2. このリポジトリのルートで、Node.js がインストールされた環境から実行します。

   ```sh
   npm start
   ```

3. ブラウザーで <http://localhost:5173> を開きます。
4. トップページから `/api/time`、`/api/greet`、`/api/os` を実行します。API のベース URL は画面上部で変更でき、ブラウザーに保存されます。

フロントエンドサーバーは依存パッケージ不要の Node.js 静的サーバーで、`127.0.0.1:5173` にバインドします。ポートを変える場合は `PORT` 環境変数を指定してください。フロントエンドとバックエンドは別オリジンのため、ブラウザーから接続するにはバックエンド側で `http://localhost:5173` を許可する CORS 設定が必要です。