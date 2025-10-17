"use client";

import React, { useState, useEffect } from 'react';
import { Input } from './input';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxDate?: Date;
}

export function DateInput({ value, onChange, placeholder = "DD/MM/YYYY", className, maxDate }: DateInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        setDisplayValue(`${day}/${month}/${year}`);
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, '');
    
    if (inputValue.length >= 1) {
      inputValue = inputValue.substring(0, 2) + (inputValue.length > 2 ? '/' : '');
    }
    if (inputValue.length >= 4) {
      inputValue = inputValue.substring(0, 5) + (inputValue.length > 5 ? '/' : '');
    }
    if (inputValue.length >= 7) {
      inputValue = inputValue.substring(0, 10);
    }

    setDisplayValue(inputValue);

    if (inputValue.length === 10) {
      const [day, month, year] = inputValue.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      if (!isNaN(date.getTime()) && 
          date.getDate() === parseInt(day) && 
          date.getMonth() === parseInt(month) - 1 && 
          date.getFullYear() === parseInt(year)) {
        
        if (maxDate && date > maxDate) {
          return;
        }
        
        const isoDate = date.toISOString().split('T')[0];
        onChange(isoDate);
      }
    } else if (inputValue.length === 0) {
      onChange('');
    }
  };

  return (
    <Input
      value={displayValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      className={className}
      maxLength={10}
    />
  );
}

