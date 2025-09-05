/**
 * Functions for generating the content of downloadable files.
 */

import type { ConfigType } from '@/lib/types'; 
import { deepClone, getFirstTaskName } from '@/lib/utils';
import { taskScriptTemplate } from '@/lib/fileTemplates';

/**
 * Converts a JavaScript object to Python dictionary format string.
 */
function formatPythonDict(obj: any, indent: number = 0): string {
    const spaces = '    '.repeat(indent);
    
    if (obj === null) {
        return 'None';
    } else if (typeof obj === 'boolean') {
        return obj ? 'True' : 'False';
    } else if (typeof obj === 'string') {
        return `'${obj.replace(/'/g, "\\'")}'`;
    } else if (typeof obj === 'number') {
        return obj.toString();
    } else if (Array.isArray(obj)) {
        if (obj.length === 0) {
            return '[]';
        }
        const items = obj.map(item => formatPythonDict(item, 0)).join(', ');
        return `[${items}]`;
    } else if (typeof obj === 'object') {
        const entries = Object.entries(obj);
        if (entries.length === 0) {
            return '{}';
        }
        
        const lines = entries.map(([key, value]) => {
            const formattedValue = formatPythonDict(value, indent + 1);
            return `${spaces}    '${key}': ${formattedValue}`;
        });
        
        return `{\n${lines.join(',\n')}\n${spaces}}`;
    }
    
    return 'None';
}

/**
 * Prepares config data for Python dictionary generation.
 * Converts string arrays/numbers to their correct types.
 */
export const prepareConfigForPython = (configToPrepare: ConfigType): Record<string, any> => {
    const clonedTasks = deepClone(configToPrepare.tasks);
    const taskName = getFirstTaskName(clonedTasks);
    
    if (taskName && clonedTasks[taskName]) {
        const taskData = clonedTasks[taskName];
        
        // Convert string arrays to actual arrays
        const listStringPaths = [
            'settings.drop_outerlayer.value',
            'settings.eog_step.value',
            'settings.epoch_settings.remove_baseline.window',
            'settings.filtering.value.notch_freqs',
        ];

        listStringPaths.forEach(fieldPath => {
            const parts = fieldPath.split('.');
            let current: any = taskData;
            try {
                for (let i = 0; i < parts.length - 1; i++) {
                    if (current[parts[i]] === undefined || current[parts[i]] === null) throw new Error('Path segment not found');
                    current = current[parts[i]];
                }
                const key = parts[parts.length - 1];
                if (current && typeof current[key] === 'string') {
                    const potentialArray = current[key].split(',').map((s: string) => {
                        const trimmed = s.trim();
                        if (trimmed.toLowerCase() === 'null') return null;
                        const num = parseFloat(trimmed);
                        return isNaN(num) ? trimmed : num; 
                    }).filter((item: any) => item !== ''); 
                    
                    if (current[key].trim() !== '') {
                       current[key] = potentialArray;
                    } else {
                       current[key] = []; 
                    }
                } else if (current && Array.isArray(current[key])) {
                    current[key] = current[key].map((item: any) => {
                        if (typeof item === 'string' && item.toLowerCase() === 'null') return null;
                        if (typeof item === 'string') {
                             const num = parseFloat(item);
                             return isNaN(num) ? item : num;
                        }
                        return item;
                    });
                }
            } catch (e) { 
                // Ignore errors
            } 
        });

        // Convert string numbers to actual numbers
        const numericPaths = [
            'settings.resample_step.value',
            'settings.trim_step.value',
            'settings.crop_step.value.start',
            'settings.crop_step.value.end',
            'settings.epoch_settings.value.tmin',
            'settings.epoch_settings.value.tmax',
            'settings.epoch_settings.threshold_rejection.volt_threshold.eeg',
            'settings.component_rejection.value.ic_rejection_threshold',
            'settings.component_rejection.value.psd_fmax'
        ];

        numericPaths.forEach(fieldPath => {
            const parts = fieldPath.split('.');
            let current: any = taskData;
            try {
                for (let i = 0; i < parts.length - 1; i++) {
                    if (current[parts[i]] === undefined || current[parts[i]] === null) throw new Error('Path segment not found');
                    current = current[parts[i]];
                }
                const key = parts[parts.length - 1];
                if (current && current[key] !== null && current[key] !== undefined && typeof current[key] !== 'number') {
                    const num = parseFloat(current[key]);
                    if (!isNaN(num)) {
                        current[key] = num;
                    }
                }
            } catch (e) { /* Ignore */ }
        });

        // Ensure ic_rejection_overrides values are numbers
        try {
            const overrides = taskData.settings?.component_rejection?.value?.ic_rejection_overrides;
            if (overrides && typeof overrides === 'object') {
                Object.keys(overrides).forEach((key) => {
                    const num = parseFloat((overrides as any)[key]);
                    if (!isNaN(num)) {
                        (overrides as any)[key] = num;
                    }
                });
            }
        } catch (e) { /* Ignore */ }

        // Handle event_id - convert array of event IDs to dict or keep as null
        try {
          const eventIdPath = 'settings.epoch_settings.event_id';
          const parts = eventIdPath.split('.');
          let current: any = taskData;
          for (let i = 0; i < parts.length - 1; i++) {
              if (current[parts[i]] === undefined || current[parts[i]] === null) {
                  throw new Error('Path segment not found: ' + parts[i]);
              }
              current = current[parts[i]];
          }
          const key = parts[parts.length - 1];
          
          if (current && key in current) {
              if (Array.isArray(current[key]) && current[key].length > 0) {
                  // Convert array of event IDs to dictionary format
                  const eventDict: Record<string, number> = {};
                  current[key].forEach((eventId: string, index: number) => {
                      eventDict[eventId] = index + 1; // Start numbering from 1
                  });
                  current[key] = eventDict;
              } else if (current[key] === null || (Array.isArray(current[key]) && current[key].length === 0)) {
                  // Keep null for fixed-length epochs or empty arrays
                  current[key] = null;
              }
          }
        } catch (pathError) {
            console.error(`Error accessing event_id path: ${pathError}`);
        }
    }

    // Extract settings and flatten structure for Python config
    const pythonConfig: Record<string, any> = {};
    
    if (taskName && clonedTasks[taskName]?.settings) {
        const settings = clonedTasks[taskName].settings;
        
        // Map each setting to Python config format
        Object.entries(settings).forEach(([key, value]: [string, any]) => {
            if (key === 'epoch_settings') {
                // Special handling for epoch_settings
                pythonConfig[key] = {
                    enabled: value.enabled,
                    value: value.value,
                    event_id: value.event_id,
                    remove_baseline: value.remove_baseline,
                    threshold_rejection: value.threshold_rejection
                };
            } else {
                pythonConfig[key] = value;
            }
        });
    }
    
    return pythonConfig;
};


