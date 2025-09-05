/**
 * Validation functions for the wizard configurations.
 */

// Use alias for types
import type { ConfigType, ValidationErrors } from '@/lib/types';
// Use alias for App
import { getFirstTaskName } from '@/App';

/**
 * Validates the main Autoclean configuration object.
 */
export const validateConfig = (configToValidate: ConfigType): ValidationErrors => {
  const errors: ValidationErrors = {};
  const taskName = getFirstTaskName(configToValidate.tasks);
  
  if (!taskName || !configToValidate.tasks[taskName]) {
      return { general: 'Configuration is missing task data.' };
  }
  const taskData = configToValidate.tasks[taskName];
  const basePath = `tasks.${taskName}`;

  // Required fields
  if (!taskData.task_name) errors[`${basePath}.task_name`] = 'Task name is required.';

  // --- Settings Validation ---
  if (taskData.settings) {
      const settingsPath = `${basePath}.settings`;
      
      // Resample Step
      if (taskData.settings.resample_step?.enabled) {
          const val = taskData.settings.resample_step.value;
          if (val === null || val === undefined || typeof val !== 'number' || isNaN(val) || val <= 0) {
              errors[`${settingsPath}.resample_step.value`] = 'Resample value must be a positive number.';
          }
      }

      // Filtering validation
      if (taskData.settings.filtering?.enabled && taskData.settings.filtering.value) {
          const filtering = taskData.settings.filtering.value;
          const filterPath = `${settingsPath}.filtering.value`;
          
          if (filtering.l_freq !== null && (isNaN(Number(filtering.l_freq)) || Number(filtering.l_freq) < 0)) {
              errors[`${filterPath}.l_freq`] = 'Low frequency must be a positive number or null.';
          }
          if (filtering.h_freq !== null && (isNaN(Number(filtering.h_freq)) || Number(filtering.h_freq) <= 0)) {
              errors[`${filterPath}.h_freq`] = 'High frequency must be a positive number or null.';
          }
          if (filtering.l_freq !== null && filtering.h_freq !== null) {
              const lFreq = Number(filtering.l_freq);
              const hFreq = Number(filtering.h_freq);
              if (!isNaN(lFreq) && !isNaN(hFreq) && hFreq <= lFreq) {
                  errors[`${filterPath}.h_freq`] = 'High frequency must be greater than low frequency.';
              }
          }
          if (filtering.notch_widths !== null && (isNaN(Number(filtering.notch_widths)) || Number(filtering.notch_widths) <= 0)) {
              errors[`${filterPath}.notch_widths`] = 'Notch width must be a positive number.';
          }
      }

      // Drop Outerlayer
      if (taskData.settings.drop_outerlayer?.enabled) {
          const val = taskData.settings.drop_outerlayer.value;
          if (typeof val === 'string' && val.trim() !== '' && !val.match(/^([a-zA-Z0-9_-]+(,\s*)?)*$/)) {
               errors[`${settingsPath}.drop_outerlayer.value`] = 'Enter comma-separated channel names (alphanumeric, _, - allowed).';
          } else if (Array.isArray(val) && val.some(item => typeof item !== 'string')) {
               errors[`${settingsPath}.drop_outerlayer.value`] = 'Invalid format for channel list.';
          }
      }

      // ICA validation
      if (taskData.settings.ICA?.enabled && taskData.settings.ICA.value) {
          const ica = taskData.settings.ICA.value;
          const icaPath = `${settingsPath}.ICA.value`;
          
          if (!ica.method?.trim()) {
              errors[`${icaPath}.method`] = 'ICA method is required.';
          }
          if (ica.n_components !== null && (isNaN(Number(ica.n_components)) || Number(ica.n_components) <= 0)) {
              errors[`${icaPath}.n_components`] = 'Number of ICA components must be a positive number or null for automatic.';
          }
      }

      // Component rejection validation
      if (taskData.settings.component_rejection?.enabled && taskData.settings.component_rejection.value) {
          const componentRejection = taskData.settings.component_rejection.value;
          const componentRejectionPath = `${settingsPath}.component_rejection.value`;

          if (componentRejection.ic_rejection_threshold < 0 || componentRejection.ic_rejection_threshold > 1) {
              errors[`${componentRejectionPath}.ic_rejection_threshold`] = 'IC rejection threshold must be between 0 and 1.';
          }
          if (componentRejection.ic_rejection_overrides) {
              const invalid = Object.values(componentRejection.ic_rejection_overrides).some(
                  (v) => typeof v !== 'number' || v < 0 || v > 1
              );
              if (invalid) {
                  errors[`${componentRejectionPath}.ic_rejection_overrides`] = 'Override values must be between 0 and 1.';
              }
          }
          if (componentRejection.psd_fmax !== undefined && (isNaN(Number(componentRejection.psd_fmax)) || Number(componentRejection.psd_fmax) <= 0)) {
              errors[`${componentRejectionPath}.psd_fmax`] = 'PSD fmax must be a positive number.';
          }
      }

      // --- Epoch Settings Validation ---
      if (taskData.settings?.epoch_settings?.enabled) {
          const epochSettingsPath = `${settingsPath}.epoch_settings`;
          
          // Event ID Validation
          if (taskData.settings.epoch_settings.event_id && typeof taskData.settings.epoch_settings.event_id === 'string') {
              const eventIdPath = `${epochSettingsPath}.event_id`;
              try {
                  const parsed = JSON.parse(taskData.settings.epoch_settings.event_id);
                  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                      errors[eventIdPath] = 'Event ID must be a valid YAML/JSON dictionary string (e.g., {\'DIN8\'} or {\'"key"\': "value"}).';
                  }
              } catch (e) {
                  errors[eventIdPath] = 'Invalid Event ID format. Must be a valid YAML/JSON dictionary string.';
              }
          }
          
          // Baseline Window
          if (taskData.settings.epoch_settings?.remove_baseline?.enabled) {
              const winPath = `${epochSettingsPath}.remove_baseline.window`;
              const val = taskData.settings.epoch_settings.remove_baseline.window;
              if (!Array.isArray(val) || val.length !== 2 || val.some((v: any) => v !== null && typeof v !== 'number')) {
                   errors[winPath] = 'Baseline window must be an array of two numbers or null (e.g., [-0.1, 0] or [null, 0]).';
              }
          }
          
          // Volt Threshold
          if (taskData.settings.epoch_settings?.threshold_rejection?.enabled) {
               const threshPath = `${epochSettingsPath}.threshold_rejection.volt_threshold.eeg`;
               const val = taskData.settings.epoch_settings.threshold_rejection?.volt_threshold?.eeg;
               if (val === null || val === undefined || val === '' || (typeof val !== 'number' && isNaN(parseFloat(val as string)))) {
                    errors[threshPath] = 'EEG Threshold must be a valid number (e.g., 150e-6).';
               } else {
                   const numVal = typeof val === 'number' ? val : parseFloat(val as string);
                   if (numVal <= 0) {
                       errors[threshPath] = 'EEG Threshold must be positive.';
                   }
               }
          }
      }
  }

  return errors;
};