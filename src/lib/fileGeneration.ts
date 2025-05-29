/**
 * Functions for generating the content of downloadable files.
 */

import jsYaml from 'js-yaml';
// Use aliases
import type { ConfigType, StageFilesConfig } from '@/lib/types'; 
import { deepClone, getFirstTaskName } from '@/lib/utils'; // Need deepClone and getFirstTaskName
import { taskScriptTemplate } from '@/lib/fileTemplates';
import { defaultStageFilesConfig } from '@/lib/configTemplates';

/**
 * Prepares the combined config object (tasks + stage files) for YAML conversion.
 * Converts certain string arrays/numbers back to their correct types within tasks.
 * Uses the default stage file configuration.
 */
// Input is just the main config (tasks part)
// Return type should reflect the full structure { tasks: ..., stage_files: ...}
export const prepareConfigForYaml = (configToPrepare: ConfigType): { tasks: Record<string, any>, stage_files: StageFilesConfig } => {
    // Clone the tasks part first
    const clonedTasks = deepClone(configToPrepare.tasks);
    const taskName = getFirstTaskName(clonedTasks);
    
    if (taskName && clonedTasks[taskName]) {
        const taskData = clonedTasks[taskName];
        
        // --- Start: Existing conversion logic for taskData --- 
        const listStringPaths = [
            'settings.drop_outerlayer.value',
            'settings.eog_step.value',
            'settings.remove_baseline.window',
            'settings.filtering.value.notch_freqs', // Ensure notch_freqs is always an array
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

        const numericPaths = [
            'settings.resample_step.value',
            'settings.trim_step.value',
            'settings.crop_step.value.start',
            'settings.crop_step.value.end',
            'settings.epoch_settings.value.tmin',
            'settings.epoch_settings.value.tmax',
            'settings.epoch_settings.threshold_rejection.volt_threshold.eeg',
            'rejection_policy.ic_rejection_threshold'
        ];

        const eventIdPathString = 'settings.epoch_settings.event_id';

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

        try {
          const parts = eventIdPathString.split('.');
          let current: any = taskData;
          for (let i = 0; i < parts.length - 1; i++) {
              if (current[parts[i]] === undefined || current[parts[i]] === null) {
                  throw new Error('Path segment not found: ' + parts[i]);
              }
              current = current[parts[i]];
          }
          const key = parts[parts.length - 1];
          if (current && key in current && typeof current[key] === 'string' && current[key].trim() !== '') {
              try {
                  current[key] = jsYaml.load(current[key], { schema: jsYaml.JSON_SCHEMA });
              } catch (parseError) {
                  console.error(`Failed to parse event_id string during YAML preparation: ${parseError}`);
              }
          } else if (current && key in current && current[key] === null) {
              // Keep null if explicitly null
          } else {
               if (current && key in current) {
                    current[key] = null;
               }
          }
        } catch (pathError) {
            console.error(`Error accessing event_id path during YAML preparation: ${pathError}`);
        }
        // --- End: Existing conversion logic for taskData --- 
    }

    // Construct the final object with processed tasks and default stage_files
    const finalConfigObject = {
        tasks: clonedTasks, 
        stage_files: defaultStageFilesConfig // Use the imported default
    };

    return finalConfigObject;
};


/**
 * Generates the task_script.py content based on the configuration.
 */
export function generateTaskScript(config: ConfigType): string {
    let scriptContent = taskScriptTemplate;
    const taskKey = getFirstTaskName(config.tasks);
  
    if (!taskKey || !config.tasks[taskKey]) {
      console.error("Task data not found in config for task script generation.");
      return scriptContent;
    }
    const taskData = config.tasks[taskKey];
  
    // --- 1. Replace Class Name ---
    let desiredClassName = taskData.mne_task || taskKey;
    desiredClassName = desiredClassName
      .replace(/\s+/g, '_') 
      .replace(/[^a-zA-Z0-9_]/g, ''); 
    if (/^[0-9]/.test(desiredClassName)) {
      desiredClassName = '_' + desiredClassName; 
    }
    if (!desiredClassName) {
        desiredClassName = 'CustomTask'; 
    }
    scriptContent = scriptContent.replace(
        /class RestingEyesOpen\(Task\):/, 
        `class ${desiredClassName}(Task):`
    );
  
    // --- 2. Modify Epoching Block ---
    if (!taskData.settings?.epoch_settings) {
      console.warn("Epoch settings not found, returning task script without epoch modifications.");
      return scriptContent; 
    }
  
    const epochSettings = taskData.settings.epoch_settings;
    const epochBlockStartMarker = "# --- EPOCHING BLOCK START ---";
    const epochBlockEndMarker = "# --- EPOCHING BLOCK END ---";
    const startIdx = scriptContent.indexOf(epochBlockStartMarker);
    const endIdx = scriptContent.indexOf(epochBlockEndMarker);
  
    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
      console.error("Epoching block markers not found in task script template!");
      return scriptContent; 
    }
  
    const beforeBlock = scriptContent.substring(0, startIdx);
    const epochBlockContent = scriptContent.substring(startIdx + epochBlockStartMarker.length, endIdx);
    const afterBlock = scriptContent.substring(endIdx + epochBlockEndMarker.length);
  
    if (!epochSettings.enabled) {
      scriptContent = beforeBlock + "\n    # Epoching disabled via configuration\n" + afterBlock;
    } else {
      let modifiedEpochBlock = epochBlockContent;
      if (epochSettings.event_id) { 
        modifiedEpochBlock = modifiedEpochBlock.replace(
          /self\.create_regular_epochs\(\)/g, 
          "self.create_eventid_epochs() # Using event IDs"
        );
      } else {
          modifiedEpochBlock = modifiedEpochBlock.replace(
          /self\.create_regular_epochs\(\)/g, 
          "self.create_regular_epochs() # Using fixed-length epochs"
        );
      }
      scriptContent = beforeBlock + epochBlockStartMarker + modifiedEpochBlock + epochBlockEndMarker + afterBlock;
    }
  
    return scriptContent;
  }
  
 