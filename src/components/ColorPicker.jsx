import React from 'react';

const COLORS = [
    '#FF4500', '#FFA500', '#FFD700', '#90EE90', '#00CED1', '#1E90FF', '#9370DB', '#FF69B4',
    '#8B4513', '#A0522D', '#808000', '#006400', '#4682B4', '#000080', '#4B0082', '#000000',
    '#FFFFFF', '#C0C0C0'
];

const ColorPicker = ({ selectedColor, onSelectColor }) => {
    return (
        <div style={{
            position: 'absolute',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '10px 15px',
            borderRadius: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            gap: '8px',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            {COLORS.map((color) => (
                <div
                    key={color}
                    onClick={() => onSelectColor(color)}
                    style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: color,
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: selectedColor === color ? '3px solid #333' : '1px solid #ddd',
                        transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.1s ease'
                    }}
                    title={color}
                />
            ))}
            {/* Divider */}
            <div style={{ width: '1px', backgroundColor: '#ddd', margin: '0 5px' }}></div>

            {/* Eraser */}
            <div
                onClick={() => onSelectColor('ERASER')}
                style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: '#fff',
                    borderRadius: '4px', // Square for tool
                    cursor: 'pointer',
                    border: selectedColor === 'ERASER' ? '3px solid #333' : '1px solid #ddd',
                    transform: selectedColor === 'ERASER' ? 'scale(1.1)' : 'scale(1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                }}
                title="Eraser"
            >
                🧽
            </div>
        </div>
    );
};

export default ColorPicker;
