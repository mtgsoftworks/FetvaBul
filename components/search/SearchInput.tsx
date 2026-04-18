'use client';

import { useState, useRef } from 'react';
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
        className="w-full py-4 px-6 pr-20 rounded-[40px] border-[1.5px] border-clean-border bg-card text-base text-main outline-none focus:border-accent shadow-[0_10px_30px_rgba(95,113,97,0.05)] transition-all placeholder:text-muted"
        aria-autocomplete={showSuggestions ? "list" : "none"}
      />

      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-2 text-muted hover:text-main rounded-full transition-colors"
            aria-label="Aramayı temizle"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onSubmit}
          className="p-2 text-muted hover:text-accent rounded-full transition-colors"
          aria-label="Ara"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
