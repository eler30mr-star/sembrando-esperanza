name: Generate daily close

on:
  schedule:
    # 05:10 UTC = 00:10 en Perú
    - cron: "10 5 * * *"
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: generate-daily-close
  cancel-in-progress: false

jobs:
  generate:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Generate daily close
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          GEMINI_MODEL: gemini-2.5-flash-lite
        run: python scripts/generate_daily_close.py

      - name: Commit changes
        run: |
          if git diff --quiet; then
            echo "No hay cambios para publicar."
            exit 0
          fi

          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

          git add public/data/es/daily-close/index.json
          git add public/data/en/daily-close/index.json
          git add public/data/pt/daily-close/index.json
          git add public/data/fr/daily-close/index.json

          git commit -m "chore(daily-close): publish $(TZ=America/Lima date +%F)"
          git push
