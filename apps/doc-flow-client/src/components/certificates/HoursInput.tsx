import { useCallback } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Box, Typography } from "@mui/material";

interface HoursInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  error?: string;
}

const DEFAULT_MIN = 1;
const DEFAULT_MAX = 999;
const DEFAULT_STEP = 1;

export default function HoursInput({
  value,
  onChange,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
  step = DEFAULT_STEP,
  disabled = false,
  error,
}: HoursInputProps) {
  const isDecrementDisabled = disabled || value <= min;
  const isIncrementDisabled = disabled || value >= max;

  const handleIncrement = useCallback(() => {
    if (!isIncrementDisabled) {
      const newValue = Math.min(value + step, max);
      onChange(newValue);
    }
  }, [value, step, max, isIncrementDisabled, onChange]);

  const handleDecrement = useCallback(() => {
    if (!isDecrementDisabled) {
      const newValue = Math.max(value - step, min);
      onChange(newValue);
    }
  }, [value, step, min, isDecrementDisabled, onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (inputValue === '') {
      onChange(min);
      return;
    }
    
    const numericValue = parseInt(inputValue, 10);
    
    if (isNaN(numericValue)) {
      return;
    }
    
    const clampedValue = Math.max(min, Math.min(max, numericValue));
    onChange(clampedValue);
  }, [min, max, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ];
    
    const isNumber = /^[0-9]$/.test(e.key);
    const isAllowedKey = allowedKeys.includes(e.key);
    const isCtrlA = e.ctrlKey && e.key === 'a';
    
    if (!isNumber && !isAllowedKey && !isCtrlA) {
      e.preventDefault();
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  }, [handleIncrement, handleDecrement]);

  return (
    <Box className="space-y-2">
      <Box className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={isDecrementDisabled}
          className="h-10 w-10 rounded-l-2xl"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Input
          type="text"
          value={value.toString()}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            "text-center font-medium rounded-none border-l-0 border-r-0 focus:z-10",
            error && "border-destructive"
          )}
          min={min}
          max={max}
        />
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={isIncrementDisabled}
          className="h-10 w-10 rounded-r-2xl"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </Box>
      
      {error && (
        <Typography variant="body2" color="error" className="text-sm text-destructive">
          {error}
        </Typography>
      )}
      
      <Typography variant="caption" className="text-xs text-muted-foreground text-center">
        {value} {value === 1 ? 'hora' : 'horas'}
      </Typography>
    </Box>
  );
} 
 
 