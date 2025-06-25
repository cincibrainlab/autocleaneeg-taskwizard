import React from 'react';
import FormField from '@/components/FormField';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Check } from "lucide-react"; // Import Check icon
import { motion } from 'framer-motion'; // Import motion

// Define types (can be imported from a central location later)
interface InterpolateKwargs {
    method?: string; // Make optional as it might not exist
}

export interface RejectionPolicy { // Export if App.tsx needs it
    ch_flags_to_reject?: string[] | string;
    ch_cleaning_mode?: 'interpolate' | 'drop' | null | string; // Allow null explicitly based on docs
    interpolate_bads_kwargs?: InterpolateKwargs | null; // Allow null based on docs
    ic_flags_to_reject?: string[] | string;
    ic_rejection_threshold?: number | string; // Input might be string
    remove_flagged_ics?: boolean;
}

// Define props for the component
interface RejectionPolicySectionProps {
  taskName: string;
  policy: RejectionPolicy | undefined;
  onChange: (path: string, value: any) => void;
  errors: Record<string, string>;
}

// Define tooltips for rejection policy settings
const tooltips: Record<string, string> = {
    ch_flags_to_reject: "Select channel flags to reject. \'all\' is equivalent to noisy, uncorrelated, and bridged.",
    ch_cleaning_mode: "How to handle flagged channels. \'None\' adds to info['bads'], \'drop\' removes channels, \'interpolate\' fills them in.",
    interpolate_method: "Interpolation algorithm if Cleaning Mode is \'interpolate\'. Passed to raw.interpolate_bads().",
    ic_flags_to_reject: "Select IC flags to reject (e.g., muscle, heart). \'all\' includes muscle, heart, eye, channel noise, line noise.",
    ic_rejection_threshold: "Minimum confidence (0-1) for an IC flag to trigger rejection. ICs above this threshold are flagged.",
    remove_flagged_ics: "If enabled, subtract the signal accounted for by ICs flagged according to the threshold.",
};

// Define options for select inputs and toggle groups
const cleaningModeOptions = [
    { value: 'interpolate', label: 'Interpolate Bad Channels' },
    { value: 'drop', label: 'Drop Bad Channels' },
    { value: 'None', label: 'None (Mark as Bad)' }, // Added None option
];
const interpolationMethodOptions = [
    { value: 'spline', label: 'Spline (Default)' },
    { value: 'MNE', label: 'MNE' },
    { value: 'nan', label: 'NaN' },
    // Add other valid MNE methods if desired
];
const channelFlagOptions = ["noisy", "uncorrelated", "bridged"];
const icFlagOptions = ["muscle", "heart", "eye", "channel noise", "line noise"]; // Updated options

/**
 * Renders the form section for the 'rejection_policy' part of a task configuration.
 */
