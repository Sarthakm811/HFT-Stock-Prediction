import React from 'react';
import './ThemeToggle.css';

interface ThemeToggleProps {
    isDark: boolean;
    onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
    return (
        <button className="theme-toggle" onClick={onToggle} title="Toggle Dark Mode (D)">
            {isDark ? '☀️' : '🌙'}
            <span className="toggle-text">{isDark ? 'Light' : 'Dark'}</span>
        </button>
    );
};

export default ThemeToggle;
