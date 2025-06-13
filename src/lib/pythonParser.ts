/**
 * Functions for parsing uploaded Python task files back into wizard configuration.
 */

import type { ConfigType, TaskData, TaskSettings } from '@/lib/types';

/**
 * Parses a Python task file content and extracts the configuration.
 */
export function parsePythonTaskFile(pythonContent: string): ConfigType | null {
  try {
    // Extract the config dictionary from the Python file
    const configMatch = pythonContent.match(/config\s*=\s*({[\s\S]*?})\s*(?:\n\nclass|\nclass|$)/);
    if (!configMatch) {
      throw new Error('Could not find config dictionary in Python file');
    }

    const configString = configMatch[1];
    
    // Convert Python dictionary to JavaScript object
    const configObj = parsePythonDict(configString);
    
    // Extract class name and task description
    const classMatch = pythonContent.match(/class\s+(\w+)\s*\(/);
    const descriptionMatch = pythonContent.match(/#\s*=+\s*\n#\s+(.+?)\s+EEG PREPROCESSING CONFIGURATION/);
    
    const className = classMatch ? classMatch[1] : 'CustomTask';
    const description = descriptionMatch ? descriptionMatch[1] : 'Custom Task';
    
    // Convert parsed config to TaskData structure
    const taskData: TaskData = {
      mne_task: className,
      description: description,
      settings: convertPythonConfigToTaskSettings(configObj)
    };
    
    // Create the full configuration
    const config: ConfigType = {
      tasks: {
        [className]: taskData
      }
    };
    
    return config;
  } catch (error) {
    console.error('Error parsing Python file:', error);
    return null;
  }
}

/**
 * Converts a Python dictionary string to a JavaScript object.
 */
function parsePythonDict(pythonDict: string): any {
  try {
    // Clean up the Python dictionary string for JSON parsing
    let jsonString = pythonDict
      // Replace Python boolean values
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null')
      // Handle single quotes - convert to double quotes carefully
      .replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"')
      // Handle trailing commas before closing braces/brackets
      .replace(/,(\s*[}\]])/g, '$1');

    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing Python dictionary:', error);
    throw new Error('Failed to parse Python configuration dictionary');
  }
}

/**
 * Converts the parsed Python config object to TaskSettings structure.
 */
function convertPythonConfigToTaskSettings(configObj: any): TaskSettings {
  const settings: TaskSettings = {};
  
  // Map each config key to the appropriate TaskSettings structure
  Object.entries(configObj).forEach(([key, value]: [string, any]) => {
    switch (key) {
      case 'resample_step':
        settings.resample_step = {
          enabled: value.enabled || false,
          value: value.value || 500
        };
        break;
        
      case 'filtering':
        settings.filtering = {
          enabled: value.enabled || false,
          value: {
            l_freq: value.value?.l_freq || null,
            h_freq: value.value?.h_freq || null,
            notch_freqs: value.value?.notch_freqs || null,
            notch_widths: value.value?.notch_widths || null
          }
        };
        break;
        
      case 'drop_outerlayer':
        settings.drop_outerlayer = {
          enabled: value.enabled || false,
          value: Array.isArray(value.value) ? value.value : []
        };
        break;
        
      case 'eog_step':
        settings.eog_step = {
          enabled: value.enabled || false,
          value: Array.isArray(value.value) ? value.value : []
        };
        break;
        
      case 'trim_step':
        settings.trim_step = {
          enabled: value.enabled || false,
          value: value.value || 0
        };
        break;
        
      case 'crop_step':
        settings.crop_step = {
          enabled: value.enabled || false,
          value: {
            start: value.value?.start || null,
            end: value.value?.end || null
          }
        };
        break;
        
      case 'reference_step':
        settings.reference_step = {
          enabled: value.enabled || false,
          value: value.value || 'average'
        };
        break;
        
      case 'montage':
        settings.montage = {
          enabled: value.enabled || false,
          value: value.value || ''
        };
        break;
        
      case 'ICA':
        settings.ICA = {
          enabled: value.enabled || false,
          value: {
            method: value.value?.method || 'picard',
            n_components: value.value?.n_components || null,
            fit_params: {
              ortho: value.value?.fit_params?.ortho || false,
              extended: value.value?.fit_params?.extended || false
            }
          }
        };
        break;
        
      case 'ICLabel':
        settings.ICLabel = {
          enabled: value.enabled || false,
          value: {
            ic_flags_to_reject: Array.isArray(value.value?.ic_flags_to_reject) 
              ? value.value.ic_flags_to_reject 
              : [],
            ic_rejection_threshold: value.value?.ic_rejection_threshold || 0.8
          }
        };
        break;
        
      case 'epoch_settings':
        settings.epoch_settings = {
          enabled: value.enabled || false,
          value: {
            tmin: value.value?.tmin || null,
            tmax: value.value?.tmax || null
          },
          event_id: value.event_id ? JSON.stringify(value.event_id) : null,
          remove_baseline: {
            enabled: value.remove_baseline?.enabled || false,
            window: Array.isArray(value.remove_baseline?.window) 
              ? value.remove_baseline.window 
              : [null, 0]
          },
          threshold_rejection: {
            enabled: value.threshold_rejection?.enabled || false,
            volt_threshold: {
              eeg: value.threshold_rejection?.volt_threshold?.eeg || null
            }
          }
        };
        break;
        
      default:
        // Handle any other settings that might be present
        settings[key] = value;
        break;
    }
  });
  
  return settings;
}

/**
 * Validates that the parsed configuration is complete and valid.
 */
export function validateParsedConfig(config: ConfigType): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.tasks || Object.keys(config.tasks).length === 0) {
    errors.push('No tasks found in configuration');
    return { isValid: false, errors };
  }
  
  const taskName = Object.keys(config.tasks)[0];
  const task = config.tasks[taskName];
  
  if (!task.mne_task) {
    errors.push('Task name is missing');
  }
  
  if (!task.description) {
    errors.push('Task description is missing');
  }
  
  if (!task.settings) {
    errors.push('Task settings are missing');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}