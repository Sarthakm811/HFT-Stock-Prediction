export interface SystemStats {
    total_ticks: number;
    symbols: number;
    date_range: {
        start: string;
        end: string;
    };
    model_loaded: boolean;
    model_type: string;
}

export interface PredictionResult {
    symbol: string;
    action: 'BUY' | 'HOLD' | 'SELL';
    confidence: number;
    delta: number;
    ensemble_agreement: boolean;
    agreement_rate: number;
    details: {
        bagging: string;
        boosting: string;
        stacking: string;
        timestamp: string;
        price: number;
    };
}

export interface EnsembleInfo {
    n_base_models: number;
    has_meta_model: boolean;
    architecture: string;
    window_size: number;
    n_indicators: number;
    confidence_target: string;
    ensemble_agreement: string;
}
