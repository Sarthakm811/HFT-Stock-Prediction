"""Hybrid LSTM + CNN + Indicator fusion model (TensorFlow / Keras).

This module provides `build_hybrid_model(...)` which returns a compiled Keras model.
"""
from typing import Tuple
import tensorflow as tf
from tensorflow.keras import layers, Model


def build_hybrid_model(window: int, n_features: int, n_indicators: int,
                       lstm_units: int = 64, cnn_filters: int = 64,
                       dense_units: int = 64) -> Model:
    # Sequence input (price/time features)
    seq_input = layers.Input(shape=(window, n_features), name="sequence_input")

    # LSTM branch with increased dropout
    x = layers.Bidirectional(layers.LSTM(lstm_units, return_sequences=True, dropout=0.2))(seq_input)
    x = layers.Bidirectional(layers.LSTM(lstm_units//2, dropout=0.2))(x)
    x = layers.Dropout(0.3)(x)

    # CNN branch with increased dropout
    y = layers.Conv1D(filters=cnn_filters, kernel_size=3, activation="relu", padding="same")(seq_input)
    y = layers.Dropout(0.2)(y)
    y = layers.Conv1D(filters=cnn_filters//2, kernel_size=5, activation="relu", padding="same")(y)
    y = layers.GlobalMaxPool1D()(y)
    y = layers.Dropout(0.3)(y)

    # Indicator branch (snapshot of indicator values)
    ind_input = layers.Input(shape=(n_indicators,), name="indicator_input")
    z = layers.Dense(dense_units, activation="relu")(ind_input)
    z = layers.Dropout(0.2)(z)

    # Fusion with more regularization
    merged = layers.Concatenate()([x, y, z])
    merged = layers.Dense(dense_units, activation="relu")(merged)
    merged = layers.BatchNormalization()(merged)
    merged = layers.Dropout(0.4)(merged)

    # Output heads: classification (3-way) and regression (expected delta)
    cls_out = layers.Dense(3, activation="softmax", name="action_out")(merged)
    reg_out = layers.Dense(1, activation="linear", name="delta_out")(merged)

    model = Model(inputs=[seq_input, ind_input], outputs=[cls_out, reg_out], name="hybrid_model")

    losses = {
        "action_out": "sparse_categorical_crossentropy",
        "delta_out": "mse",
    }
    # Prioritize action classification over delta regression
    loss_weights = {"action_out": 2.0, "delta_out": 0.5}

    # Lower learning rate for better convergence and less overconfidence
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=5e-4),
                  loss=losses,
                  loss_weights=loss_weights,
                  metrics={"action_out": ["accuracy", tf.keras.metrics.SparseCategoricalAccuracy()], 
                          "delta_out": "mae"})

    return model


def summary_example():
    m = build_hybrid_model(window=128, n_features=1, n_indicators=10)
    m.summary()


if __name__ == "__main__":
    summary_example()
