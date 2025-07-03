/**
 * Shared type definitions for the EEG Workflow Wizard configuration.
 */

// Basic building block for a processing step
export interface StepConfig { enabled: boolean; value: any; }

// Specific value types for certain steps
export interface CropValue { start: number | null; end: number | null; }
export interface EpochValue { tmin: number | null; tmax: number | null; }

// New autoclean config value types
export interface FilteringValue {
  l_freq: number | null;
  h_freq: number | null;
  notch_freqs: number[] | null;
  notch_widths: number | null;
}

export interface ICAValue {
  method: string;
  n_components: number | null;
  fit_params: {
    ortho: boolean;
    extended: boolean;
  };
}

export interface ICLabelValue {
  ic_flags_to_reject: string[];
  ic_rejection_threshold: number;
}

// Nested structures within EpochSettings
export interface BaselineWindow { enabled: boolean; window: (number | null)[]; }
export interface VoltThreshold { eeg: number | string | null; } // Allow string for scientific notation input
export interface ThresholdRejection { enabled: boolean; volt_threshold?: VoltThreshold; }

// Settings specific to the Epoching step
export interface EpochSettings {
    enabled: boolean;
    value?: EpochValue; // Contains tmin/tmax
    event_id?: string[] | null; // Array of event ID strings or null for fixed-length epochs
    remove_baseline?: BaselineWindow;
    threshold_rejection?: ThresholdRejection;
}

// Settings specific to RejectionPolicy
export interface InterpolateKwargs { method?: string; }

// Structure for the Rejection Policy configuration
export interface RejectionPolicy {
    ch_flags_to_reject?: string[] | string; 
    ch_cleaning_mode?: 'interpolate' | 'drop' | null | string; // Allow null and string for flexibility
    interpolate_bads_kwargs?: InterpolateKwargs | null; 
    ic_flags_to_reject?: string[] | string; 
    ic_rejection_threshold?: number | string; // Allow string input
    remove_flagged_ics?: boolean;
}

// Structure for the main processing settings within a task
export interface TaskSettings {
    resample_step?: StepConfig & { value: number };
    filtering?: StepConfig & { value: FilteringValue };
    drop_outerlayer?: StepConfig & { value: string[] };
    eog_step?: StepConfig & { value: number[] };
    trim_step?: StepConfig & { value: number };
    crop_step?: StepConfig & { value: CropValue };
    reference_step?: StepConfig & { value: string };
    montage?: StepConfig & { value: string };
    ICA?: StepConfig & { value: ICAValue };
    ICLabel?: StepConfig & { value: ICLabelValue };
    epoch_settings?: EpochSettings;
    [key: string]: any; // Allow other potential settings
}


// Structure for a single task configuration
export interface TaskData {
    task_name: string;
    description?: string;
    dataset_name?: string;
    input_path?: string;
    settings?: TaskSettings;
}

// Top-level configuration structure - now simplified for single Python file
export interface ConfigType {
    tasks: Record<string, TaskData>; // Expects one task usually
}

// Type for validation errors object (path -> message)
export type ValidationErrors = Record<string, string>; 