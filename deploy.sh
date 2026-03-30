#!/bin/bash
cd "$(dirname "$0")"

echo "📦 Публикую изменения..."

git add -A

# Если нет изменений — выходим
if git diff --cached --quiet; then
  echo "✅ Нет новых изменений — сайт уже актуален."
  exit 0
fi

TIMESTAMP=$(date '+%d.%m.%Y %H:%M')
git commit -m "Обновление $TIMESTAMP"

git push

echo ""
echo "✅ Готово! Сайт обновится через ~1 минуту:"
echo "   https://mpkabanova-cell.github.io/Project1/"