const RejectionPolicySection: React.FC<RejectionPolicySectionProps> = ({ taskName, policy, onChange, errors }) => {
  const currentPolicy = policy ?? {}; 
  const basePath = `tasks.${taskName}.rejection_policy`;

  // Animation variants (can be shared or defined locally)
  const sectionAnimation = {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 }
  };

  // Helper to ensure flag values are always arrays for ToggleGroup
  const getFlagsArray = (flags: string[] | string | undefined): string[] => {
      if (Array.isArray(flags)) return flags;
      if (typeof flags === 'string' && flags.trim() !== '') {
          // Handle potential "all" string if needed, though UI state is array
          if (flags.toLowerCase() === 'all') {
              // Decide how to represent "all" in the UI state. 
              // For now, assume if source was 'all', UI shows specific flags.
              // This depends on whether the config source might contain 'all'.
              // If source is always array from UI/default, this check isn't strictly needed.
          }
          return flags.split(',').map(s => s.trim()).filter(Boolean); // Ensure no empty strings
      }
      return [];
  };

  const currentChFlags = getFlagsArray(currentPolicy.ch_flags_to_reject);
  const currentIcFlags = getFlagsArray(currentPolicy.ic_flags_to_reject);
  
  // Handle 'None' selection for cleaning mode
  const handleCleaningModeChange = (newValue: string) => {
      const valueToSet = newValue === 'None' ? null : newValue;
      onChange(`${basePath}.ch_cleaning_mode`, valueToSet);
      // Optionally clear interpolation method if mode is not interpolate
      if (valueToSet !== 'interpolate') {
          onChange(`${basePath}.interpolate_bads_kwargs.method`, undefined);
      }
  };

  // Determine the value to show in the Select for cleaning mode (handle null)
  const cleaningModeValue = currentPolicy.ch_cleaning_mode === null ? 'None' : currentPolicy.ch_cleaning_mode;

  // Custom toggle handler since we're using custom toggle buttons
  const handleToggle = (flagType: 'ch' | 'ic', flag: string) => {
    const currentArray = flagType === 'ch' ? [...currentChFlags] : [...currentIcFlags];
    const path = flagType === 'ch' ? `${basePath}.ch_flags_to_reject` : `${basePath}.ic_flags_to_reject`;
    
    if (currentArray.includes(flag)) {
      onChange(path, currentArray.filter(f => f !== flag));
    } else {
      onChange(path, [...currentArray, flag]);
    }
  };

  return (
    <Card className="border-t-4 border-t-sky-500 shadow-md overflow-hidden">
      <CardHeader className="mx-1 mt-1 mb-0 rounded-lg bg-gradient-to-r from-sky-50 to-blue-50 pt-4 pb-4">
        <CardTitle>Artifact Rejection Policy</CardTitle>
        <CardDescription>Configure how bad channels and artifactual ICs are handled.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Channel Flags Custom Toggle Group */}
        <div className="space-y-1.5">
             <Label className="flex items-center">
                {tooltips.ch_flags_to_reject ? (
                    <Tooltip>
                        <TooltipTrigger className="cursor-help underline decoration-dotted decoration-muted-foreground underline-offset-2">
                            Channel Flags to Reject
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start">
                            <p className="max-w-xs text-sm">{tooltips.ch_flags_to_reject}</p>
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    'Channel Flags to Reject'
                )}
            </Label>
            <div className="flex flex-wrap gap-2">
                {channelFlagOptions.map(flag => {
                    const isSelected = currentChFlags.includes(flag);
                    return (
                        <button
                            key={flag}
                            type="button"
                            onClick={() => handleToggle('ch', flag)}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors
                                ${isSelected 
                                    ? 'bg-sky-100 text-sky-800 border-sky-300' 
                                    : 'bg-background border-input hover:bg-sky-50 hover:border-sky-200'}
                            `}
                        >
                            <div className={`
                                flex items-center justify-center w-4 h-4 border rounded-sm 
                                ${isSelected ? 'bg-sky-500 border-sky-600' : 'border-input'}
                            `}>
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <span>{flag}</span>
                        </button>
                    );
                })}
            </div>
             {errors[`${basePath}.ch_flags_to_reject`] && <p className="text-sm text-destructive mt-1">{errors[`${basePath}.ch_flags_to_reject`]}</p>}
        </div>

        <FormField
          path={`${basePath}.ch_cleaning_mode`}
          label="Channel Cleaning Mode"
          tooltip={tooltips.ch_cleaning_mode}
          value={cleaningModeValue} // Use derived value that handles null
          onChange={(_, val) => handleCleaningModeChange(val)} // Use custom handler
          error={errors[`${basePath}.ch_cleaning_mode`]}
          type="select"
          options={cleaningModeOptions}
          placeholder="Select mode..."
        />

        {/* Conditional Interpolation Method */}
        {currentPolicy.ch_cleaning_mode === 'interpolate' && (
           <motion.div // Wrap in motion.div
                className="pl-4 border-l-2 border-sky-200 ml-2"
                initial={sectionAnimation.initial}
                animate={sectionAnimation.animate}
                transition={sectionAnimation.transition}
            >
                <FormField
                    path={`${basePath}.interpolate_bads_kwargs.method`}
                    label="Interpolation Method"
                    tooltip={tooltips.interpolate_method}
                    value={currentPolicy.interpolate_bads_kwargs?.method ?? ''} // Default to empty string if undefined
                    onChange={onChange} // Standard handler is fine here
                    error={errors[`${basePath}.interpolate_bads_kwargs.method`]}
                    type="select"
                    options={interpolationMethodOptions}
                    placeholder="Select method..."
                />
           </motion.div> // End motion.div
        )}

        {/* IC Flags Custom Toggle Group */}
         <div className="space-y-1.5">
             <Label className="flex items-center">
                 {tooltips.ic_flags_to_reject ? (
                    <Tooltip>
                        <TooltipTrigger className="cursor-help underline decoration-dotted decoration-muted-foreground underline-offset-2">
                           IC Flags to Reject
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start">
                            <p className="max-w-xs text-sm">{tooltips.ic_flags_to_reject}</p>
                        </TooltipContent>
                    </Tooltip>
                 ) : (
                     'IC Flags to Reject'
                 )}
            </Label>
            <div className="flex flex-wrap gap-2">
                {icFlagOptions.map(flag => {
                    const isSelected = currentIcFlags.includes(flag);
                    return (
                        <button
                            key={flag}
                            type="button"
                            onClick={() => handleToggle('ic', flag)}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors
                                ${isSelected 
                                    ? 'bg-blue-100 text-blue-800 border-blue-300' 
                                    : 'bg-background border-input hover:bg-blue-50 hover:border-blue-200'}
                            `}
                        >
                            <div className={`
                                flex items-center justify-center w-4 h-4 border rounded-sm 
                                ${isSelected ? 'bg-blue-500 border-blue-600' : 'border-input'}
                            `}>
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <span>{flag}</span>
                        </button>
                    );
                })}
            </div>
            {errors[`${basePath}.ic_flags_to_reject`] && <p className="text-sm text-destructive mt-1">{errors[`${basePath}.ic_flags_to_reject`]}</p>}
        </div>

        <FormField
          path={`${basePath}.ic_rejection_threshold`}
          label="IC Rejection Threshold (0-1)"
          tooltip={tooltips.ic_rejection_threshold}
          value={currentPolicy.ic_rejection_threshold}
          onChange={onChange}
          error={errors[`${basePath}.ic_rejection_threshold`]}
          type="number"
          placeholder="0.3"
          inputProps={{ step: 0.05, min: 0, max: 1 }}
        />
        
        {/* Custom Remove Flagged ICs Toggle */}
        <div className="space-y-1.5">
            <Label className="flex items-center">
                {tooltips.remove_flagged_ics ? (
                    <Tooltip>
                        <TooltipTrigger className="cursor-help underline decoration-dotted decoration-muted-foreground underline-offset-2">
                            Remove Flagged ICs
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start">
                            <p className="max-w-xs text-sm">{tooltips.remove_flagged_ics}</p>
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    'Remove Flagged ICs'
                )}
            </Label>
            <div className="flex items-center">
                <button
                    type="button"
                    onClick={() => onChange(`${basePath}.remove_flagged_ics`, !currentPolicy.remove_flagged_ics)}
                    className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors
                        ${currentPolicy.remove_flagged_ics 
                            ? 'bg-indigo-100 text-indigo-800 border-indigo-300' 
                            : 'bg-background border-input hover:bg-indigo-50 hover:border-indigo-200'}
                    `}
                >
                    <div className={`
                        flex items-center justify-center w-4 h-4 border rounded-sm 
                        ${currentPolicy.remove_flagged_ics ? 'bg-indigo-500 border-indigo-600' : 'border-input'}
                    `}>
                        {currentPolicy.remove_flagged_ics && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span>Enable</span>
                </button>
            </div>
            {errors[`${basePath}.remove_flagged_ics`] && 
                <p className="text-sm text-destructive mt-1">{errors[`${basePath}.remove_flagged_ics`]}</p>
            }
        </div>

      </CardContent>
    </Card>
  );
};

export default RejectionPolicySection; 