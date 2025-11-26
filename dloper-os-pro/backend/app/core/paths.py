from pathlib import Path

# Resolve project directories relative to the backend/app package
BASE_DIR = Path(__file__).resolve().parents[2]
CONFIG_DIR = BASE_DIR / "config"
DATA_DIR = BASE_DIR / "data"
SITES_DIR = DATA_DIR / "sites"
FILES_DIR = DATA_DIR / "files"
BACKUPS_DIR = DATA_DIR / "backups"
DB_PATH = DATA_DIR / "db.sqlite3"
