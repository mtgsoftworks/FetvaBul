'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  onClear?: () => void;
}

export function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Sorunuzu yazın...",
  className,
  showSuggestions = false,
  onClear
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleClear = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={cn(
          "w-full px-4 py-3 pr-12",
          "bg-white border border-gray-300 rounded-lg",
          "focus:outline-none focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent",
          "placeholder:text-gray-500",
          "transition-all duration-200"
        )}
        aria-expanded={showSuggestions}
        aria-autocomplete={showSuggestions ? "list" : "none"}
      />

      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Aramayı temizle"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
        <button
          type="button"
          onClick={onSubmit}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Ara"
        >
          <Search className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}