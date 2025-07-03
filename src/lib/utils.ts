import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Import types and templates needed for task script generation
import type { ConfigType, TaskData } from '@/lib/types';
import { taskScriptTemplate } from '@/lib/fileTemplates';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Performs a deep clone of an object or array.
 * Handles nested objects, arrays, dates, and primitives.
 * Does not handle functions or complex class instances correctly.
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (Array.isArray(obj)) {
    const arrCopy = [] as any[];
    obj.forEach((_, i) => {
      arrCopy[i] = deepClone(obj[i]);
    });
    return arrCopy as T;
  }

  if (typeof obj === 'object' && obj !== null) {
    const objCopy = {} as { [key: string]: any };
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        objCopy[key] = deepClone((obj as any)[key]);
      }
    }
    return objCopy as T;
  }

  // Should not happen for valid inputs, but added for type safety
  return obj; 
}


/**
 * Generates the task_script.py content based on the configuration.
 * Modifies the epoching section based on settings.
 */
export function generateTaskScript(config: ConfigType): string {
  let scriptContent = taskScriptTemplate;
  const taskKey = getFirstTaskName(config.tasks);

  if (!taskKey || !config.tasks[taskKey]) {
    console.error("Task data not found in config for task script generation.");
    return scriptContent;
  }
  const taskData = config.tasks[taskKey];

  // Sanitize class name
  let className = taskData.task_name || taskKey;
  className = className
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/^[0-9]/, '_$&') || 'CustomTask';

  // Create file name (snake_case)
  const fileName = className.toLowerCase();
  
  // Replace placeholders
  scriptContent = scriptContent
    .replace(/{{TASK_NAME}}/g, fileName)
    .replace(/{{CLASS_NAME}}/g, className)
    .replace(/{{TASK_DESCRIPTION}}/g, taskData.description || "EEG processing task");

  // Handle epoching block
  const epochSettings = taskData.settings?.epoch_settings;
  let epochingBlock = "";

  if (epochSettings?.enabled) {
    if (epochSettings.event_id) {
      epochingBlock = `        self.create_eventid_epochs()  # Using event IDs

        # Prepare epochs for ICA
        self.prepare_epochs_for_ica()

        # Clean epochs using GFP
        self.gfp_clean_epochs()`;
    } else {
      epochingBlock = `        self.create_regular_epochs()  # Using fixed-length epochs

        # Prepare epochs for ICA
        self.prepare_epochs_for_ica()

        # Clean epochs using GFP
        self.gfp_clean_epochs()`;
    }
  } else {
    epochingBlock = "        # Epoching disabled via configuration";
  }

  scriptContent = scriptContent.replace(/{{EPOCHING_BLOCK}}/g, epochingBlock);

  return scriptContent;
}


// Helper to get the first task key (since we only handle one)
export const getFirstTaskName = (tasks: Record<string, TaskData>): string | undefined => {
    // Return the first key found, or undefined if the object is empty
    return Object.keys(tasks)[0]; 
}

// Helper function to generate readable labels from snake_case keys
export const formatStepKey = (key: string): string => {
    const formatted = key
        .replace(/_step$/, '') // Remove trailing '_step'
        .replace(/_/g, ' ')    // Replace underscores with spaces
        .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
    return formatted;
}; 
