import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FormField from '../FormField'; 
import { AnimatedSection } from '@/components/AnimatedSection';
import { montageOptions } from '@/lib/constants';
import type { TaskData, ValidationErrors } from '@/lib/types';

interface Step4Props {
  currentTaskName: string;
  currentTaskData: TaskData;
  handleInputChange: (path: string, value: any) => void;
  errors: ValidationErrors;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
}

const Step4Montage: React.FC<Step4Props> = ({ 
  currentTaskName, 
  currentTaskData, 
  handleInputChange, 
  errors, 
  goToPreviousStep, 
  goToNextStep 
}) => {
  // Ensure data exists before rendering
  if (!currentTaskData.settings?.montage || !currentTaskData.settings?.filtering) return null; 
  const montageSettings = currentTaskData.settings.montage;
  const filteringSettings = currentTaskData.settings.filtering;

  return (
    <Card className="border-t-4 border-t-pink-500 shadow-md overflow-hidden">
        <CardHeader className="mx-1 mt-1 mb-0 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 pt-4 pb-4">
            <CardTitle>Step 3: Filtering & Montage</CardTitle>
            <CardDescription>Configure filtering parameters and EEG montage/cap layout.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
            <div className="space-y-6">
                {/* Filtering Section */}
                <AnimatedSection
                    title="Filtering"
                    description="Configure high-pass, low-pass, and notch filtering."
                    enabled={filteringSettings.enabled}
                    onToggle={() => handleInputChange(`tasks.${currentTaskName}.settings.filtering.enabled`, !filteringSettings.enabled)}
                    contentClassName="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-pink-200 ml-2.5"
                    color="pink"
                >
                    <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                            path={`tasks.${currentTaskName}.settings.filtering.value.l_freq`}
                            label="Low Cutoff Frequency (Hz)"
                            tooltip="High-pass filter cutoff frequency (e.g., 1 or 2)"
                            value={filteringSettings.value?.l_freq}
                            onChange={handleInputChange}
                            error={errors[`tasks.${currentTaskName}.settings.filtering.value.l_freq`]}
                            type="number"
                            placeholder="e.g., 1"
                        />
                        <FormField
                            path={`tasks.${currentTaskName}.settings.filtering.value.h_freq`}
                            label="High Cutoff Frequency (Hz)"
                            tooltip="Low-pass filter cutoff frequency (e.g., 100 or 125)"
                            value={filteringSettings.value?.h_freq}
                            onChange={handleInputChange}
                            error={errors[`tasks.${currentTaskName}.settings.filtering.value.h_freq`]}
                            type="number"
                            placeholder="e.g., 100"
                        />
                        <FormField
                            path={`tasks.${currentTaskName}.settings.filtering.value.notch_freqs`}
                            label="Notch Frequencies (Hz)"
                            tooltip="Frequency or frequencies to notch filter (e.g., 60 for power line noise)"
                            value={filteringSettings.value?.notch_freqs}
                            onChange={handleInputChange}
                            error={errors[`tasks.${currentTaskName}.settings.filtering.value.notch_freqs`]}
                            type="list"
                            placeholder="e.g., 60, 120"
                        />
                        <FormField
                            path={`tasks.${currentTaskName}.settings.filtering.value.notch_widths`}
                            label="Notch Width (Hz)"
                            tooltip="Width of the notch filter band(s)"
                            value={filteringSettings.value?.notch_widths}
                            onChange={handleInputChange}
                            error={errors[`tasks.${currentTaskName}.settings.filtering.value.notch_widths`]}
                            type="number"
                            placeholder="e.g., 5"
                        />
                    </div>
                </AnimatedSection>

                {/* Montage Section */}
                <AnimatedSection
                    title="Montage"
                    description="Set the EEG montage/cap layout."
                    enabled={montageSettings.enabled}
                    onToggle={() => handleInputChange(`tasks.${currentTaskName}.settings.montage.enabled`, !montageSettings.enabled)}
                    contentClassName="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-pink-200 ml-2.5"
                    color="pink"
                >
                    <FormField
                        path={`tasks.${currentTaskName}.settings.montage.value`}
                        label="Montage Type"
                        tooltip="The type of montage/cap layout to use"
                        value={montageSettings.value} 
                        onChange={handleInputChange}
                        error={errors[`tasks.${currentTaskName}.settings.montage.value`]}
                        type="select"
                        options={montageOptions} 
                        placeholder="Select montage type..."
                    />
                </AnimatedSection>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={goToPreviousStep}>Back to Task Info</Button> 
                    <Button className="bg-pink-600 hover:bg-pink-700" onClick={goToNextStep}>Next: Resample & Rereference</Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
};

export default Step4Montage;