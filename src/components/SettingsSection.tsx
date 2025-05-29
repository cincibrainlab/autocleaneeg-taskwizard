import React from 'react';
import FormField from './FormField';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

// Define types for the configuration structure this component deals with
// These should ideally be defined centrally and imported

interface StepConfig {
    enabled: boolean;
    value: any; // Can be number, string[], object, etc.
}

interface CropValue {
    start: number | null;
    end: number | null;
}

interface EpochValue {
    tmin: number | null;
    tmax: number | null;
}

interface BaselineWindow {
    enabled: boolean;
    window: (number | null)[];
}

interface VoltThreshold {
    eeg: number | string; // Can be number like 150e-6 or string like '150e-6'
}

interface ThresholdRejection {
    enabled: boolean;
    volt_threshold?: VoltThreshold; // Make optional to handle case where parent is disabled
}

interface EpochSettings {
    enabled: boolean;
    value?: EpochValue; // Optional for safety
    event_id?: string;
    remove_baseline?: BaselineWindow;
    threshold_rejection?: ThresholdRejection;
}

// Main settings object type
interface TaskSettings {
    resample_step?: StepConfig & { value: number };
    drop_outerlayer?: StepConfig & { value: string[] | string }; // Input is string, actual might be array
    eog_step?: StepConfig & { value: (number | string)[] | string };
    trim_step?: StepConfig & { value: number };
    crop_step?: StepConfig & { value: CropValue };
    reference_step?: StepConfig & { value: string };
    montage?: StepConfig & { value: string };
    epoch_settings?: EpochSettings;
    [key: string]: any; // Allow other potential settings
}

// Define specific options for select inputs
const montageOptions = [
  { value: 'GSN-HydroCel-129', label: 'GSN-HydroCel-129' },
  { value: 'GSN-HydroCel-124', label: 'GSN-HydroCel-124' },
];

const referenceOptions = [
    { value: 'average', label: 'Average Reference' },
    { value: 'REST', label: 'REST Reference' },
];

// Define tooltips (reuse from previous JS version)
const tooltips: Record<string, string> = {
    resample_step: "Resample Step: Changes the sampling rate of the EEG data (in Hz).",
    drop_outerlayer: "Drop Outer Layer: Removes specific outer channels by name (e.g., E17, E38). Provide comma-separated list.",
    eog_step: "EOG Correction Step: Settings for EOG artifact removal using MNE's SSP/ICA methods. Provide comma-separated parameters (e.g., n_components, ch_name, average).",
    trim_step: "Trim Step: Removes a specified number of initial samples from the data.",
    crop_step: "Crop Step: Selects a specific time window from the data (in seconds). Set end to null to crop from start to the end.",
    reference_step: "Reference Step: Sets the reference method for the EEG data (e.g., average, REST).",
    montage: "Montage: Specifies the electrode layout used during recording.",
    epoch_settings: "Epoching Settings: Defines how continuous data is segmented into epochs around events.",
    tmin: "Epoch Start Time (tmin): Start time of the epoch relative to the event marker (in seconds).",
    tmax: "Epoch End Time (tmax): End time of the epoch relative to the event marker (in seconds).",
    event_id: "Event ID: Specifies the event markers to epoch around. Use MNE-Python dictionary format as a string (e.g., {'DIN8'} or {'Stim/A': 1, 'Stim/B': 2}).",
    remove_baseline: "Baseline Correction: Removes the average signal value from a specified baseline period.",
    baseline_window: "Baseline Window: Time period used for baseline calculation (e.g., [null, 0] for pre-stimulus baseline). Comma-separated start,end.",
    threshold_rejection: "Threshold Rejection: Rejects epochs where the signal amplitude exceeds a defined threshold.",
    volt_threshold_eeg: "Voltage Threshold (EEG): Maximum peak-to-peak amplitude allowed for EEG channels (in Volts, e.g., 150e-6 for 150µV).",
};

