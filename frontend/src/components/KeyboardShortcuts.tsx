import React, { useState, useEffect } from 'react';
import './KeyboardShortcuts.css';

interface KeyboardShortcutsProps {
    onRefresh: () => void;
    onToggleTheme: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ onRefresh, onToggleTheme }) => {
    const [ showHelp, setShowHelp ] = useState(false);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Ignore if typing in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key.toLowerCase()) {
                case 'r':
                    onRefresh();
                    showNotification('🔄 Refreshing data...');
                    break;
                case 'd':
                    onToggleTheme();
                    showNotification('🌓 Theme toggled');
                    break;
                case '?':
                    setShowHelp(true);
                    break;
                case 'escape':
                    setShowHelp(false);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [ onRefresh, onToggleTheme ]);

    const showNotification = (message: string) => {
        const notification = document.createElement('div');
        notification.className = 'keyboard-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    };

    if (!showHelp) {
        return (
            <button className="help-button" onClick={() => setShowHelp(true)} title="Keyboard Shortcuts (?)">
                ⌨️
            </button>
        );
    }

    return (
        <div className="shortcuts-modal" onClick={() => setShowHelp(false)}>
            <div className="shortcuts-content" onClick={(e) => e.stopPropagation()}>
                <div className="shortcuts-header">
                    <h2>⌨️ Keyboard Shortcuts</h2>
                    <button className="close-button" onClick={() => setShowHelp(false)}>✕</button>
                </div>

                <div className="shortcuts-list">
                    <div className="shortcut-item">
                        <kbd>R</kbd>
                        <span>Refresh Data</span>
                    </div>
                    <div className="shortcut-item">
                        <kbd>D</kbd>
                        <span>Toggle Dark Mode</span>
                    </div>
                    <div className="shortcut-item">
                        <kbd>?</kbd>
                        <span>Show This Help</span>
                    </div>
                    <div className="shortcut-item">
                        <kbd>ESC</kbd>
                        <span>Close Dialogs</span>
                    </div>
                    <div className="shortcut-item">
                        <kbd>Space</kbd>
                        <span>Get Prediction (when focused)</span>
                    </div>
                </div>

                <div className="shortcuts-footer">
                    <p>Press <kbd>ESC</kbd> to close</p>
                </div>
            </div>
        </div>
    );
};

export default KeyboardShortcuts;
