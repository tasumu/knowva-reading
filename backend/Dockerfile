# Python 3.12 slim イメージをベースに使用
FROM python:3.12-slim

# 作業ディレクトリを設定
WORKDIR /app

# システム依存パッケージをインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# uv をインストール（高速なパッケージマネージャー）
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# 依存関係ファイルとソースコードをコピー
COPY pyproject.toml .
COPY src/ ./src/

# 依存関係をインストール（editable モードでパッケージをインストール）
RUN uv pip install --system --no-cache -e .

# Cloud Run が使用するポート
ENV PORT=8080
EXPOSE 8080

# アプリケーションを起動
CMD ["uvicorn", "knowva.main:app", "--host", "0.0.0.0", "--port", "8080"]
