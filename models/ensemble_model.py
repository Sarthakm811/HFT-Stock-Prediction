"""
Ensemble Model using Bagging, Boosting, and Stacking
Combines multiple models for better predictions
"""
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, Model
from typing import List, Tuple
import pickle
from pathlib import Path


class EnsemblePredictor:
    """
    Ensemble predictor combining multiple strategies:
    - Bagging: Multiple models trained on different data subsets
    - Boosting: Sequential models focusing on hard examples
    - Stacking: Meta-model combining predictions from base models
    """
    
    def __init__(self, n_models: int = 5):
        self.n_models = n_models
        self.base_models = []
        self.meta_model = None
        self.model_weights = None
        
    def build_base_model(self, window: int, n_features: int, n_indicators: int,
                        model_id: int) -> Model:
        """Build a single base model with slight variations"""
        # Vary architecture slightly for diversity
        lstm_units = 32 + (model_id % 3) * 8  # 32, 40, 48
        cnn_filters = 32 + (model_id % 2) * 16  # 32, 48
        dropout_rate = 0.3 + (model_id % 3) * 0.05  # 0.3, 0.35, 0.4
        
        # Sequence input
        seq_input = layers.Input(shape=(window, n_features), name=f"seq_input_{model_id}")
        
        # LSTM branch
        x = layers.Bidirectional(
            layers.LSTM(lstm_units, return_sequences=True, dropout=0.2)
        )(seq_input)
        x = layers.Bidirectional(
            layers.LSTM(lstm_units//2, dropout=0.2)
        )(x)
        x = layers.Dropout(dropout_rate)(x)
        
        # CNN branch
        y = layers.Conv1D(filters=cnn_filters, kernel_size=3, activation="relu", padding="same")(seq_input)
        y = layers.Dropout(0.2)(y)
        y = layers.Conv1D(filters=cnn_filters//2, kernel_size=5, activation="relu", padding="same")(y)
        y = layers.GlobalMaxPool1D()(y)
        y = layers.Dropout(dropout_rate)(y)
        
        # Indicator branch
        ind_input = layers.Input(shape=(n_indicators,), name=f"ind_input_{model_id}")
        z = layers.Dense(32, activation="relu")(ind_input)
        z = layers.Dropout(0.2)(z)
        
        # Fusion
        merged = layers.Concatenate()([x, y, z])
        merged = layers.Dense(32, activation="relu")(merged)
        merged = layers.BatchNormalization()(merged)
        merged = layers.Dropout(dropout_rate)(merged)
        
        # Outputs
        cls_out = layers.Dense(3, activation="softmax", name=f"action_out_{model_id}")(merged)
        reg_out = layers.Dense(1, activation="linear", name=f"delta_out_{model_id}")(merged)
        
        model = Model(
            inputs=[seq_input, ind_input],
            outputs=[cls_out, reg_out],
            name=f"base_model_{model_id}"
        )
        
        # Compile
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=5e-4),
            loss={
                f"action_out_{model_id}": "sparse_categorical_crossentropy",
                f"delta_out_{model_id}": "mse",
            },
            loss_weights={
                f"action_out_{model_id}": 2.0,
                f"delta_out_{model_id}": 0.5
            },
            metrics={
                f"action_out_{model_id}": "accuracy",
                f"delta_out_{model_id}": "mae"
            }
        )
        
        return model
    
    def build_meta_model(self, n_base_models: int) -> Model:
        """Build stacking meta-model that combines base model predictions"""
        # Input: predictions from all base models
        # For each model: 3 class probabilities + 1 delta = 4 features
        meta_input = layers.Input(shape=(n_base_models * 4,), name="meta_input")
        
        x = layers.Dense(64, activation="relu")(meta_input)
        x = layers.Dropout(0.3)(x)
        x = layers.Dense(32, activation="relu")(x)
        x = layers.Dropout(0.2)(x)
        
        # Final outputs
        action_out = layers.Dense(3, activation="softmax", name="final_action")(x)
        delta_out = layers.Dense(1, activation="linear", name="final_delta")(x)
        
        model = Model(inputs=meta_input, outputs=[action_out, delta_out], name="meta_model")
        
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
            loss={
                "final_action": "sparse_categorical_crossentropy",
                "final_delta": "mse"
            },
            loss_weights={"final_action": 2.0, "final_delta": 0.5},
            metrics={"final_action": "accuracy", "final_delta": "mae"}
        )
        
        return model
    
    def train_bagging(self, X_seq, X_ind, y_cls, y_reg, epochs: int = 10, batch_size: int = 128):
        """Train multiple models using bagging (bootstrap aggregating)"""
        print("\n" + "="*70)
        print("BAGGING: Training multiple models on different data subsets")
        print("="*70)
        
        n_samples = len(X_seq)
        window = X_seq.shape[1]
        n_features = X_seq.shape[2]
        n_indicators = X_ind.shape[1]
        
        for i in range(self.n_models):
            print(f"\n[{i+1}/{self.n_models}] Training base model {i}...")
            
            # Bootstrap sampling (sample with replacement)
            indices = np.random.choice(n_samples, size=n_samples, replace=True)
            X_seq_boot = X_seq[indices]
            X_ind_boot = X_ind[indices]
            y_cls_boot = y_cls[indices]
            y_reg_boot = y_reg[indices]
            
            # Build and train model
            model = self.build_base_model(window, n_features, n_indicators, i)
            
            history = model.fit(
                [X_seq_boot, X_ind_boot],
                {f"action_out_{i}": y_cls_boot, f"delta_out_{i}": y_reg_boot},
                epochs=epochs,
                batch_size=batch_size,
                validation_split=0.2,
                verbose=0,
                callbacks=[
                    tf.keras.callbacks.EarlyStopping(
                        monitor='val_loss',
                        patience=3,
                        restore_best_weights=True,
                        verbose=0
                    )
                ]
            )
            
            final_acc = history.history[f'action_out_{i}_accuracy'][-1]
            print(f"  ✅ Model {i} trained - Accuracy: {final_acc:.4f}")
            
            self.base_models.append(model)
        
        print(f"\n✅ Bagging complete: {len(self.base_models)} models trained")
    
    def train_stacking(self, X_seq, X_ind, y_cls, y_reg, epochs: int = 10, batch_size: int = 128):
        """Train meta-model using stacking"""
        print("\n" + "="*70)
        print("STACKING: Training meta-model on base model predictions")
        print("="*70)
        
        # Get predictions from all base models
        print("Generating base model predictions...")
        base_predictions = []
        
        for i, model in enumerate(self.base_models):
            cls_pred, reg_pred = model.predict([X_seq, X_ind], verbose=0)
            # Concatenate class probabilities and delta prediction
            pred_features = np.concatenate([cls_pred, reg_pred], axis=1)
            base_predictions.append(pred_features)
        
        # Stack all predictions
        meta_features = np.concatenate(base_predictions, axis=1)
        print(f"Meta features shape: {meta_features.shape}")
        
        # Build and train meta-model
        print("Training meta-model...")
        self.meta_model = self.build_meta_model(len(self.base_models))
        
        history = self.meta_model.fit(
            meta_features,
            {"final_action": y_cls, "final_delta": y_reg},
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.2,
            verbose=1,
            callbacks=[
                tf.keras.callbacks.EarlyStopping(
                    monitor='val_loss',
                    patience=5,
                    restore_best_weights=True,
                    verbose=1
                )
            ]
        )
        
        final_acc = history.history['final_action_accuracy'][-1]
        print(f"\n✅ Stacking complete - Meta-model accuracy: {final_acc:.4f}")
    
    def predict(self, X_seq, X_ind) -> Tuple[np.ndarray, np.ndarray, dict]:
        """
        Make ensemble predictions using all methods
        Returns: (action_probs, delta, details)
        """
        # Get predictions from all base models
        base_predictions = []
        base_actions = []
        base_deltas = []
        
        for i, model in enumerate(self.base_models):
            cls_pred, reg_pred = model.predict([X_seq, X_ind], verbose=0)
            base_predictions.append(np.concatenate([cls_pred, reg_pred], axis=1))
            base_actions.append(cls_pred)
            base_deltas.append(reg_pred)
        
        # Method 1: Simple averaging (bagging)
        avg_action = np.mean(base_actions, axis=0)
        avg_delta = np.mean(base_deltas, axis=0)
        
        # Method 2: Weighted voting (boosting-style)
        if self.model_weights is not None:
            weighted_action = np.average(base_actions, axis=0, weights=self.model_weights)
            weighted_delta = np.average(base_deltas, axis=0, weights=self.model_weights)
        else:
            weighted_action = avg_action
            weighted_delta = avg_delta
        
        # Method 3: Stacking (meta-model)
        meta_features = np.concatenate(base_predictions, axis=1)
        stacked_action, stacked_delta = self.meta_model.predict(meta_features, verbose=0)
        
        # Combine all methods (ensemble of ensembles!)
        final_action = (avg_action + weighted_action + stacked_action) / 3
        final_delta = (avg_delta + weighted_delta + stacked_delta) / 3
        
        details = {
            'bagging': (avg_action, avg_delta),
            'boosting': (weighted_action, weighted_delta),
            'stacking': (stacked_action, stacked_delta),
            'base_predictions': base_actions
        }
        
        return final_action, final_delta, details
    
    def calculate_model_weights(self, X_seq, X_ind, y_cls):
        """Calculate weights for each model based on validation accuracy (boosting-style)"""
        print("\nCalculating model weights based on performance...")
        weights = []
        
        for i, model in enumerate(self.base_models):
            cls_pred, _ = model.predict([X_seq, X_ind], verbose=0)
            pred_classes = np.argmax(cls_pred, axis=1)
            accuracy = np.mean(pred_classes == y_cls)
            weights.append(accuracy)
            print(f"  Model {i}: accuracy = {accuracy:.4f}")
        
        # Normalize weights
        weights = np.array(weights)
        self.model_weights = weights / weights.sum()
        print(f"Normalized weights: {self.model_weights}")
    
    def save(self, path: str):
        """Save ensemble to disk"""
        save_path = Path(path)
        save_path.mkdir(parents=True, exist_ok=True)
        
        # Save base models
        for i, model in enumerate(self.base_models):
            model.save(save_path / f"base_model_{i}.keras")
        
        # Save meta model
        if self.meta_model:
            self.meta_model.save(save_path / "meta_model.keras")
        
        # Save weights
        if self.model_weights is not None:
            with open(save_path / "model_weights.pkl", 'wb') as f:
                pickle.dump(self.model_weights, f)
        
        print(f"Ensemble saved to {save_path}")
    
    def load(self, path: str):
        """Load ensemble from disk"""
        load_path = Path(path)
        
        # Load base models
        self.base_models = []
        i = 0
        while (load_path / f"base_model_{i}.keras").exists():
            model = tf.keras.models.load_model(load_path / f"base_model_{i}.keras")
            self.base_models.append(model)
            i += 1
        
        # Load meta model
        meta_path = load_path / "meta_model.keras"
        if meta_path.exists():
            self.meta_model = tf.keras.models.load_model(meta_path)
        
        # Load weights
        weights_path = load_path / "model_weights.pkl"
        if weights_path.exists():
            with open(weights_path, 'rb') as f:
                self.model_weights = pickle.load(f)
        
        print(f"Ensemble loaded from {load_path}")
        print(f"   Base models: {len(self.base_models)}")
        print(f"   Meta model: {'Yes' if self.meta_model else 'No'}")
