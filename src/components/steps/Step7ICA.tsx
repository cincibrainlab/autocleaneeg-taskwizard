import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import FormField from '../FormField'; 
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { TaskData, ValidationErrors } from '@/lib/types';

// Animation settings
const sectionAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
};

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
    <Card className="border-t-4 border-t-blue-500 shadow-md overflow-hidden">
        <CardHeader className="mx-1 mt-1 mb-0 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 pt-4 pb-4">
            <CardTitle>Step 7: ICA & Component Labeling</CardTitle> 
            <CardDescription>Configure Independent Component Analysis for artifact removal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6">
                    {/* ICA Section */}
                    {icaSettings && (
                        <motion.div className="space-y-4" layout>
                            <button
                                type="button"
                                onClick={() => handleInputChange(`tasks.${currentTaskName}.settings.ICA.enabled`, !icaSettings.enabled)}
                                className="flex items-center justify-between w-full p-3 border rounded-md hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                            >
                                <div className="flex-1 flex items-center space-x-3">
                                    <div className={`
                                        flex items-center justify-center w-5 h-5 border rounded-sm transition-colors
                                        ${icaSettings.enabled ? 'bg-blue-500 border-blue-600' : 'border-input'}
                                    `}>
                                        {icaSettings.enabled && <Check className="h-4 w-4 text-white" />}
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <Label className="font-medium">ICA</Label>
                                        <p className="text-sm text-muted-foreground">Independent Component Analysis for artifact removal.</p>
                                    </div>
                                </div>
                            </button>
                            
                            <AnimatePresence>
                                {icaSettings.enabled && (
                                    <motion.div 
                                        key="ica-content"
                                        className="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-blue-200 ml-2.5 overflow-hidden"
                                        initial={sectionAnimation.initial}
                                        animate={sectionAnimation.animate}
                                        exit={{ opacity: 0, height: 0, y: 5, transition: { duration: 0.2 } }} 
                                        transition={sectionAnimation.transition}
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
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* ICLabel Section */}
                    {icLabelSettings && (
                        <motion.div className="space-y-4" layout>
                            <button
                                type="button"
                                onClick={() => handleInputChange(`tasks.${currentTaskName}.settings.ICLabel.enabled`, !icLabelSettings.enabled)}
                                className="flex items-center justify-between w-full p-3 border rounded-md hover:border-purple-200 hover:bg-purple-50/30 transition-colors"
                            >
                                <div className="flex-1 flex items-center space-x-3">
                                    <div className={`
                                        flex items-center justify-center w-5 h-5 border rounded-sm transition-colors
                                        ${icLabelSettings.enabled ? 'bg-purple-500 border-purple-600' : 'border-input'}
                                    `}>
                                        {icLabelSettings.enabled && <Check className="h-4 w-4 text-white" />}
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <Label className="font-medium">ICLabel</Label>
                                        <p className="text-sm text-muted-foreground">Automatic labeling and rejection of ICA components.</p>
                                    </div>
                                </div>
                            </button>
                            
                            <AnimatePresence>
                                {icLabelSettings.enabled && (
                                    <motion.div 
                                        key="iclabel-content"
                                        className="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-purple-200 ml-2.5 overflow-hidden"
                                        initial={sectionAnimation.initial}
                                        animate={sectionAnimation.animate}
                                        exit={{ opacity: 0, height: 0, y: 5, transition: { duration: 0.2 } }} 
                                        transition={sectionAnimation.transition}
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
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={goToPreviousStep}>Back to EOG & Channels</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={goToNextStep}>Next: Epochs</Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
};

export default Step7ICA;