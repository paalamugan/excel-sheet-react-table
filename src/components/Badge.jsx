import React from 'react';

export default function Badge({ value, backgroundColor, className = 'text-white' }) {
  return (
    <span
      className={`font-weight-400 d-inline-block color-grey-800 border-radius-sm fa-sm text-transform-capitalize ${className}`}
      style={{
        backgroundColor: backgroundColor,
        padding: '2px 6px',
      }}
    >
      {value}
    </span>
  );
}
