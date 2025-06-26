import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FormField from '../FormField'; 
import { AnimatedSection } from '@/components/AnimatedSection';
import type { TaskData, ValidationErrors } from '@/lib/types';
import { formatStepKey } from '@/lib/utils';
import { designSystem, cn } from '@/lib/design-system'; 

interface Step7Props {
  currentTaskName: string;
  currentTaskData: TaskData;
  handleInputChange: (path: string, value: any) => void;
  errors: ValidationErrors;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
}

const Step7EogChannels: React.FC<Step7Props> = ({ 
  currentTaskName, 
  currentTaskData, 
  handleInputChange, 
  errors, 
  goToPreviousStep, 
  goToNextStep 
}) => {
  // Ensure data exists before rendering
  if (!currentTaskData.settings) return null; 
  const eogSettings = currentTaskData.settings.eog_step;
  const dropSettings = currentTaskData.settings.drop_outerlayer;

  return (
    <Card className={designSystem.card.container}>
        <CardHeader className={cn(designSystem.card.header, "bg-gradient-to-r from-yellow-50 to-amber-50")}>
            <CardTitle className={designSystem.card.title}>EOG & Channel Management</CardTitle>
            <CardDescription className={designSystem.card.description}>Identify ocular artifact channels and exclude problematic electrodes from analysis.</CardDescription>
        </CardHeader>
        <CardContent className={cn("space-y-6", designSystem.card.content)}>
            <div className="space-y-6">
                {/* EOG Channels Section */}
                {eogSettings && (
                    <AnimatedSection
                        title={formatStepKey("eog_step")}
                        description="Assign channels as EOG (electrooculography) for artifact detection."
                        enabled={eogSettings.enabled}
                        onToggle={() => handleInputChange(`tasks.${currentTaskName}.settings.eog_step.enabled`, !eogSettings.enabled)}
                        contentClassName="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-yellow-200 ml-2.5"
                        color="yellow"
                    >
                        <FormField
                            path={`tasks.${currentTaskName}.settings.eog_step.value`}
                            label="EOG Channel Numbers"
                            tooltip="List of channel numbers to treat as EOG channels (e.g., 1, 32, 8, 14, 17, 21, 25, 125, 126, 127, 128)"
                            value={eogSettings.value}
                            onChange={handleInputChange}
                            error={errors[`tasks.${currentTaskName}.settings.eog_step.value`]}
                            type="list"
                            placeholder="e.g., 1, 32, 8, 14, 17, 21, 25, 125, 126, 127, 128"
                        />
                    </AnimatedSection>
                )}

                {/* Drop Outer Layer Section */}
                {dropSettings && (
                    <AnimatedSection
                        title={formatStepKey("drop_outerlayer")}
                        description="Exclude outer layer or edge channels that are prone to artifacts."
                        enabled={dropSettings.enabled}
                        onToggle={() => handleInputChange(`tasks.${currentTaskName}.settings.drop_outerlayer.enabled`, !dropSettings.enabled)}
                        contentClassName="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-yellow-200 ml-2.5"
                        color="yellow"
                    >
                        <FormField
                            path={`tasks.${currentTaskName}.settings.drop_outerlayer.value`}
                            label="Channels to Drop"
                            tooltip="List of channel names to exclude from analysis (e.g., E17, E38, E43, E44, E48, E49)"
                            value={dropSettings.value}
                            onChange={handleInputChange}
                            error={errors[`tasks.${currentTaskName}.settings.drop_outerlayer.value`]}
                            type="list"
                            placeholder="e.g., E17, E38, E43, E44, E48, E49"
                        />
                    </AnimatedSection>
                )}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={goToPreviousStep} className="px-6 py-3 rounded-xl">← Back to Trim & Crop</Button>
                    <Button onClick={goToNextStep} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl">Next: ICA →</Button>
                </div>
            </div>
        </CardContent>
    </Card>
  );
};

export default Step7EogChannels;