import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Define the structure for select options
interface SelectOption {
  value: string | number; // Allow number values for select
  label?: string; // Optional label, fallback to value
}

// Define the props for the FormField component
interface FormFieldProps {
  path: string; // Dot-notation path for state update
  label: string; // Display label
  tooltip?: string; // Optional tooltip text
  value: any; // Current value (can be string, number, boolean, array, object, null)
  onChange: (path: string, value: any) => void; // State update callback
  error?: string; // Optional validation error message
  type?: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'list'; // Input type
  options?: SelectOption[]; // Options for 'select' type
  disabled?: boolean; // Whether input is disabled
  placeholder?: string; // Placeholder text
  className?: string; // Additional CSS classes
  // Allow passing specific props down to the underlying input/textarea
  inputProps?: React.ComponentProps<typeof Input>;
  textareaProps?: React.ComponentProps<typeof Textarea>;
}

/**
 * A versatile form field component that renders different input types
 * based on the props provided. Integrates with shadcn/ui components.
 */
const FormField: React.FC<FormFieldProps> = ({
  path,
  label,
  tooltip,
  value,
  onChange,
  error,
  type = 'text',
  options = [],
  disabled = false,
  placeholder = '',
  className,
  inputProps = {},
  textareaProps = {},
}) => {
  // Unique ID for label association
  const inputId = path.replace(/\./g, '-');

  // --- Event Handlers with Type Safety ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(path, e.target.value);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (rawValue === '') {
      onChange(path, ''); // Allow clearing the input
    } else {
      const numValue = parseFloat(rawValue);
      // Store the number if valid, otherwise keep the invalid string input
      // This allows validation to catch non-numeric input later
      onChange(path, isNaN(numValue) ? rawValue : numValue);
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    onChange(path, checked);
  };

  const handleSelectChange = (newValue: string) => {
    onChange(path, newValue);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(path, e.target.value);
  };

  // --- Render Logic ---

  // Common props extracted for cleaner rendering
  const commonInputAttrs = {
    id: inputId,
    disabled: disabled,
    placeholder: placeholder,
    className: cn(error ? 'border-destructive' : '', 'w-full'),
  };

  // Render the specific input type
  const renderInput = () => {
    switch (type) {
      case 'number':
        return (
          <Input
            {...commonInputAttrs}
            {...inputProps} // Spread additional specific input props
            type="number"
            value={value ?? ''} // Use empty string for controlled input if null/undefined
            onChange={handleNumberChange}
          />
        );
      case 'boolean':
        return (
          <div className="flex items-center h-10"> {/* Align with Input height */}
            <Switch
              id={inputId}
              checked={!!value} // Ensure boolean value
              onCheckedChange={handleSwitchChange}
              disabled={disabled}
              aria-label={label}
            />
          </div>
        );
      case 'select':
        return (
          <Select
            value={value?.toString() ?? ''} // Ensure value is a string for Select
            onValueChange={handleSelectChange}
            disabled={disabled}
          >
            <SelectTrigger id={inputId} className={commonInputAttrs.className}> {/* Apply error styling */} 
              <SelectValue placeholder={placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label ?? option.value} {/* Use label or fallback to value */}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'textarea':
        return (
          <Textarea
            {...commonInputAttrs}
            {...textareaProps} // Spread additional specific textarea props
            value={value ?? ''}
            onChange={handleTextareaChange}
            rows={textareaProps.rows || 3} // Default rows
          />
        );
      // Handles comma-separated lists (or array-like data) stored as strings in the input
      case 'list':
         // Display arrays joined, otherwise show the string/empty value
         const displayValue = Array.isArray(value) ? value.join(', ') : (value ?? '');
        return (
          <Textarea
            {...commonInputAttrs}
            {...textareaProps}
            value={displayValue}
            onChange={handleTextareaChange} // Store as comma-separated string directly
            placeholder={placeholder || 'Enter comma-separated values'}
            rows={textareaProps.rows || 2} // Default rows for list
          />
        );
      case 'text':
      default:
        return (
          <Input
            {...commonInputAttrs}
            {...inputProps}
            type="text"
            value={value ?? ''}
            onChange={handleInputChange}
          />
        );
    }
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
          <Label htmlFor={inputId}>
            {tooltip ? (
                <Tooltip>
                  <TooltipTrigger className="cursor-help underline decoration-dotted decoration-muted-foreground underline-offset-2">
                    {label}
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start">
                    <p className="max-w-xs text-sm">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
            ) : (
              label
            )}
          </Label>
      </div>
      {renderInput()}
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
};

export default FormField; 