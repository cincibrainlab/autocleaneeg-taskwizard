import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import FormField from '../FormField'; 
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
  const icLabelSettings = currentTaskData.settings.ICLabel;

  // Handle toggle group changes for ICLabel component types
  const handleICLabelToggle = (selectedTypes: string[]) => {
    handleInputChange(`tasks.${currentTaskName}.settings.ICLabel.value.ic_flags_to_reject`, selectedTypes);
  };

  // Handle ICA method changes - set appropriate fit_params based on method
  const handleICAMethodChange = (path: string, value: any) => {
    handleInputChange(path, value);
    
    // Set appropriate fit_params based on method
    if (path.includes('method')) {
      if (value === 'picard') {
        handleInputChange(`tasks.${currentTaskName}.settings.ICA.value.fit_params`, {
          ortho: false,
          extended: true
        });
      } else if (value === 'infomax') {
        handleInputChange(`tasks.${currentTaskName}.settings.ICA.value.fit_params`, {
          extended: true
        });
      } else {
        // FastICA and others don't use fit_params
        handleInputChange(`tasks.${currentTaskName}.settings.ICA.value.fit_params`, {});
      }
    }
  };

  // Get current selected types (ensure it's an array)
  const selectedTypes = Array.isArray(icLabelSettings?.value?.ic_flags_to_reject) 
    ? icLabelSettings.value.ic_flags_to_reject 
    : [];

  return (
    <Card className={designSystem.card.container}>
        <CardHeader className={cn(designSystem.card.header, "bg-gradient-to-r from-blue-50 to-indigo-50")}>
            <CardTitle className={designSystem.card.title}>ICA & Component Labeling</CardTitle> 
            <CardDescription className={designSystem.card.description}>Decompose signals into independent components for automated artifact detection and removal.</CardDescription>
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
                                    { value: "picard", label: "Picard" },
                                    { value: "fastica", label: "FastICA" },
                                    { value: "infomax", label: "Infomax" }
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

                {/* ICLabel Section */}
                {icLabelSettings && (
                    <AnimatedSection
                        title="ICLabel"
                        description="Automatic labeling and rejection of ICA components."
                        enabled={icLabelSettings.enabled}
                        onToggle={() => handleInputChange(`tasks.${currentTaskName}.settings.ICLabel.enabled`, !icLabelSettings.enabled)}
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
                                onValueChange={handleICLabelToggle}
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
                            {errors[`tasks.${currentTaskName}.settings.ICLabel.value.ic_flags_to_reject`] && (
                                <p className="text-sm text-red-500">
                                    {errors[`tasks.${currentTaskName}.settings.ICLabel.value.ic_flags_to_reject`]}
                                </p>
                            )}
                        </div>
                        <FormField
                            path={`tasks.${currentTaskName}.settings.ICLabel.value.ic_rejection_threshold`}
                            label="Rejection Threshold"
                            tooltip="Threshold for automatic component rejection (0-1)"
                            value={icLabelSettings.value?.ic_rejection_threshold}
                            onChange={handleInputChange}
                            error={errors[`tasks.${currentTaskName}.settings.ICLabel.value.ic_rejection_threshold`]}
                            type="number"
                            placeholder="e.g., 0.3"
                        />
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