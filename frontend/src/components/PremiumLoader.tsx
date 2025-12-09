import React from 'react';
import './PremiumLoader.css';

interface PremiumLoaderProps {
    message?: string;
}

const PremiumLoader: React.FC<PremiumLoaderProps> = ({ message = "Loading..." }) => {
    return (
        <div className="premium-loader">
            <div className="loader-container">
                <div className="loader-ring">
                    <div className="loader-ring-inner"></div>
                </div>
                <div className="loader-dots">
                    <div className="dot dot-1"></div>
                    <div className="dot dot-2"></div>
                    <div className="dot dot-3"></div>
                </div>
                <div className="loader-text">{message}</div>
            </div>
        </div>
    );
};

export default PremiumLoader;
