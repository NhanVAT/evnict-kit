#!/bin/bash
# LLM Wiki — Auto Run Script
# Called by system scheduler (Task Scheduler / cron)
# Edit WIKI_ROOT below to match your installation path

WIKI_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$WIKI_ROOT/outputs/auto-run.log"

mkdir -p "$WIKI_ROOT/outputs"
echo "$(date '+%Y-%m-%d %H:%M:%S') — Starting /llm-wiki run" >> "$LOG_FILE"

cd "$WIKI_ROOT" || exit 1

claude --print --dangerously-skip-permissions "/llm-wiki run" 2>>"$LOG_FILE" | tail -20 >> "$LOG_FILE"

echo "$(date '+%Y-%m-%d %H:%M:%S') — Completed /llm-wiki run" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"
