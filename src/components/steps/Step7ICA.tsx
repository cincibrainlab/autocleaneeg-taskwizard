import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import FormField from '../FormField';
import KeyValueEditor from '@/components/KeyValueEditor';
import { AnimatedSection } from '@/components/AnimatedSection';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { TaskData, ValidationErrors } from '@/lib/types';
import { designSystem, cn } from '@/lib/design-system';

// Available ICLabel component types (artifacts to reject - brain is NOT included as it's the signal we want)
const IC_COMPONENT_TYPES = [
    { id: 'muscle', label: 'Muscle' },
    { id: 'eog', label: 'EOG/Eye' },
    { id: 'heart', label: 'Heart' },
    { id: 'line_noise', label: 'Line Noise' },
    { id: 'ch_noise', label: 'Channel Noise' },
] as const;

interface Step7Props {
  currentTaskName: string;
  currentTaskData: TaskData;
  handleInputChange: (path: string, value: any) => void;
  errors: ValidationErrors;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
}

const Step7ICA: React.FC<Step7Props> = ({ 
  currentTaskName, 
  currentTaskData, 
  handleInputChange, 
  errors, 
  goToPreviousStep, 
  goToNextStep 
}) => {
  // Ensure data exists before rendering
  if (!currentTaskData.settings) return null; 
  const icaSettings = currentTaskData.settings.ICA;
  const componentRejectionSettings = currentTaskData.settings.component_rejection;

  // Handle toggle group changes for component rejection types
  const handleComponentRejectionToggle = (selectedTypes: string[]) => {
    handleInputChange(`tasks.${currentTaskName}.settings.component_rejection.value.ic_flags_to_reject`, selectedTypes);
  };

  // Handle ICA method changes - set appropriate fit_params based on method
  const handleICAMethodChange = (path: string, value: any) => {
    handleInputChange(path, value);
    
    // Set appropriate fit_params based on method
    if (path.includes('method')) {
      if (value === 'infomax') {
        handleInputChange(`tasks.${currentTaskName}.settings.ICA.value.fit_params`, {
          extended: true
        });
      } else if (value === 'picard') {
        handleInputChange(`tasks.${currentTaskName}.settings.ICA.value.fit_params`, {
          ortho: false,
          extended: true
        });
      } else {
        // FastICA and others don't use fit_params
        handleInputChange(`tasks.${currentTaskName}.settings.ICA.value.fit_params`, {});
      }
    }
  };

  // Get current selected types (ensure it's an array)
  const selectedTypes = Array.isArray(componentRejectionSettings?.value?.ic_flags_to_reject) 
    ? componentRejectionSettings.value.ic_flags_to_reject 
    : [];

  return (
    <Card className={designSystem.card.container}>
        <CardHeader className={cn(designSystem.card.header, "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800")}> 
            <CardTitle className={designSystem.card.title}>ICA & Component Labeling</CardTitle> 
            <CardDescription className={designSystem.card.description}>
                Decompose signals into independent components for automated artifact detection and removal.{' '}
                <a 
                    href="https://docs.autocleaneeg.org/pipeline-steps/ica" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline text-xs font-medium"
                >
                    Learn more →
                </a>
            </CardDescription>
        </CardHeader>
        <CardContent className={cn("space-y-6", designSystem.card.content)}>
            <div className="space-y-6">
                {/* ICA Section */}
                {icaSettings && (
                    <AnimatedSection
                        title="ICA"
                        description="Independent Component Analysis for artifact removal."
                        enabled={icaSettings.enabled}
                        onToggle={() => handleInputChange(`tasks.${currentTaskName}.settings.ICA.enabled`, !icaSettings.enabled)}
                        contentClassName="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-blue-200 ml-2.5"
                        color="blue"
                    >
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                                path={`tasks.${currentTaskName}.settings.ICA.value.method`}
                                label="ICA Method"
                                tooltip="Algorithm to use for ICA decomposition"
                                value={icaSettings.value?.method}
                                onChange={handleICAMethodChange}
                                error={errors[`tasks.${currentTaskName}.settings.ICA.value.method`]}
                                type="select"
                                options={[
                                    { value: "infomax", label: "Infomax" },
                                    { value: "picard", label: "Picard" },
                                    { value: "fastica", label: "FastICA" }
                                ]}
                                placeholder="Select ICA method..."
                            />
                            <FormField
                                path={`tasks.${currentTaskName}.settings.ICA.value.n_components`}
                                label="Number of Components"
                                tooltip="Number of ICA components to extract (null for automatic)"
                                value={icaSettings.value?.n_components}
                                onChange={handleInputChange}
                                error={errors[`tasks.${currentTaskName}.settings.ICA.value.n_components`]}
                                type="number"
                                placeholder="null (automatic)"
                            />
                            <FormField
                                path={`tasks.${currentTaskName}.settings.ICA.value.temp_highpass_for_ica`}
                                label="Temporary Highpass for ICA"
                                tooltip="Apply temporary highpass filter before ICA (Hz). Data is restored after ICA."
                                value={icaSettings.value?.temp_highpass_for_ica}
                                onChange={handleInputChange}
                                error={errors[`tasks.${currentTaskName}.settings.ICA.value.temp_highpass_for_ica`]}
                                type="number"
                                placeholder="e.g., 1.0"
                            />
                        </div>
                        {/* Method-specific parameters */}
                        {(icaSettings.value?.method === "picard" || icaSettings.value?.method === "infomax") && (
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Extended - for both Picard and Infomax */}
                                <FormField
                                    path={`tasks.${currentTaskName}.settings.ICA.value.fit_params.extended`}
                                    label="Extended"
                                    tooltip={`Use extended ICA algorithm`}
                                    value={icaSettings.value?.fit_params?.extended}
                                    onChange={handleInputChange}
                                    error={errors[`tasks.${currentTaskName}.settings.ICA.value.fit_params.extended`]}
                                    type="boolean"
                                />
                                {/* Orthogonal - only for Picard */}
                                {icaSettings.value?.method === "picard" && (
                                    <FormField
                                        path={`tasks.${currentTaskName}.settings.ICA.value.fit_params.ortho`}
                                        label="Orthogonal"
                                        tooltip="Use orthogonal constraint in ICA (Picard only)"
                                        value={icaSettings.value?.fit_params?.ortho}
                                        onChange={handleInputChange}
                                        error={errors[`tasks.${currentTaskName}.settings.ICA.value.fit_params.ortho`]}
                                        type="boolean"
                                    />
                                )}
                            </div>
                        )}
                    </AnimatedSection>
                )}

                {/* Component Rejection Section */}
                {componentRejectionSettings && (
                    <AnimatedSection
                        title="Component Rejection"
                        description="Automatic labeling and rejection of ICA components."
                        enabled={componentRejectionSettings.enabled}
                        onToggle={() => handleInputChange(`tasks.${currentTaskName}.settings.component_rejection.enabled`, !componentRejectionSettings.enabled)}
                        contentClassName="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-purple-200 ml-2.5"
                        color="purple"
                    >
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Component Types to Reject</Label>
                                <p className="text-xs text-muted-foreground">
                                    Select which ICA component types to automatically reject
                                </p>
                            </div>
                            <ToggleGroup 
                                type="multiple" 
                                value={selectedTypes}
                                onValueChange={handleComponentRejectionToggle}
                                className="flex flex-wrap gap-2"
                            >
                                {IC_COMPONENT_TYPES.map((componentType) => (
                                    <ToggleGroupItem 
                                        key={componentType.id}
                                        value={componentType.id}
                                        aria-label={`Toggle ${componentType.label}`}
                                        className="data-[state=on]:bg-purple-500 data-[state=on]:text-white hover:bg-purple-100"
                                    >
                                        {componentType.label}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                            {errors[`tasks.${currentTaskName}.settings.component_rejection.value.ic_flags_to_reject`] && (
                                <p className="text-sm text-red-500">
                                    {errors[`tasks.${currentTaskName}.settings.component_rejection.value.ic_flags_to_reject`]}
                                </p>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">IC Rejection Overrides</Label>
                                <p className="text-xs text-muted-foreground">
                                    Override thresholds for specific component types
                                </p>
                                <KeyValueEditor
                                    value={componentRejectionSettings.value?.ic_rejection_overrides || {}}
                                    onChange={(val) =>
                                        handleInputChange(
                                            `tasks.${currentTaskName}.settings.component_rejection.value.ic_rejection_overrides`,
                                            val
                                        )
                                    }
                                />
                                {errors[`tasks.${currentTaskName}.settings.component_rejection.value.ic_rejection_overrides`] && (
                                    <p className="text-sm text-red-500">
                                        {errors[`tasks.${currentTaskName}.settings.component_rejection.value.ic_rejection_overrides`]}
                                    </p>
                                )}
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <FormField
                                    path={`tasks.${currentTaskName}.settings.component_rejection.value.ic_rejection_threshold`}
                                    label="Rejection Threshold"
                                    tooltip="Threshold for automatic component rejection (0-1)"
                                    value={componentRejectionSettings.value?.ic_rejection_threshold}
                                    onChange={handleInputChange}
                                    error={errors[`tasks.${currentTaskName}.settings.component_rejection.value.ic_rejection_threshold`]}
                                    type="number"
                                    placeholder="e.g., 0.3"
                                />
                                <FormField
                                    path={`tasks.${currentTaskName}.settings.component_rejection.value.psd_fmax`}
                                    label="PSD Max Frequency"
                                    tooltip="Maximum frequency for PSD estimation (default: 40 Hz)"
                                    value={componentRejectionSettings.value?.psd_fmax}
                                    onChange={handleInputChange}
                                    error={errors[`tasks.${currentTaskName}.settings.component_rejection.value.psd_fmax`]}
                                    type="number"
                                    placeholder="e.g., 40"
                                />
                                <FormField
                                    path={`tasks.${currentTaskName}.settings.component_rejection.method`}
                                    label="Classification Method"
                                    tooltip="Method for component classification: ICLabel (default), ICVision, or Hybrid (combines both)"
                                    value={componentRejectionSettings.method || 'iclabel'}
                                    onChange={handleInputChange}
                                    error={errors[`tasks.${currentTaskName}.settings.component_rejection.method`]}
                                    type="select"
                                    options={[
                                        { value: "iclabel", label: "ICLabel" },
                                        { value: "icvision", label: "ICVision" },
                                        { value: "hybrid", label: "Hybrid" }
                                    ]}
                                    placeholder="Select method..."
                                />
                                {(componentRejectionSettings?.method === 'icvision' || componentRejectionSettings?.method === 'hybrid') && (
                                    <FormField
                                        path={`tasks.${currentTaskName}.settings.component_rejection.value.icvision_n_components`}
                                        label="ICVision Components"
                                        tooltip="Number of components for ICVision classification"
                                        value={componentRejectionSettings.value?.icvision_n_components}
                                        onChange={handleInputChange}
                                        error={errors[`tasks.${currentTaskName}.settings.component_rejection.value.icvision_n_components`]}
                                        type="number"
                                        placeholder="e.g., 15"
                                    />
                                )}
                            </div>
                        </div>
                    </AnimatedSection>
                )}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={goToPreviousStep} className="px-6 py-3 rounded-xl">← Back to EOG & Channels</Button>
                    <Button onClick={goToNextStep} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl">Next: Epochs →</Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
};

export default Step7ICA;
