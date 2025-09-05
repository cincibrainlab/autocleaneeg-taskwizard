import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

// Available IC component types that can have thresholds overridden
const IC_COMPONENT_OPTIONS = [
  { value: 'muscle', label: 'Muscle' },
  { value: 'eog', label: 'EOG/Eye' },
  { value: 'heart', label: 'Heart' },
  { value: 'line_noise', label: 'Line Noise' },
  { value: 'ch_noise', label: 'Channel Noise' },
  { value: 'brain', label: 'Brain' }, // Brain is included as it can also have a threshold
];

interface KeyValueEditorProps {
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
  className?: string;
}

const KeyValueEditor: React.FC<KeyValueEditorProps> = ({ value = {}, onChange, className = '' }) => {
  const [entries, setEntries] = useState<[string, number][]>(Object.entries(value));

  // Sync entries with external value prop changes
  useEffect(() => {
    setEntries(Object.entries(value));
  }, [value]);

  const updateEntries = (newEntries: [string, number][]) => {
    setEntries(newEntries);
    const obj: Record<string, number> = {};
    newEntries.forEach(([k, v]) => {
      if (k.trim() !== '' && !isNaN(v)) {
        obj[k] = v;
      }
    });
    onChange(obj);
  };

  const addEntry = () => {
    // Find the first component type that hasn't been used yet
    const usedTypes = entries.map(([k]) => k);
    const availableType = IC_COMPONENT_OPTIONS.find(opt => !usedTypes.includes(opt.value));
    
    if (availableType) {
      updateEntries([...entries, [availableType.value, 0.5]]);
    }
  };

  const updateKey = (index: number, key: string) => {
    const newEntries = [...entries];
    newEntries[index] = [key, newEntries[index][1]];
    updateEntries(newEntries);
  };

  const updateValue = (index: number, value: number) => {
    const newEntries = [...entries];
    newEntries[index] = [newEntries[index][0], value];
    updateEntries(newEntries);
  };

  const removeEntry = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    updateEntries(newEntries);
  };

  // Get available options for a given entry (exclude already selected types)
  const getAvailableOptions = (currentKey: string) => {
    const usedTypes = entries.map(([k]) => k).filter(k => k !== currentKey);
    return IC_COMPONENT_OPTIONS.filter(opt => !usedTypes.includes(opt.value));
  };

  // Check if we can add more entries
  const canAddMore = entries.length < IC_COMPONENT_OPTIONS.length;

  return (
    <div className={`space-y-2 ${className}`}>
      {entries.map(([k, v], idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <Select
            value={k}
            onValueChange={(value) => updateKey(idx, value)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select component type" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableOptions(k).map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={v}
            onChange={(e) => updateValue(idx, parseFloat(e.target.value))}
            placeholder="0-1"
            className="w-24"
            step="0.1"
            min="0"
            max="1"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeEntry(idx)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {canAddMore && (
        <Button type="button" variant="secondary" size="sm" onClick={addEntry} className="mt-1">
          <Plus className="h-4 w-4 mr-1" /> Add Override
        </Button>
      )}
    </div>
  );
};

export default KeyValueEditor;
