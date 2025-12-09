import React from 'react';
import './PremiumButton.css';

interface PremiumButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    icon?: string;
    loading?: boolean;
    className?: string;
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    icon,
    loading = false,
    className = ''
}) => {
    return (
        <button
            className={`premium-button ${variant} ${size} ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''} ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {loading && <span className="button-spinner"></span>}
            {!loading && icon && <span className="button-icon">{icon}</span>}
            <span className="button-text">{children}</span>
        </button>
    );
};

export default PremiumButton;
