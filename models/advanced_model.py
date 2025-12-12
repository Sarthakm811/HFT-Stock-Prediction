"""
Advanced Model Architecture for 80%+ Accuracy
Uses attention mechanisms, residual connections, and advanced techniques
"""
import tensorflow as tf
from tensorflow.keras import layers, Model


def build_advanced_model(window: int, n_features: int, n_indicators: int) -> Model:
    """
    Build advanced model with:
    - Attention mechanisms
    - Residual connections
    - Multiple branches
    - Advanced regularization
    """
    
    # ========== SEQUENCE INPUT BRANCH ==========
    seq_input = layers.Input(shape=(window, n_features), name="sequence_input")
    
    # Multi-scale CNN branch
    cnn_outputs = []
    for kernel_size in [3, 5, 7]:
        x = layers.Conv1D(64, kernel_size, padding='same', activation='relu')(seq_input)
        x = layers.BatchNormalization()(x)
        x = layers.Conv1D(32, kernel_size, padding='same', activation='relu')(x)
        x = layers.BatchNormalization()(x)
        x = layers.GlobalMaxPooling1D()(x)
        cnn_outputs.append(x)
    
    cnn_merged = layers.Concatenate()(cnn_outputs)
    cnn_merged = layers.Dropout(0.3)(cnn_merged)
    
    # LSTM with attention
    lstm_out = layers.Bidirectional(
        layers.LSTM(64, return_sequences=True, dropout=0.2, recurrent_dropout=0.2)
    )(seq_input)
    
    # Attention mechanism
    attention = layers.Dense(1, activation='tanh')(lstm_out)
    attention = layers.Flatten()(attention)
    attention = layers.Activation('softmax')(attention)
    attention = layers.RepeatVector(128)(attention)
    attention = layers.Permute([2, 1])(attention)
    
    # Apply attention
    attended = layers.Multiply()([lstm_out, attention])
    attended = layers.Lambda(lambda x: tf.reduce_sum(x, axis=1))(attended)
    attended = layers.Dropout(0.3)(attended)
    
    # GRU branch
    gru_out = layers.Bidirectional(
        layers.GRU(64, dropout=0.2, recurrent_dropout=0.2)
    )(seq_input)
    gru_out = layers.Dropout(0.3)(gru_out)
    
    # ========== INDICATOR INPUT BRANCH ==========
    ind_input = layers.Input(shape=(n_indicators,), name="indicator_input")
    
    # Deep indicator processing
    ind_proc = layers.Dense(128, activation='relu')(ind_input)
    ind_proc = layers.BatchNormalization()(ind_proc)
    ind_proc = layers.Dropout(0.3)(ind_proc)
    
    ind_proc = layers.Dense(64, activation='relu')(ind_proc)
    ind_proc = layers.BatchNormalization()(ind_proc)
    ind_proc = layers.Dropout(0.2)(ind_proc)
    
    # ========== FUSION ==========
    merged = layers.Concatenate()([cnn_merged, attended, gru_out, ind_proc])
    
    # Deep fusion layers with residual connections
    x = layers.Dense(256, activation='relu')(merged)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.4)(x)
    
    # Residual block
    residual = x
    x = layers.Dense(256, activation='relu')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(256, activation='relu')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Add()([x, residual])  # Residual connection
    
    x = layers.Dense(128, activation='relu')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    
    x = layers.Dense(64, activation='relu')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.2)(x)
    
    # ========== OUTPUT HEADS ==========
    # Action classification with temperature scaling
    action_logits = layers.Dense(3, name="action_logits")(x)
    action_out = layers.Activation('softmax', name="action_out")(action_logits)
    
    # Delta regression
    delta_out = layers.Dense(1, activation='linear', name="delta_out")(x)
    
    # Build model
    model = Model(
        inputs=[seq_input, ind_input],
        outputs=[action_out, delta_out],
        name="advanced_model"
    )
    
    # Compile with advanced optimizer
    optimizer = tf.keras.optimizers.Adam(
        learning_rate=1e-4,
        beta_1=0.9,
        beta_2=0.999,
        epsilon=1e-7
    )
    
    # Focal loss for imbalanced classes
    def focal_loss(y_true, y_pred, alpha=0.25, gamma=2.0):
        y_true = tf.cast(y_true, tf.int32)
        y_true_one_hot = tf.one_hot(y_true, depth=3)
        
        epsilon = tf.keras.backend.epsilon()
        y_pred = tf.clip_by_value(y_pred, epsilon, 1.0 - epsilon)
        
        cross_entropy = -y_true_one_hot * tf.math.log(y_pred)
        weight = alpha * tf.pow(1 - y_pred, gamma)
        focal_loss = weight * cross_entropy
        
        return tf.reduce_sum(focal_loss, axis=-1)
    
    model.compile(
        optimizer=optimizer,
        loss={
            "action_out": focal_loss,
            "delta_out": "huber"
        },
        loss_weights={
            "action_out": 3.0,
            "delta_out": 0.3
        },
        metrics={
            "action_out": ["accuracy", tf.keras.metrics.SparseCategoricalAccuracy()],
            "delta_out": "mae"
        }
    )
    
    return model


if __name__ == "__main__":
    model = build_advanced_model(window=128, n_features=1, n_indicators=24)
    model.summary()
