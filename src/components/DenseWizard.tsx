import React from 'react';
import { Check, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import FormField from '@/components/FormField';
import { AnimatedSection } from '@/components/AnimatedSection';
import { FileUpload } from '@/components/FileUpload';
import RejectionPolicySection from '@/components/RejectionPolicySection';
import KeyValueEditor from '@/components/KeyValueEditor';
import ArtifactFunctionDoc from '@/components/ArtifactFunctionDoc';
import { EventIdInput } from '@/components/EventIdInput';

import wizardLayout from '@/lib/wizard-layout.json';
import { montageOptions } from '@/lib/constants';
import type { ConfigType, ValidationErrors } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DenseWizardProps {
  config: ConfigType;
  currentTaskName?: string;
  configFinalized: boolean;
  errors: ValidationErrors;
  pythonPreview: string;
  onStartOptionSelect: (key: string) => void;
  onConfigLoaded: (config: ConfigType) => void;
  onInputChange: (path: string, value: any) => void;
  onPreview: () => void;
  onDownload: () => Promise<void>;
}

type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'boolean' | 'list';

type OptionsSource = 'montageOptions';

interface FieldConfig {
  label: string;
  path: string;
  type?: FieldType;
  placeholder?: string;
  tooltip?: string;
  rows?: number;
  options?: { value: string | number; label?: string }[];
  optionsSource?: OptionsSource;
  emptyAsNull?: boolean;
}

interface StartOptionConfig {
  key: string;
  title: string;
  headline: string;
  chips?: string[];
  body?: string;
  accent: 'indigo' | 'violet' | 'slate';
}

interface BaseGroupConfig {
  id: string;
  title?: string;
  description?: string;
  span?: number;
}

interface FieldsGroupConfig extends BaseGroupConfig {
  type: 'fields';
  togglePath?: string;
  color?: 'pink' | 'rose' | 'orange' | 'yellow' | 'blue' | 'purple';
  columns?: number;
  fields: FieldConfig[];
}

interface StartOptionsGroupConfig extends BaseGroupConfig {
  type: 'start-options';
  options: StartOptionConfig[];
}

interface FileUploadGroupConfig extends BaseGroupConfig {
  type: 'file-upload';
}

interface ComponentGroupConfig extends BaseGroupConfig {
  type: 'component';
  componentKey:
    | 'dropOuterLayer'
    | 'ica'
    | 'componentRejection'
    | 'epochs'
    | 'rejectionPolicy'
    | 'fileManagement'
    | 'preview'
    | 'artifactDocs';
  conditionPath?: string;
}

type GroupConfig =
  | FieldsGroupConfig
  | StartOptionsGroupConfig
  | FileUploadGroupConfig
  | ComponentGroupConfig;

interface SectionConfig {
  id: string;
  title: string;
  description?: string;
  columns?: number;
  groups: GroupConfig[];
}

interface WizardLayoutConfig {
  sections: SectionConfig[];
}

const layout = wizardLayout as WizardLayoutConfig;

const CHANNEL_PRESETS = {
  'egi-hydrocel-128': {
    name: 'EGI HydroCel 128',
    channels: [
      'E17',
      'E38',
      'E43',
      'E44',
      'E48',
      'E49',
      'E113',
      'E114',
      'E119',
      'E120',
      'E121',
      'E56',
      'E63',
      'E68',
      'E73',
      'E81',
      'E88',
      'E94',
      'E99',
      'E107',
      'E125',
      'E126',
      'E127',
      'E128'
    ]
  }
} as const;

const COMPONENT_TYPES = [
  { id: 'muscle', label: 'Muscle' },
  { id: 'eog', label: 'EOG / Eye' },
  { id: 'heart', label: 'Heart' },
  { id: 'line_noise', label: 'Line Noise' },
  { id: 'ch_noise', label: 'Channel Noise' }
] as const;

const spanClassMap: Record<number, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3'
};

const gridColumns = (columns?: number) => {
  switch (columns) {
    case 1:
      return 'grid grid-cols-1 gap-6';
    case 3:
      return 'grid grid-cols-1 lg:grid-cols-3 gap-6';
    case 4:
      return 'grid grid-cols-1 lg:grid-cols-4 gap-6';
    default:
      return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
  }
};

