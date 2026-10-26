"""
Configuration for the FYDP-3 Bangla Sign Language Recognition backend.

Update WEIGHTS_PATH and SCALER_PATH to point to your trained model
artifacts. These files are produced by the Colab training notebook.
"""

import os
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────
# Where the notebook saved model weights & scaler
# Update these to wherever you downloaded them from Google Drive.
BASE_MODEL_DIR = Path(os.environ.get(
    "MODEL_DIR",
    str(Path(__file__).resolve().parent / "models")
))

TRANSFORMER_WEIGHTS = BASE_MODEL_DIR / "Transformer_best.weights.h5"
TRANSFORMER_FULL    = BASE_MODEL_DIR / "Transformer_full_model.keras"
GRU_WEIGHTS         = BASE_MODEL_DIR / "GRU_best.weights.h5"
GRU_FULL            = BASE_MODEL_DIR / "GRU_full_model.keras"
LSTM_WEIGHTS        = BASE_MODEL_DIR / "LSTM_best.weights.h5"
LSTM_FULL           = BASE_MODEL_DIR / "LSTM_full_model.keras"
SCALER_PATH         = BASE_MODEL_DIR / "feature_scaler.pkl"

# ── Model hyper-parameters (must match the notebook) ─────────────────
SEQUENCE_LENGTH = 30        # frames per clip
NUM_FEATURES    = 225       # keypoints per frame: Pose(99) + Left Hand(63) + Right Hand(63)
NUM_CLASSES     = 100       # sign language classes

# ── Action labels (order must match training label_map) ──────────────
ACTIONS = [
    "Apa",
    "Banan Kora",
    "Bangla",
    "Besorkari",
    "Biday",
    "Bibhag",
    "Biggan",
    "Biggani",
    "Biroti",
    "Bishesh Shikkha",
    "Bisoy",
    "Blackboard",
    "Bohiskar",
    "Boi",
    "Calculator",
    "Calendar",
    "Chapakhana",
    "Chatrabas",
    "Chok",
    "Chuti",
    "Computer",
    "Dairi",
    "Darowan",
    "Dhonnobad",
    "Din-Somoy",
    "Diploma",
    "Durotto",
    "Duster",
    "Email",
    "English",
    "Fail",
    "Fax",
    "Form",
    "Ganit",
    "GDP",
    "Gobeshok",
    "Graduation",
    "Honours",
    "Internet",
    "Ishara Vasha",
    "Jatiyo Songit",
    "Jogajog",
    "Kagoj",
    "Kali",
    "Khata",
    "Kindergarten",
    "Kolom",
    "Kritokarjo",
    "Laptop",
    "Library",
    "Logo",
    "Madhyomik Bidyalay",
    "Marker",
    "Mas",
    "Masters",
    "Mathapichu Ay",
    "Medhabi",
    "Mobile",
    "Nibondhon",
    "Nirokkhor",
    "Nokol",
    "Notice",
    "Odhyokkho",
    "Pass",
    "Pencil",
    "Pholaphol",
    "Pora",
    "Poridorshok",
    "Porikkha",
    "Potaka",
    "Prathomik Bidyalay",
    "Prokash Kal",
    "Proshongshapotro",
    "Protibedon",
    "Protidin",
    "Raat",
    "Rabar",
    "Radio",
    "Roll Number",
    "Routine",
    "School",
    "Shakkhorota",
    "Sharpener",
    "Shikkha",
    "Shikkhok_Shikkhika",
    "Shonodpotro",
    "Shrenikokkho",
    "Sikkhito",
    "Somaborton",
    "Songbadpotro",
    "Sonkha",
    "Sorkari",
    "Stor",
    "Tattha",
    "Telephone",
    "Television",
    "Uccho Madhyomik",
    "Upacharjyo",
    "Upanushthanik Shikkha",
    "Vorti",
]

# ── WebSocket ────────────────────────────────────────────────────────
# Minimum confidence to emit a prediction
CONFIDENCE_THRESHOLD = 0.60

# ── Server ───────────────────────────────────────────────────────────
HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", 8000))
CORS_ORIGINS = ["*"]
