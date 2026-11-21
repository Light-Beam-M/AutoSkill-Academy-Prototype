@echo off
rem Opens the AutoSkill App prototype. ES modules don't load from file://, so serve the folder locally.
cd /d "%~dp0"
start "" http://localhost:8765/index.html
python -m http.server 8765