// Define props for the SettingsSection component
interface SettingsSectionProps {
  taskName: string;
  settings: TaskSettings | undefined;
  onChange: (path: string, value: any) => void;
  errors: Record<string, string>; // Object mapping paths to error messages
}

/**
 * Renders the form section for the 'settings' part of a task configuration using TypeScript.
 * ONLY renders inputs for steps that are already enabled.
 */
const SettingsSection: React.FC<SettingsSectionProps> = ({ taskName, settings, onChange, errors }) => {
  if (!settings) return null;

  const basePath = `tasks.${taskName}.settings`;

  // Helper function that only renders the value input field(s) IF the step is enabled.
  const renderStepValueInput = (
      stepKey: keyof TaskSettings,
      valueLabel: string,
      valueType: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'list',
      valueOptions: { value: string | number; label?: string }[] = [],
      valuePlaceholder: string = ''
  ) => {
    const stepConfig = settings[stepKey] as StepConfig | undefined;
    // Only proceed if the step exists and is enabled
    if (!stepConfig || !stepConfig.enabled) return null;

    const valuePath = `${basePath}.${stepKey}.value`;

    // Return the value input field directly, REMOVE wrapped in motion.div
    return (
        <div
            key={`${stepKey as string}-value`}
            className="mb-4 p-3 border rounded-md bg-muted/30"
        >
           <FormField
             path={valuePath}
             label={tooltips[stepKey as string]?.split(':')[0] ?? stepKey as string}
             tooltip={tooltips[stepKey as string]}
             value={stepConfig.value} 
             onChange={onChange}
             error={errors[valuePath]}
             type={valueType}
             options={valueOptions}
             placeholder={valuePlaceholder}
           />
        </div>
    );
  };

  const epochSettings = settings.epoch_settings;

  return (
    <Card>
        <CardHeader>
            <CardTitle>Processing Settings</CardTitle>
            <CardDescription>Configure values for the processing steps enabled in the previous step.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Render simple steps */}
          {renderStepValueInput('resample_step', 'Resample Frequency (Hz)', 'number')}
          {renderStepValueInput('drop_outerlayer', 'Channels to Drop (comma-sep)', 'list', [], 'E17, E38')}
          {renderStepValueInput('eog_step', 'EOG Parameters (comma-sep)', 'list', [], '1, 32, 8')}
          {renderStepValueInput('trim_step', 'Samples to Trim', 'number')}

          {/* Crop Step - Nested Value - RENDER ONLY IF ENABLED */}
          {settings.crop_step?.enabled && (
              <div
                  key="crop_step-value"
                  className="mb-4 p-3 border rounded-md bg-muted/30"
              >
                   <Label className='font-medium mb-2 block'>{tooltips.crop_step?.split(':')[0] ?? "Crop Step"}</Label>
                   <div className="grid grid-cols-2 gap-3">
                      <FormField
                          path={`${basePath}.crop_step.value.start`}
                          label="Start Time (s)"
                          tooltip="Crop start time in seconds. Use 0 for beginning."
                          value={settings.crop_step.value?.start}
                          onChange={onChange}
                          error={errors[`${basePath}.crop_step.value.start`]}
                          type="number"
                          placeholder="0"
                      />
                      <FormField
                          path={`${basePath}.crop_step.value.end`}
                          label="End Time (s)"
                          tooltip="Crop end time in seconds. Leave blank or null for end of data."
                          value={settings.crop_step.value?.end}
                          onChange={(path, val) => {
                              const numVal = val === '' ? null : parseFloat(val);
                              onChange(path, isNaN(numVal as number) ? val : numVal)
                          }}
                          error={errors[`${basePath}.crop_step.value.end`]}
                          type="number"
                          placeholder="(end of data)"
                      />
                  </div>
              </div>
          )}

          {/* Reference Step - Select - RENDER ONLY IF ENABLED */}
          {renderStepValueInput('reference_step', 'Reference Method', 'select', referenceOptions)}

          {/* Montage Step - Select - RENDER ONLY IF ENABLED */}
          {renderStepValueInput('montage', 'Montage Name', 'select', montageOptions)}

          {/* Epoch Settings - Nested Object - RENDER ONLY IF ENABLED */}
          {epochSettings?.enabled && (
              <div
                  key="epoch_settings-value"
                  className="mb-4 p-3 border rounded-md bg-muted/30"
              >
                   <Label className='font-medium mb-2 block'>{tooltips.epoch_settings?.split(':')[0] ?? "Epoching Step"}</Label>
                   <div className="space-y-3">
                       {/* tmin, tmax */}
                       <div className="grid grid-cols-2 gap-3">
                          <FormField
                              path={`${basePath}.epoch_settings.value.tmin`}
                              label="Epoch Start (tmin, s)"
                              tooltip={tooltips.tmin}
                              value={epochSettings.value?.tmin}
                              onChange={onChange}
                              error={errors[`${basePath}.epoch_settings.value.tmin`]}
                              type="number"
                              placeholder="-0.5"
                          />
                          <FormField
                              path={`${basePath}.epoch_settings.value.tmax`}
                              label="Epoch End (tmax, s)"
                              tooltip={tooltips.tmax}
                              value={epochSettings.value?.tmax}
                              onChange={onChange}
                              error={errors[`${basePath}.epoch_settings.value.tmax`]}
                              type="number"
                              placeholder="2.5"
                          />
                      </div>

                      {/* event_id */}
                      <FormField
                          path={`${basePath}.epoch_settings.event_id`}
                          label="Event ID(s)"
                          tooltip={tooltips.event_id}
                          value={epochSettings.event_id}
                          onChange={onChange}
                          error={errors[`${basePath}.epoch_settings.event_id`]}
                          type="text" // Or textarea if expected to be long
                          placeholder="{'DIN8'}"
                      />

                      {/* Baseline Correction - Nested */}
                      {epochSettings.remove_baseline?.enabled && (
                          <div
                              key="baseline-value"
                              className="mb-4 p-3 border rounded-md bg-muted/20"
                          >
                               <Label className='font-medium mb-2 block'>{tooltips.remove_baseline?.split(':')[0] ?? "Baseline Correction"}</Label>
                               <FormField
                                  path={`${basePath}.epoch_settings.remove_baseline.window`}
                                  label="Baseline Window (comma-sep)"
                                  tooltip={tooltips.baseline_window}
                                  value={epochSettings.remove_baseline.window} // Expects array, FormField handles list type
                                  onChange={onChange}
                                  error={errors[`${basePath}.epoch_settings.remove_baseline.window`]}
                                  type="list"
                                  placeholder="null, 0"
                               />
                          </div>
                      )}

                       {/* Threshold Rejection - Nested */}
                       {epochSettings.threshold_rejection?.enabled && (
                           <div
                               key="threshold-value"
                               className="mb-4 p-3 border rounded-md bg-muted/20"
                           >
                               <Label className='font-medium mb-2 block'>{tooltips.threshold_rejection?.split(':')[0] ?? "Threshold Rejection"}</Label>
                               <FormField
                                    path={`${basePath}.epoch_settings.threshold_rejection.volt_threshold.eeg`}
                                    label="EEG Voltage Threshold (V)"
                                    tooltip={tooltips.volt_threshold_eeg}
                                    value={epochSettings.threshold_rejection.volt_threshold?.eeg}
                                    onChange={onChange}
                                    error={errors[`${basePath}.epoch_settings.threshold_rejection.volt_threshold.eeg`]}
                                    type="text" // Allow scientific notation input
                                    placeholder="150e-6"
                                />
                           </div>
                       )}
                  </div>
              </div>
          )}
        </CardContent>
    </Card>
  );
};

export default SettingsSection; 