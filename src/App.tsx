import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { saveAs } from 'file-saver';
import { CheckCircle2, DownloadCloud, GitBranch } from 'lucide-react';

import DenseWizard from '@/components/DenseWizard';
import ThemeToggle from '@/components/ThemeToggle';
import BrainIcon from '@/components/BrainIcon';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import type { ConfigType, TaskData, ValidationErrors } from '@/lib/types';
import { defaultTaskSettings, taskTemplates } from '@/lib/configTemplates';
import { cn, deepClone, formatStepKey } from '@/lib/utils';
import { validateConfig } from '@/lib/validation';
import { generateTaskScript } from '@/lib/fileGeneration';

export const getFirstTaskName = (tasks: Record<string, TaskData>): string | undefined => {
  return Object.keys(tasks)[0];
};

const getTaskConfig = (taskName: string | null): TaskData => {
  if (taskName && taskTemplates[taskName]) {
    return deepClone(taskTemplates[taskName]);
  }
  const customTask = deepClone(defaultTaskSettings);
  customTask.task_name = 'CustomTask';
  customTask.description = 'Custom task configuration';
  return customTask;
};

function App() {
  const [config, setConfig] = useState<ConfigType>({ tasks: {} });
  const [configFinalized, setConfigFinalized] = useState<boolean>(false);
  const [pythonPreview, setPythonPreview] = useState<string>('');
  const [errors, setErrors] = useState<ValidationErrors>({});

  const currentTaskName = useMemo(() => getFirstTaskName(config.tasks), [config.tasks]);
  const currentTaskData = currentTaskName ? config.tasks[currentTaskName] : undefined;

  const handleStartOptionSelect = (startOptionKey: string) => {
    let taskData: TaskData;
    let finalTaskName: string;

    if (startOptionKey === 'Custom') {
      taskData = getTaskConfig(null);
      finalTaskName = 'CustomTask';
    } else {
      taskData = getTaskConfig(startOptionKey);
      finalTaskName = startOptionKey;
    }

    setConfig({
      tasks: { [finalTaskName]: taskData }
    });

    setErrors({});
    setPythonPreview('');
    setConfigFinalized(true);
  };

  const handleConfigLoaded = (loadedConfig: ConfigType) => {
    setConfig(loadedConfig);
    setErrors({});
    setPythonPreview('');
    setConfigFinalized(true);
  };

  const handleInputChange = useCallback((path: string, value: any) => {
    setConfig((prevConfig) => {
      const newConfig = deepClone(prevConfig);
      let current: any = newConfig;
      const parts = path.split('.');

      try {
        for (let i = 0; i < parts.length - 1; i++) {
          if (current[parts[i]] === undefined || current[parts[i]] === null) {
            if (parts[i] === 'value' && (parts[i - 1] === 'epoch_settings' || parts[i - 1] === 'crop_step')) {
              current[parts[i]] = {};
            } else if (parts[i] === 'window' && parts[i - 1] === 'remove_baseline') {
              current[parts[i]] = [null, null];
            } else if (parts[i] === 'volt_threshold' && parts[i - 1] === 'threshold_rejection') {
              current[parts[i]] = {};
            } else {
              console.error(`Invalid path segment: ${parts[i]} in path ${path}`);
              return prevConfig;
            }
          }
          current = current[parts[i]];
        }

        const finalPart = parts[parts.length - 1];
        if (!Number.isNaN(Number(finalPart)) && Array.isArray(current)) {
          const index = Number(finalPart);
          if (index >= 0 && index < current.length) {
            current[index] = value;
          } else {
            console.error(`Index ${index} out of bounds for path ${path}`);
            return prevConfig;
          }
        } else {
          current[finalPart] = value;
        }

        if (parts.length === 3 && parts[0] === 'tasks' && parts[2] === 'task_name') {
          const oldTaskName = parts[1];
          const newTaskName =
            typeof value === 'string'
              ? value.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
              : `InvalidTaskName_${Date.now()}`;

          if (newTaskName && oldTaskName !== newTaskName && newConfig.tasks[oldTaskName]) {
            const taskData = newConfig.tasks[oldTaskName];
            delete newConfig.tasks[oldTaskName];
            taskData.task_name = value;
            newConfig.tasks[newTaskName] = taskData;
          } else if (newTaskName && oldTaskName === newTaskName) {
            if (newConfig.tasks[newTaskName]) {
              newConfig.tasks[newTaskName].task_name = value;
            }
          }
        }
      } catch (error) {
        console.error(`Error updating config at path ${path}:`, error);
        return prevConfig;
      }

      return newConfig;
    });

    setErrors((prev) => {
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }, []);

  const handlePreview = () => {
    const configErrors = validateConfig(config);
    setErrors(configErrors);

    if (Object.keys(configErrors).length > 0) {
      setPythonPreview('Please fix the highlighted issues before generating a preview.');
      return;
    }

    try {
      const pythonScript = generateTaskScript(config);
      setPythonPreview(pythonScript);
    } catch (error: any) {
      console.error('Python Generation Error:', error);
      setPythonPreview(`Failed to generate Python script: ${error.message}`);
      setErrors((prev) => ({
        ...prev,
        pythonGeneration: `Failed to generate Python script: ${error.message}`
      }));
    }
  };

  const handleDownload = async () => {
    const configErrors = validateConfig(config);
    setErrors(configErrors);

    if (Object.keys(configErrors).length > 0) {
      alert('Please fix the validation errors before downloading.');
      return;
    }

    try {
      const taskScriptContent = generateTaskScript(config);
      const taskName = getFirstTaskName(config.tasks);
      const suffix = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
      const base = taskName ? taskName.toLowerCase() : 'task';
      const filename = `${base}-${suffix}.py`;

      const blob = new Blob([taskScriptContent], { type: 'text/x-python' });
      saveAs(blob, filename);
      setPythonPreview(taskScriptContent);
    } catch (error: any) {
      console.error('Python Generation/Download Error:', error);
      alert(`Failed to generate or download Python file: ${error.message}`);
      setErrors((prev) => ({
        ...prev,
        fileGeneration: `Failed to generate Python file: ${error.message}`
      }));
    }
  };

  useEffect(() => {
    setPythonPreview('');
  }, [currentTaskName]);

  const completionLabels = useMemo(() => {
    if (!currentTaskData?.settings) return [];
    return Object.entries(currentTaskData.settings)
      .filter(([key, value]) => value && typeof value === 'object' && 'enabled' in value)
      .map(([key, value]) => ({
        key,
        enabled: Boolean((value as any).enabled)
      }));
  }, [currentTaskData]);

  return (
    <TooltipProvider>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="absolute top-1/3 right-10 h-52 w-52 rounded-full bg-purple-300/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-300/20 blur-3xl" />
        </div>

        <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 md:px-10 md:py-16">
          <header className="grid gap-6 rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
                  <GitBranch className="h-3.5 w-3.5" /> AutocleanEEG Task Composer
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/90 text-white shadow-lg">
                    <BrainIcon />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 md:text-3xl">
                      Build dense EEG workflows in a single canvas
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 md:text-base">
                      Configure every preprocessing decision without paging through tabs. Sections stay visible, context stays intact.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end md:self-start">
                <Button
                  variant="outline"
                  className="border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200"
                  onClick={() =>
                    window.open('https://github.com/cincibrainlab/autoclean_pipeline', '_blank', 'noopener,noreferrer')
                  }
                >
                  Repository
                </Button>
                <ThemeToggle variant="inverted" />
              </div>
            </div>
            {configFinalized && completionLabels.length > 0 && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {completionLabels.slice(0, 3).map((label) => (
                  <div
                    key={label.key}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300"
                  >
                    <CheckCircle2
                      className={cn(
                        'h-4 w-4',
                        label.enabled ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-600'
                      )}
                    />
                    <span className="truncate">
                      {formatStepKey(label.key)}
                      {!label.enabled && ' (disabled)'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </header>

          {configFinalized && !currentTaskName && (
            <Alert variant="destructive">
              <AlertTitle>Configuration missing task name</AlertTitle>
              <AlertDescription>
                The loaded file does not contain a task entry. Choose a blueprint or import a valid task file.
              </AlertDescription>
            </Alert>
          )}

          <DenseWizard
            config={config}
            currentTaskName={currentTaskName}
            configFinalized={configFinalized}
            errors={errors}
            pythonPreview={pythonPreview}
            onStartOptionSelect={handleStartOptionSelect}
            onConfigLoaded={handleConfigLoaded}
            onInputChange={handleInputChange}
            onPreview={handlePreview}
            onDownload={handleDownload}
          />

          <footer className="flex flex-col items-center gap-3 border-t border-slate-200/70 pt-6 text-xs text-slate-500 dark:border-slate-800/70 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <DownloadCloud className="h-3.5 w-3.5" />
              <span>Generated scripts mirror the AutocleanEEG pipeline CLI format.</span>
            </div>
            <p>© {new Date().getFullYear()} Cincinnati Children's Hospital Medical Center</p>
          </footer>
        </main>
      </div>
    </TooltipProvider>
  );
}

export default App;
