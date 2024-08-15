import React from 'react';

interface CircleTextProps {
  text: string;
  color: string;
  size: number;
}

const CircleText: React.FC<CircleTextProps> = ({ text, color, size = 48 }) => {
  return (
    <div
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: '#fff',
        fontSize: size / 5, // Dynamically set font size based on circle size
        fontWeight: 'bold',
        overflow: 'hidden',
        padding: '10px',
        boxSizing: 'border-box',
      }}
    >
      {text}
    </div>
  );
};

export default CircleText;
