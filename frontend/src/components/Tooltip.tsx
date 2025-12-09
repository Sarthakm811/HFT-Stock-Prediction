import React from 'react';
import './Tooltip.css';

interface TooltipProps {
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, position = 'top', children }) => {
    return (
        <div className="tooltip-wrapper">
            {children}
            <div className={`tooltip ${position}`}>
                {text}
            </div>
        </div>
    );
};

export default Tooltip;