/**
 * Generates the Python task file content based on the configuration.
 */
export function generateTaskScript(config: ConfigType): string {
    const taskKey = getFirstTaskName(config.tasks);
  
    if (!taskKey || !config.tasks[taskKey]) {
      console.error("Task data not found in config for task script generation.");
      return taskScriptTemplate;
    }
    
    const taskData = config.tasks[taskKey];
    
    // Prepare the Python config dictionary
    const pythonConfig = prepareConfigForPython(config);
    const configDict = formatPythonDict(pythonConfig);
    
    // Generate class name
    let desiredClassName = taskData.task_name || taskKey;
    desiredClassName = desiredClassName
      .replace(/\s+/g, '_') 
      .replace(/[^a-zA-Z0-9_]/g, ''); 
    if (/^[0-9]/.test(desiredClassName)) {
      desiredClassName = '_' + desiredClassName; 
    }
    if (!desiredClassName) {
        desiredClassName = 'CustomTask'; 
    }
    
    // Capitalize first letter to make it a proper class name
    desiredClassName = desiredClassName.charAt(0).toUpperCase() + desiredClassName.slice(1);
    
    // Handle dataset_name and input_path
    const datasetName = taskData.dataset_name || '';
    const inputPath = taskData.input_path || '';
    
    // Handle epoching logic
    let epochingCode = 'self.create_regular_epochs(export=True)  # Export epochs';
    
    if (taskData.settings?.epoch_settings) {
      const epochSettings = taskData.settings.epoch_settings;
      
      if (!epochSettings.enabled) {
        epochingCode = '# Epoching disabled via configuration';
      } else if (epochSettings.event_id) {
        epochingCode = 'self.create_eventid_epochs() # Using event IDs';
      }
    }
    
    // Handle ICA component classification method
    let icaClassificationCode = '# ICA component classification skipped';

    if (taskData.settings?.component_rejection?.enabled) {
      const method = taskData.settings.component_rejection.method;
      if (method === 'iclabel' || method === 'icvision') {
        icaClassificationCode = `self.classify_ica_components(method='${method}')`;
      }
    }
    
    // Replace template placeholders
    let scriptContent = taskScriptTemplate
      .replace(/{{TASK_DESCRIPTION}}/g, taskData.description || 'CUSTOM TASK')
      .replace(/{{CLASS_NAME}}/g, desiredClassName)
      .replace(/{{CONFIG_DICT}}/g, configDict)
      .replace(/{{EPOCHING_CODE}}/g, epochingCode)
      .replace(/{{ICA_CLASSIFICATION_CODE}}/g, icaClassificationCode)
      .replace(/{{DATASET_NAME}}/g, datasetName)
      .replace(/{{INPUT_PATH}}/g, inputPath);
  
    return scriptContent;
}
  
 