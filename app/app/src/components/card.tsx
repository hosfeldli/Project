// File: components/card.tsx
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`bg-white rounded shadow-md p-4 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}