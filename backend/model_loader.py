"""
Model loading utilities for FYDP-3 Bangla Sign Language Recognition.

Reconstructs the EXACT architectures defined in the training notebook:
  - Transformer: Dense(256) -> PositionalEmbedding(256) -> TransformerEncoder(embed=256, dense=512, heads=4) -> GAP -> Dense(256) -> Dense(100)
  - GRU: Input -> GRU(64, seq=True) -> Dropout(0.3) -> GRU(64) -> Dropout(0.3) -> Dense(128) -> Dropout(0.3) -> Dense(100)
  - LSTM: Input -> LSTM(64, seq=True) -> Dropout(0.3) -> LSTM(64) -> Dropout(0.3) -> Dense(128) -> Dropout(0.3) -> Dense(100)
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Callable

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.layers import LSTM, GRU, Dense, Dropout
from tensorflow.keras.models import Sequential

from config import (
    SEQUENCE_LENGTH,
    NUM_FEATURES,
    NUM_CLASSES,
    TRANSFORMER_WEIGHTS,
    TRANSFORMER_FULL,
    GRU_WEIGHTS,
    GRU_FULL,
    LSTM_WEIGHTS,
    LSTM_FULL,
)

logger = logging.getLogger("BSL_ModelLoader")


# ═══════════════════════════════════════════════════════════════════════
# Custom Keras layers (exact match to Colab Cell 45)
# ═══════════════════════════════════════════════════════════════════════

class PositionalEmbedding(layers.Layer):
    """Learnable positional embeddings added to the input."""

    def __init__(self, sequence_length: int, output_dim: int, **kwargs):
        super().__init__(**kwargs)
        self.sequence_length = sequence_length
        self.output_dim = output_dim
        self.position_embeddings = layers.Embedding(
            input_dim=sequence_length,
            output_dim=output_dim,
        )

    def call(self, inputs):
        positions = tf.range(start=0, limit=tf.shape(inputs)[1], delta=1)
        pos = self.position_embeddings(positions)
        return inputs + tf.expand_dims(pos, axis=0)

    def get_config(self):
        config = super().get_config()
        config.update({
            "sequence_length": self.sequence_length,
            "output_dim": self.output_dim,
        })
        return config


class TransformerEncoder(layers.Layer):
    """Single Transformer encoder block with multi-head self-attention."""

    def __init__(
        self,
        embed_dim: int,
        dense_dim: int,
        num_heads: int,
        dropout: float = 0.2,
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.embed_dim = embed_dim
        self.dense_dim = dense_dim
        self.num_heads = num_heads
        self.dropout_rate = dropout

        self.attention = layers.MultiHeadAttention(
            num_heads=num_heads,
            key_dim=max(1, embed_dim // num_heads),
            dropout=dropout,
        )
        self.ffn = keras.Sequential([
            layers.Dense(dense_dim, activation=tf.nn.gelu),
            layers.Dropout(dropout),
            layers.Dense(embed_dim),
        ])
        self.norm1 = layers.LayerNormalization()
        self.norm2 = layers.LayerNormalization()
        self.dropout = layers.Dropout(dropout)

    def call(self, inputs, training=None):
        attn = self.attention(inputs, inputs, training=training)
        x = self.norm1(inputs + self.dropout(attn, training=training))
        ffn_out = self.ffn(x, training=training)
        return self.norm2(x + ffn_out)

    def get_config(self):
        config = super().get_config()
        config.update({
            "embed_dim": self.embed_dim,
            "dense_dim": self.dense_dim,
            "num_heads": self.num_heads,
            "dropout": self.dropout_rate,
        })
        return config


# ═══════════════════════════════════════════════════════════════════════
# Model Builders (verbatim replica of Notebook Cells 45, 47, 49)
# ═══════════════════════════════════════════════════════════════════════

def build_transformer_model(
    input_shape: tuple[int, int] = (SEQUENCE_LENGTH, NUM_FEATURES),
    num_classes: int = NUM_CLASSES,
) -> keras.Model:
    seq_len, _ = input_shape

    inputs = keras.Input(shape=input_shape, name="input_sequence")
    x = layers.Dense(256)(inputs)
    x = PositionalEmbedding(seq_len, 256, name="frame_position_embedding")(x)
    x = TransformerEncoder(
        embed_dim=256,
        dense_dim=512,
        num_heads=4,
        dropout=0.3,
        name="transformer_encoder",
    )(x)
    x = layers.GlobalAveragePooling1D()(x)
    x = layers.Dropout(0.4)(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.4)(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="prediction")(x)

    model = keras.Model(inputs=inputs, outputs=outputs, name="Transformer")
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def build_gru_model(
    input_shape: tuple[int, int] = (SEQUENCE_LENGTH, NUM_FEATURES),
    num_classes: int = NUM_CLASSES,
) -> keras.Model:
    model = Sequential(name="GRU")
    model.add(layers.Input(shape=input_shape))
    model.add(GRU(64, return_sequences=True))
    model.add(Dropout(0.3))
    model.add(GRU(64))
    model.add(Dropout(0.3))
    model.add(Dense(128, activation="relu"))
    model.add(Dropout(0.3))
    model.add(Dense(num_classes, activation="softmax"))

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def build_lstm_model(
    input_shape: tuple[int, int] = (SEQUENCE_LENGTH, NUM_FEATURES),
    num_classes: int = NUM_CLASSES,
) -> keras.Model:
    model = Sequential(name="LSTM")
    model.add(layers.Input(shape=input_shape))
    model.add(LSTM(64, return_sequences=True))
    model.add(Dropout(0.3))
    model.add(LSTM(64))
    model.add(Dropout(0.3))
    model.add(Dense(128, activation="relu"))
    model.add(Dropout(0.3))
    model.add(Dense(num_classes, activation="softmax"))

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


# ═══════════════════════════════════════════════════════════════════════
# Loading logic
# ═══════════════════════════════════════════════════════════════════════

def detect_num_features() -> int:
    """Detect whether models/scaler are 225-D (new architecture) or 1662-D (legacy)."""
    from config import SCALER_PATH
    if SCALER_PATH.exists():
        try:
            import joblib
            s = joblib.load(str(SCALER_PATH))
            if hasattr(s, "n_features_in_"):
                return int(s.n_features_in_)
        except Exception:
            pass
    return NUM_FEATURES


def _try_load(
    builder_fn: Callable[[tuple[int, int]], keras.Model],
    weights_path: Path,
    full_model_path: Path,
    model_name: str,
) -> keras.Model | None:
    """
    Load a model.
    Strategy 1: Build exact architecture + load weights directly (supports both 225-D and 1662-D).
    Strategy 2: Load full .keras file as fallback.
    """
    detected_dim = detect_num_features()
    candidate_dims = [detected_dim]
    for alt in (225, 1662):
        if alt not in candidate_dims:
            candidate_dims.append(alt)

    # Strategy 1: Build exact architecture and load weights
    if weights_path.exists():
        for dim in candidate_dims:
            try:
                model = builder_fn(input_shape=(SEQUENCE_LENGTH, dim))
                model.load_weights(str(weights_path))
                logger.info("✅ Loaded %s weights directly from %s (Dimension: %d-D)", model_name, weights_path.name, dim)
                return model
            except Exception as exc:
                continue
        logger.warning("Could not load weights for %s across candidate dimensions %s; trying full model file.", model_name, candidate_dims)

    # Strategy 2: full saved model
    if full_model_path.exists():
        try:
            custom_objects = {
                "PositionalEmbedding": PositionalEmbedding,
                "TransformerEncoder": TransformerEncoder,
            }
            model = keras.models.load_model(
                str(full_model_path), custom_objects=custom_objects
            )
            logger.info("✅ Loaded full model %s from %s", model_name, full_model_path.name)
            return model
        except Exception as exc:
            logger.warning("Could not load full model %s (%s).", full_model_path, exc)

    logger.warning("No usable model files found for %s in %s", model_name, weights_path.parent)
    return None


def load_all_models() -> dict[str, keras.Model]:
    """
    Load all available trained models.
    Returns a dict of {model_name: keras.Model}.
    """
    models: dict[str, keras.Model] = {}

    transformer = _try_load(
        build_transformer_model,
        TRANSFORMER_WEIGHTS,
        TRANSFORMER_FULL,
        "Transformer",
    )
    if transformer is not None:
        models["Transformer"] = transformer

    gru = _try_load(
        build_gru_model,
        GRU_WEIGHTS,
        GRU_FULL,
        "GRU",
    )
    if gru is not None:
        models["GRU"] = gru

    lstm = _try_load(
        build_lstm_model,
        LSTM_WEIGHTS,
        LSTM_FULL,
        "LSTM",
    )
    if lstm is not None:
        models["LSTM"] = lstm

    return models
