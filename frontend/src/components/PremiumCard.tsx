import React from 'react';
import './PremiumCard.css';

interface PremiumCardProps {
    title?: string;
    subtitle?: string;
    icon?: string;
    children: React.ReactNode;
    className?: string;
    glow?: boolean;
}

const PremiumCard: React.FC<PremiumCardProps> = ({
    title,
    subtitle,
    icon,
    children,
    className = '',
    glow = false
}) => {
    return (
        <div className={`premium-card ${glow ? 'glow' : ''} ${className}`}>
            {(title || subtitle || icon) && (
                <div className="premium-card-header">
                    {icon && <span className="premium-card-icon">{icon}</span>}
                    <div className="premium-card-title-group">
                        {title && <h3 className="premium-card-title">{title}</h3>}
                        {subtitle && <p className="premium-card-subtitle">{subtitle}</p>}
                    </div>
                </div>
            )}
            <div className="premium-card-content">
                {children}
            </div>
        </div>
    );
};

export default PremiumCard;
