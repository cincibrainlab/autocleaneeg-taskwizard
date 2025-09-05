import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface KeyValueEditorProps {
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
  className?: string;
}

const KeyValueEditor: React.FC<KeyValueEditorProps> = ({ value = {}, onChange, className = '' }) => {
  const [entries, setEntries] = useState<[string, number][]>(Object.entries(value));

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
    updateEntries([...entries, ['', 0]]);
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

  return (
    <div className={`space-y-2 ${className}`}>
      {entries.map(([k, v], idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <Input
            value={k}
            onChange={(e) => updateKey(idx, e.target.value)}
            placeholder="Component type"
            className="flex-1"
          />
          <Input
            type="number"
            value={v}
            onChange={(e) => updateValue(idx, parseFloat(e.target.value))}
            placeholder="0-1"
            className="w-24"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeEntry(idx)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={addEntry} className="mt-1">
        <Plus className="h-4 w-4 mr-1" /> Add Override
      </Button>
    </div>
  );
};

export default KeyValueEditor;
