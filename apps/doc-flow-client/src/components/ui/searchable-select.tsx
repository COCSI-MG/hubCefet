import React, { useState, useMemo } from 'react';
import { Search, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SearchableSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Selecione uma opção...",
  emptyText = "Nenhuma opção encontrada.",
  searchPlaceholder = "Buscar...",
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    
    const term = searchTerm.toLowerCase();
    return options.filter(option =>
      option.label.toLowerCase().includes(term) ||
      option.description?.toLowerCase().includes(term)
    );
  }, [options, searchTerm]);

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchTerm('');
    }
  };

  return (
    <Select 
      value={value} 
      onValueChange={onValueChange}
      disabled={disabled}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger className={cn(
        "rounded-2xl bg-white bg-opacity-60",
        className
      )}>
        <SelectValue placeholder={placeholder}>
          {selectedOption && (
            <div className="flex flex-col items-start text-left">
              <span className="font-medium">{selectedOption.label}</span>
              {selectedOption.description && (
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {selectedOption.description}
                </span>
              )}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="p-0">
        {/* Campo de busca dentro do dropdown */}
        <div className="flex items-center border-b px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 p-0 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 bg-transparent"
            autoFocus
          />
        </div>
        
        {/* Lista de opções filtradas */}
        <div className="max-h-[200px] overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="cursor-pointer"
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </div>
      </SelectContent>
    </Select>
  );
} 
 
 