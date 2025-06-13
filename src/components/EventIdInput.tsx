import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EventIdInputProps {
  eventIds: string[];
  onChange: (eventIds: string[]) => void;
  className?: string;
}

export function EventIdInput({ eventIds, onChange, className = '' }: EventIdInputProps) {
  const [newEventId, setNewEventId] = useState('');

  const addEventId = () => {
    const trimmed = newEventId.trim();
    if (trimmed && !eventIds.includes(trimmed)) {
      onChange([...eventIds, trimmed]);
      setNewEventId('');
    }
  };

  const removeEventId = (index: number) => {
    const updated = eventIds.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEventId();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label className="text-sm font-medium">Event IDs</Label>
        <p className="text-xs text-muted-foreground mb-3">
          Add event markers to create epochs around. Common examples: DIN8, standard, target, etc.
        </p>
      </div>

      {/* Add new event ID */}
      <div className="flex gap-2">
        <Input
          value={newEventId}
          onChange={(e) => setNewEventId(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter event ID (e.g., DIN8)"
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addEventId}
          disabled={!newEventId.trim() || eventIds.includes(newEventId.trim())}
          size="sm"
          className="px-3"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Display existing event IDs */}
      {eventIds.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Added Event IDs:</Label>
          <div className="flex flex-wrap gap-2">
            {eventIds.map((eventId, index) => (
              <div
                key={index}
                className="flex items-center gap-1 px-3 py-1 bg-lime-100 border border-lime-200 rounded-md text-sm"
              >
                <span className="font-mono">{eventId}</span>
                <button
                  type="button"
                  onClick={() => removeEventId(index)}
                  className="text-lime-600 hover:text-lime-800 p-0.5 hover:bg-lime-200 rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {eventIds.length === 0 && (
        <div className="text-sm text-muted-foreground italic">
          No event IDs added. Add event markers to enable event-based epoching.
        </div>
      )}
    </div>
  );
}