const resolveOptions = (field: FieldConfig) => {
  if (field.optionsSource === 'montageOptions') {
    return montageOptions;
  }
  return field.options ?? [];
};

const resolvePath = (template: string, taskName?: string) => {
  if (!template) return template;
  if (template.includes('{task}')) {
    if (!taskName) return null;
    return template.replace(/\{task\}/g, taskName);
  }
  return template;
};

const getValueByPath = (obj: any, path?: string | null) => {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    if (Array.isArray(current)) {
      const index = Number(part);
      if (Number.isNaN(index)) return undefined;
      current = current[index];
    } else {
      current = current[part as keyof typeof current];
    }
  }
  return current;
};

const isTruthy = (value: unknown) => Boolean(value);

const DenseWizard: React.FC<DenseWizardProps> = ({
  config,
  currentTaskName,
  configFinalized,
  errors,
  pythonPreview,
  onStartOptionSelect,
  onConfigLoaded,
  onInputChange,
  onPreview,
  onDownload
}) => {
  const sectionCards = layout.sections.map((section) => {
    const locked = !currentTaskName && section.id !== 'blueprint';

    return (
      <section key={section.id} className="space-y-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{section.title}</h2>
          {section.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-4xl">{section.description}</p>
          )}
        </div>
        {locked ? (
          <Card className="border-dashed border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40">
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="rounded-full bg-slate-200/60 dark:bg-slate-800/60 p-3"
                >
                  <Upload className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Choose a blueprint or import a task to unlock these controls
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                    Once a configuration is active the entire worksheet becomes editable in place—no tabs, no hidden steps.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={gridColumns(section.columns)}>
            {section.groups.map((group) => {
              const spanClass = spanClassMap[group.span ?? 1] ?? 'md:col-span-1';
              switch (group.type) {
                case 'start-options':
                  return (
                    <Card
                      key={group.id}
                      className={cn(
                        'col-span-1 md:col-span-2 border border-slate-200/70 dark:border-slate-700/70 shadow-sm',
                        spanClass
                      )}
                    >
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold">{group.title}</CardTitle>
                        {group.description && (
                          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                            {group.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <StartOptionsGrid
                          options={group.options}
                          currentTaskName={currentTaskName}
                          onSelect={onStartOptionSelect}
                          configFinalized={configFinalized}
                        />
                      </CardContent>
                    </Card>
                  );
                case 'file-upload':
                  return (
                    <Card
                      key={group.id}
                      className={cn(
                        'border border-slate-200/70 dark:border-slate-700/70 shadow-sm bg-gradient-to-br from-slate-50/80 to-white/60 dark:from-slate-900/60 dark:to-slate-900/40',
                        spanClass
                      )}
                    >
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold">{group.title}</CardTitle>
                        {group.description && (
                          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                            {group.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <FileUpload onConfigLoaded={onConfigLoaded} />
                      </CardContent>
                    </Card>
                  );
                case 'fields':
                  return (
                    <Card
                      key={group.id}
                      className={cn(
                        'border border-slate-200/70 dark:border-slate-700/70 shadow-sm bg-white/80 dark:bg-slate-900/40 backdrop-blur',
                        spanClass
                      )}
                    >
                      {group.togglePath ? null : (
                        <CardHeader className="pb-4">
                          <CardTitle className="text-base font-semibold">{group.title}</CardTitle>
                          {group.description && (
                            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                              {group.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                      )}
                      <CardContent className={cn(group.togglePath ? 'py-4' : 'pt-0')}>
                        {renderFieldGroup({
                          group,
                          config,
                          currentTaskName,
                          errors,
                          onInputChange
                        })}
                      </CardContent>
                    </Card>
                  );
                case 'component':
                  if (
                    group.conditionPath &&
                    !isTruthy(getValueByPath(config, resolvePath(group.conditionPath, currentTaskName)))
                  ) {
                    return null;
                  }
                  return (
                    <Card
                      key={group.id}
                      className={cn(
                        'border border-slate-200/70 dark:border-slate-700/70 shadow-sm bg-white/80 dark:bg-slate-900/40 backdrop-blur',
                        spanClass
                      )}
                    >
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold">{group.title}</CardTitle>
                        {group.description && (
                          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                            {group.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        {renderComponent({
                          group,
                          config,
                          currentTaskName,
                          errors,
                          onInputChange,
                          onPreview,
                          onDownload,
                          pythonPreview
                        })}
                      </CardContent>
                    </Card>
                  );
                default:
                  return null;
              }
            })}
          </div>
        )}
      </section>
    );
  });

  return <div className="space-y-12">{sectionCards}</div>;
};

type FieldGroupRendererProps = {
  group: FieldsGroupConfig;
  config: ConfigType;
  currentTaskName?: string;
  errors: ValidationErrors;
  onInputChange: (path: string, value: any) => void;
};

const renderFieldGroup = ({ group, config, currentTaskName, errors, onInputChange }: FieldGroupRendererProps) => {
  const resolvedFields = group.fields
    .map((field) => {
      const resolvedPath = resolvePath(field.path, currentTaskName);
      if (!resolvedPath) return null;
      return { field, resolvedPath };
    })
    .filter(Boolean) as { field: FieldConfig; resolvedPath: string }[];

  if (resolvedFields.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        This section becomes available once the task schema includes these settings.
      </p>
    );
  }

  const resolvedTogglePath = group.togglePath ? resolvePath(group.togglePath, currentTaskName) : undefined;
  const enabled = resolvedTogglePath ? Boolean(getValueByPath(config, resolvedTogglePath)) : true;

  const content = (
    <div className={cn(group.columns === 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4')}>
      {resolvedFields.map(({ field, resolvedPath }) => (
        <FormField
          key={resolvedPath}
          path={resolvedPath}
          label={field.label}
          tooltip={field.tooltip}
          value={getValueByPath(config, resolvedPath)}
          onChange={(path, value) => {
            if (field.emptyAsNull && (value === '' || value === undefined)) {
              onInputChange(path, null);
            } else {
              onInputChange(path, value);
            }
          }}
          error={errors[resolvedPath]}
          type={field.type}
          options={resolveOptions(field)}
          placeholder={field.placeholder}
          textareaProps={field.type === 'textarea' && field.rows ? { rows: field.rows } : undefined}
        />
      ))}
    </div>
  );

  if (!resolvedTogglePath) {
    return content;
  }

  return (
    <AnimatedSection
      title={group.title ?? ''}
      description={group.description ?? ''}
      enabled={enabled}
      onToggle={() => onInputChange(resolvedTogglePath, !enabled)}
      color={group.color}
      contentClassName="pl-6 pt-4 pb-1 space-y-4 border-l-2 border-slate-200"
    >
      {content}
    </AnimatedSection>
  );
};

type ComponentRendererProps = {
  group: ComponentGroupConfig;
  config: ConfigType;
  currentTaskName?: string;
  errors: ValidationErrors;
  onInputChange: (path: string, value: any) => void;
  onPreview: () => void;
  onDownload: () => Promise<void>;
  pythonPreview: string;
};

const renderComponent = ({
  group,
  config,
  currentTaskName,
  errors,
  onInputChange,
  onPreview,
  onDownload,
  pythonPreview
}: ComponentRendererProps) => {
  if (!currentTaskName) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Select or import a configuration to edit this module.
      </p>
    );
  }

  const currentTask = config.tasks[currentTaskName];
  if (!currentTask) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">Task data missing for {currentTaskName}.</p>
    );
  }

  switch (group.componentKey) {
    case 'dropOuterLayer': {
      const dropSettings = currentTask.settings?.drop_outerlayer;
      if (!dropSettings) {
        return (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This configuration does not expose outer layer controls.
          </p>
        );
      }
      const resolvedTogglePath = resolvePath('tasks.{task}.settings.drop_outerlayer.enabled', currentTaskName)!;
      const resolvedValuePath = resolvePath('tasks.{task}.settings.drop_outerlayer.value', currentTaskName)!;
      const enabled = Boolean(dropSettings.enabled);

      return (
        <AnimatedSection
          title={group.title ?? ''}
          description={group.description ?? ''}
          enabled={enabled}
          onToggle={() => onInputChange(resolvedTogglePath, !enabled)}
          color="yellow"
          contentClassName="pl-6 pt-4 pb-1 space-y-4 border-l-2 border-yellow-200"
        >
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preset</Label>
              <Select
                onValueChange={(value) => {
                  const preset = CHANNEL_PRESETS[value as keyof typeof CHANNEL_PRESETS];
                  if (preset) {
                    onInputChange(resolvedValuePath, preset.channels);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Apply a preset (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CHANNEL_PRESETS).map(([key, preset]) => (
                    <SelectItem key={key} value={key}>
                      {preset.name} ({preset.channels.length} channels)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FormField
              path={resolvedValuePath}
              label="Channels to drop"
              type="list"
              tooltip="Comma separated list of channel names to exclude."
              value={dropSettings.value}
              onChange={onInputChange}
              error={errors[resolvedValuePath]}
              placeholder="E17, E38, E43"
            />
          </div>
        </AnimatedSection>
      );
    }
    case 'ica': {
      const icaSettings = currentTask.settings?.ICA;
      if (!icaSettings) {
        return (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ICA is unavailable for this template.
          </p>
        );
      }
      const resolvedTogglePath = resolvePath('tasks.{task}.settings.ICA.enabled', currentTaskName)!;
      const enabled = Boolean(icaSettings.enabled);

      const handleMethodChange = (path: string, value: string) => {
        onInputChange(path, value);
        if (value === 'infomax') {
          onInputChange(resolvePath('tasks.{task}.settings.ICA.value.fit_params', currentTaskName)!, {
            extended: true
          });
        } else if (value === 'picard') {
          onInputChange(resolvePath('tasks.{task}.settings.ICA.value.fit_params', currentTaskName)!, {
            ortho: false,
            extended: true
          });
        } else {
          onInputChange(resolvePath('tasks.{task}.settings.ICA.value.fit_params', currentTaskName)!, {});
        }
      };

      return (
        <AnimatedSection
          title={group.title ?? ''}
          description={group.description ?? ''}
          enabled={enabled}
          onToggle={() => onInputChange(resolvedTogglePath, !enabled)}
          color="blue"
          contentClassName="pl-6 pt-4 pb-1 space-y-4 border-l-2 border-blue-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              path={resolvePath('tasks.{task}.settings.ICA.value.method', currentTaskName)!}
              label="Method"
              type="select"
              value={icaSettings.value?.method}
              onChange={(path, value) => handleMethodChange(path, value)}
              options={[
                { value: 'infomax', label: 'Infomax' },
                { value: 'picard', label: 'Picard' },
                { value: 'fastica', label: 'FastICA' }
              ]}
              error={errors[resolvePath('tasks.{task}.settings.ICA.value.method', currentTaskName)!]}
              placeholder="Select method"
              tooltip="Algorithm used to perform ICA decomposition."
            />
            <FormField
              path={resolvePath('tasks.{task}.settings.ICA.value.n_components', currentTaskName)!}
              label="Components"
              type="number"
              value={icaSettings.value?.n_components}
              onChange={onInputChange}
              error={errors[resolvePath('tasks.{task}.settings.ICA.value.n_components', currentTaskName)!]}
              placeholder="Auto"
              tooltip="Set explicit component count or leave blank for automatic."
            />
            <FormField
              path={resolvePath('tasks.{task}.settings.ICA.value.temp_highpass_for_ica', currentTaskName)!}
              label="Temporary high-pass"
              type="number"
              value={icaSettings.value?.temp_highpass_for_ica}
              onChange={onInputChange}
              error={errors[resolvePath('tasks.{task}.settings.ICA.value.temp_highpass_for_ica', currentTaskName)!]}
              placeholder="1.0"
              tooltip="Optional high-pass applied before ICA (Hz)."
            />
            {icaSettings.value?.method && ['picard', 'infomax'].includes(icaSettings.value.method) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2">
                <FormField
                  path={resolvePath('tasks.{task}.settings.ICA.value.fit_params.extended', currentTaskName)!}
                  label="Extended"
                  type="boolean"
                  value={icaSettings.value?.fit_params?.extended}
                  onChange={onInputChange}
                  error={errors[resolvePath('tasks.{task}.settings.ICA.value.fit_params.extended', currentTaskName)!]}
                  tooltip="Use extended Infomax / Picard algorithm."
                />
                {icaSettings.value?.method === 'picard' && (
                  <FormField
                    path={resolvePath('tasks.{task}.settings.ICA.value.fit_params.ortho', currentTaskName)!}
                    label="Orthogonal"
                    type="boolean"
                    value={icaSettings.value?.fit_params?.ortho}
                    onChange={onInputChange}
                    error={errors[resolvePath('tasks.{task}.settings.ICA.value.fit_params.ortho', currentTaskName)!]}
                    tooltip="Apply orthogonal constraint when running Picard."
                  />
                )}
              </div>
            )}
          </div>
        </AnimatedSection>
      );
    }
    case 'componentRejection': {
      const componentSettings = currentTask.settings?.component_rejection;
      if (!componentSettings) {
        return (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Component rejection is not defined for this configuration.
          </p>
        );
      }
      const resolvedTogglePath = resolvePath('tasks.{task}.settings.component_rejection.enabled', currentTaskName)!;
      const enabled = Boolean(componentSettings.enabled);
      const resolvedBase = 'tasks.{task}.settings.component_rejection.value';
      const typePath = resolvePath('tasks.{task}.settings.component_rejection.value.ic_flags_to_reject', currentTaskName)!;

      const selectedTypes = Array.isArray(componentSettings.value?.ic_flags_to_reject)
        ? componentSettings.value.ic_flags_to_reject
        : [];

      return (
        <AnimatedSection
          title={group.title ?? ''}
          description={group.description ?? ''}
          enabled={enabled}
          onToggle={() => onInputChange(resolvedTogglePath, !enabled)}
          color="purple"
          contentClassName="pl-6 pt-4 pb-1 space-y-4 border-l-2 border-purple-200"
        >
          <div className="space-y-3">
            <Label className="text-sm font-medium">Labels to reject</Label>
            <div className="flex flex-wrap gap-2">
              {COMPONENT_TYPES.map((type) => {
                const active = selectedTypes.includes(type.id);
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      const next = active
                        ? selectedTypes.filter((item: string) => item !== type.id)
                        : [...selectedTypes, type.id];
                      onInputChange(typePath, next);
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-md border text-sm transition-colors',
                      active
                        ? 'bg-purple-100 border-purple-300 text-purple-700'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                    )}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
            {errors[typePath] && <p className="text-sm text-destructive">{errors[typePath]}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              path={resolvePath('tasks.{task}.settings.component_rejection.value.ic_rejection_threshold', currentTaskName)!}
              label="Threshold"
              type="number"
              value={componentSettings.value?.ic_rejection_threshold}
              onChange={onInputChange}
              error={errors[resolvePath('tasks.{task}.settings.component_rejection.value.ic_rejection_threshold', currentTaskName)!]}
              placeholder="0.3"
              tooltip="Confidence required before a component is auto-removed."
            />
            <FormField
              path={resolvePath('tasks.{task}.settings.component_rejection.value.psd_fmax', currentTaskName)!}
              label="PSD fmax"
              type="number"
              value={componentSettings.value?.psd_fmax}
              onChange={onInputChange}
              error={errors[resolvePath('tasks.{task}.settings.component_rejection.value.psd_fmax', currentTaskName)!]}
              placeholder="40"
              tooltip="Upper frequency bound for PSD estimation."
            />
            <FormField
              path={resolvePath('tasks.{task}.settings.component_rejection.method', currentTaskName)!}
              label="Classifier"
              type="select"
              value={componentSettings.method || 'iclabel'}
              onChange={onInputChange}
              error={errors[resolvePath('tasks.{task}.settings.component_rejection.method', currentTaskName)!]}
              options={[
                { value: 'iclabel', label: 'ICLabel' },
                { value: 'icvision', label: 'ICVision' },
                { value: 'hybrid', label: 'Hybrid' }
              ]}
              placeholder="Choose classifier"
              tooltip="Select the component labelling backend."
            />
            {(componentSettings?.method === 'icvision' || componentSettings?.method === 'hybrid') && (
              <FormField
                path={resolvePath('tasks.{task}.settings.component_rejection.value.icvision_n_components', currentTaskName)!}
                label="ICVision components"
                type="number"
                value={componentSettings.value?.icvision_n_components}
                onChange={onInputChange}
                error={errors[resolvePath('tasks.{task}.settings.component_rejection.value.icvision_n_components', currentTaskName)!]}
                placeholder="15"
                tooltip="Number of components passed to the ICVision classifier."
              />
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Overrides</Label>
            <KeyValueEditor
              value={componentSettings.value?.ic_rejection_overrides || {}}
              onChange={(value) =>
                onInputChange(resolvePath(`${resolvedBase}.ic_rejection_overrides`, currentTaskName)!, value)
              }
            />
          </div>
        </AnimatedSection>
      );
    }
    case 'epochs': {
      const epochSettings = currentTask.settings?.epoch_settings;
      if (!epochSettings) {
        return (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Epoch settings are not part of this template.
          </p>
        );
      }

      const basePath = resolvePath('tasks.{task}.settings.epoch_settings', currentTaskName)!;
      const enabled = Boolean(epochSettings.enabled);

      return (
        <AnimatedSection
          title={group.title ?? ''}
          description={group.description ?? ''}
          enabled={enabled}
          onToggle={() => onInputChange(`${basePath}.enabled`, !enabled)}
          color="lime"
          contentClassName="pl-6 pt-4 pb-1 space-y-6 border-l-2 border-lime-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              path={`${basePath}.value.tmin`}
              label="tmin (s)"
              type="number"
              value={epochSettings.value?.tmin?.toString() ?? ''}
              onChange={(path, value) => onInputChange(path, value === '' ? null : parseFloat(value))}
              error={errors[`${basePath}.value.tmin`]}
              placeholder="-0.2"
              tooltip="Epoch start relative to event."
            />
            <FormField
              path={`${basePath}.value.tmax`}
              label="tmax (s)"
              type="number"
              value={epochSettings.value?.tmax?.toString() ?? ''}
              onChange={(path, value) => onInputChange(path, value === '' ? null : parseFloat(value))}
              error={errors[`${basePath}.value.tmax`]}
              placeholder="0.5"
              tooltip="Epoch end relative to event."
            />
          </div>
          <AnimatedSection
            title="Event dictionary"
            description="Provide event IDs to build named epochs. Disable for fixed-length segmentation."
            enabled={Array.isArray(epochSettings.event_id)}
            onToggle={() => {
              const current = epochSettings.event_id;
              onInputChange(`${basePath}.event_id`, Array.isArray(current) ? null : []);
            }}
            color="lime"
            contentClassName="pl-5 pt-3 pb-1 space-y-3 border-l border-lime-200"
          >
            <EventIdInput
              eventIds={Array.isArray(epochSettings.event_id) ? epochSettings.event_id : []}
              onChange={(ids) => onInputChange(`${basePath}.event_id`, ids)}
            />
          </AnimatedSection>
          {epochSettings.remove_baseline && (
            <AnimatedSection
              title="Baseline correction"
              description="Subtract the mean of a temporal window from each epoch."
              enabled={Boolean(epochSettings.remove_baseline?.enabled)}
              onToggle={() =>
                onInputChange(
                  `${basePath}.remove_baseline.enabled`,
                  !epochSettings.remove_baseline?.enabled
                )
              }
              color="lime"
              contentClassName="pl-5 pt-3 pb-1 space-y-4 border-l border-lime-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  path={`${basePath}.remove_baseline.window.0`}
                  label="Baseline start"
                  type="number"
                  value={epochSettings.remove_baseline.window?.[0]?.toString() ?? ''}
                  onChange={(path, value) => onInputChange(path, value === '' ? null : parseFloat(value))}
                  error={errors[`${basePath}.remove_baseline.window.0`]}
                  placeholder="-0.2"
                />
                <FormField
                  path={`${basePath}.remove_baseline.window.1`}
                  label="Baseline end"
                  type="number"
                  value={epochSettings.remove_baseline.window?.[1]?.toString() ?? ''}
                  onChange={(path, value) => onInputChange(path, value === '' ? null : parseFloat(value))}
                  error={errors[`${basePath}.remove_baseline.window.1`]}
                  placeholder="0"
                />
              </div>
            </AnimatedSection>
          )}
          {epochSettings.threshold_rejection && (
            <AnimatedSection
              title="Voltage rejection"
              description="Drop epochs whose peak-to-peak amplitude exceeds this bound."
              enabled={Boolean(epochSettings.threshold_rejection?.enabled)}
              onToggle={() =>
                onInputChange(
                  `${basePath}.threshold_rejection.enabled`,
                  !epochSettings.threshold_rejection?.enabled
                )
              }
              color="lime"
              contentClassName="pl-5 pt-3 pb-1 space-y-4 border-l border-lime-200"
            >
              <FormField
                path={`${basePath}.threshold_rejection.volt_threshold.eeg`}
                label="EEG threshold (V)"
                type="text"
                value={epochSettings.threshold_rejection.volt_threshold?.eeg}
                onChange={onInputChange}
                error={errors[`${basePath}.threshold_rejection.volt_threshold.eeg`]}
                placeholder="125e-6"
              />
            </AnimatedSection>
          )}
        </AnimatedSection>
      );
    }
    case 'rejectionPolicy': {
      return (
        <RejectionPolicySection
          taskName={currentTaskName}
          policy={(currentTask as any).rejection_policy}
          onChange={onInputChange}
          errors={errors}
        />
      );
    }
    case 'fileManagement': {
      const moveFlagged = currentTask.settings?.move_flagged_files ?? false;
      const resolvedPath = resolvePath('tasks.{task}.settings.move_flagged_files', currentTaskName)!;
      return (
        <div className="flex items-center justify-between gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/80 dark:bg-slate-900/40">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Move flagged files</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              When enabled, recordings that fail QC are moved into a <code className="font-mono">bad/</code> folder.
            </p>
          </div>
          <Button
            variant={moveFlagged ? 'default' : 'outline'}
            onClick={() => onInputChange(resolvedPath, !moveFlagged)}
            className={cn(
              'rounded-full px-4',
              moveFlagged
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'border-emerald-200 text-emerald-700 hover:border-emerald-300'
            )}
          >
            {moveFlagged ? 'Enabled' : 'Disabled'}
          </Button>
        </div>
      );
    }
    case 'preview': {
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={onPreview} className="bg-emerald-600 hover:bg-emerald-700">
              Generate Preview
            </Button>
            <Button onClick={onDownload} className="bg-slate-900 hover:bg-slate-800 text-white">
              Download Python
            </Button>
          </div>
          {(errors.pythonGeneration || errors.fileGeneration) && (
            <Alert variant="destructive">
              <AlertTitle>Generation error</AlertTitle>
              <AlertDescription>{errors.pythonGeneration || errors.fileGeneration}</AlertDescription>
            </Alert>
          )}
          {pythonPreview && (
            <Textarea
              readOnly
              value={pythonPreview}
              className="font-mono text-xs h-80 border-slate-200 dark:border-slate-700"
            />
          )}
        </div>
      );
    }
    case 'artifactDocs': {
      return <ArtifactFunctionDoc />;
    }
    default:
      return null;
  }
};

type StartOptionsGridProps = {
  options: StartOptionConfig[];
  currentTaskName?: string;
  onSelect: (key: string) => void;
  configFinalized: boolean;
};

const accentMap: Record<StartOptionConfig['accent'], string> = {
  indigo: 'from-indigo-500/10 to-indigo-600/10 border-indigo-400/40',
  violet: 'from-violet-500/10 to-purple-600/10 border-violet-400/40',
  slate: 'from-slate-500/10 to-slate-700/10 border-slate-400/40'
};

const StartOptionsGrid: React.FC<StartOptionsGridProps> = ({ options, currentTaskName, onSelect, configFinalized }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {options.map((option) => {
        const isSelected = configFinalized && currentTaskName === option.key;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onSelect(option.key)}
            className={cn(
              'relative overflow-hidden rounded-2xl border px-4 py-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              accentMap[option.accent ?? 'slate'],
              isSelected
                ? 'shadow-xl ring-2 ring-indigo-500'
                : 'border-slate-200/60 dark:border-slate-700/60'
            )}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{option.title}</h3>
                {isSelected && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-1 text-[11px] font-medium text-white">
                    <Check className="h-3 w-3" /> Active
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{option.headline}</p>
              {option.chips && option.chips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {option.chips.map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex rounded-full bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-slate-700/50 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
              {option.body && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{option.body}</p>
              )}
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/40 dark:border-white/5" />
          </button>
        );
      })}
    </div>
  );
};

export default DenseWizard;
