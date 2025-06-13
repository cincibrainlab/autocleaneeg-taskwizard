import React from 'react';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import shadcn/ui components
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Import local components and types
import FormField from '@/components/FormField'; // Assuming FormField is in the right place
import { EventIdInput } from '@/components/EventIdInput';
import { TaskData, ValidationErrors } from '@/lib/types'; // Adjust path as needed
import { formatStepKey } from '@/lib/utils'; // Adjust path as needed

// Animation variants (can be moved to a shared location later)
const sectionAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
};

// Define the props interface
interface Step8Props {
    currentTaskName: string;
    taskData: TaskData; // Pass the specific task data
    handleInputChange: (path: string, value: any) => void;
    errors: ValidationErrors;
    goToPreviousStep: () => void;
    goToNextStep: () => void;
    // formatStepKey is imported now
}

const Step8Epochs: React.FC<Step8Props> = ({
    currentTaskName,
    taskData,
    handleInputChange,
    errors,
    goToPreviousStep,
    goToNextStep,
}) => {
    // Ensure settings and epoch_settings exist before rendering
    if (!taskData?.settings?.epoch_settings) {
        // Optionally render a loading state or null
        // Or handle this upstream in App.tsx to not render Step 8 if data is missing
        console.warn("Epoch settings data missing in Step8Epochs");
        return null; 
    }

    const basePath = `tasks.${currentTaskName}.settings.epoch_settings`;

    return (
        <Card className="border-t-4 border-t-lime-500 shadow-md overflow-hidden">
            <CardHeader className="mx-1 mt-1 mb-0 rounded-lg bg-gradient-to-r from-lime-50 to-green-50 pt-4 pb-4">
                <CardTitle>Step 8: Epoch Settings</CardTitle>
                <CardDescription>Configure data epoching and segmentation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-6">
                    {/* Main Epoch Settings Toggle */}
                    <motion.div className="space-y-4" layout>
                        <button
                            type="button"
                            onClick={() => handleInputChange(`${basePath}.enabled`, !taskData.settings?.epoch_settings?.enabled)}
                            className="flex items-center justify-between w-full p-3 border rounded-md hover:border-lime-200 hover:bg-lime-50/30 transition-colors"
                        >
                            <div className="flex-1 flex items-center space-x-3">
                                <div className={`
                                    flex items-center justify-center w-5 h-5 border rounded-sm transition-colors
                                    ${taskData.settings?.epoch_settings?.enabled ? 'bg-lime-500 border-lime-600' : 'border-input'}
                                `}>
                                    {taskData.settings?.epoch_settings?.enabled && <Check className="h-4 w-4 text-white" />}
                                </div>
                                <div className="space-y-1 text-left">
                                    <Label className="font-medium">{formatStepKey("epoch_settings")}</Label>
                                    <p className="text-sm text-muted-foreground">Configure how data is segmented into epochs.</p>
                                </div>
                            </div>
                        </button>

                        {/* Conditional Epoch Settings Content */}
                        <AnimatePresence>
                            {taskData.settings?.epoch_settings?.enabled && (
                                <motion.div
                                    key="epoch-main-content"
                                    className="pl-8 pt-3 pb-1 space-y-6 border-l-2 border-lime-200 ml-2.5 overflow-hidden"
                                    initial={{ opacity: 0, height: 0, y: 10 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0, transition: sectionAnimation.transition }}
                                    exit={{ opacity: 0, height: 0, y: 5, transition: { duration: 0.2 } }}
                                >
                                    {/* Tmin/Tmax Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            path={`${basePath}.value.tmin`}
                                            label="Epoch Start Time (tmin)"
                                            tooltip="Start time of the epoch relative to the event (seconds)."
                                            value={taskData.settings.epoch_settings.value?.tmin?.toString() ?? ''}
                                            onChange={(path, val) => handleInputChange(path, val === '' ? null : parseFloat(val))}
                                            error={errors[`${basePath}.value.tmin`] || errors[`${basePath}.value`]}
                                            type="number"
                                            placeholder="e.g., -0.2"
                                        />
                                         <FormField
                                            path={`${basePath}.value.tmax`}
                                            label="Epoch End Time (tmax)"
                                            tooltip="End time of the epoch relative to the event (seconds)."
                                            value={taskData.settings.epoch_settings.value?.tmax?.toString() ?? ''}
                                            onChange={(path, val) => handleInputChange(path, val === '' ? null : parseFloat(val))}
                                            error={errors[`${basePath}.value.tmax`] || errors[`${basePath}.value`]}
                                            type="number"
                                            placeholder="e.g., 0.5"
                                        />
                                    </div>

                                    {/* Event ID Section */}
                                    <motion.div className="space-y-4" layout>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const currentValue = taskData.settings?.epoch_settings?.event_id;
                                                // Toggle between null (fixed-length) and an empty array (event-based)
                                                const newValue = currentValue ? null : []; 
                                                handleInputChange(`${basePath}.event_id`, newValue);
                                            }}
                                            className="flex items-center justify-between w-full p-3 border rounded-md hover:border-lime-200 hover:bg-lime-50/30 transition-colors"
                                        >
                                            <div className="flex-1 flex items-center space-x-3">
                                                <div className={`
                                                    flex items-center justify-center w-5 h-5 border rounded-sm transition-colors
                                                    ${taskData.settings?.epoch_settings?.event_id ? 'bg-lime-500 border-lime-600' : 'border-input'}
                                                `}>
                                                    {taskData.settings?.epoch_settings?.event_id && <Check className="h-4 w-4 text-white" />}
                                                </div>
                                                <div className="space-y-1 text-left">
                                                    <Label className="font-medium">Event-Based Epochs</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Create epochs based on event markers. If disabled, epochs will be fixed-length.
                                                    </p>
                                                </div>
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {taskData.settings?.epoch_settings?.event_id && Array.isArray(taskData.settings.epoch_settings.event_id) && (
                                                <motion.div
                                                    key="epoch-eventid-content"
                                                    className="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-lime-200 ml-2.5 overflow-hidden"
                                                    initial={{ opacity: 0, height: 0, y: 10 }}
                                                    animate={{ opacity: 1, height: 'auto', y: 0, transition: sectionAnimation.transition }}
                                                    exit={{ opacity: 0, height: 0, y: 5, transition: { duration: 0.2 } }}
                                                >
                                                    <EventIdInput
                                                        eventIds={taskData.settings.epoch_settings.event_id}
                                                        onChange={(eventIds) => handleInputChange(`${basePath}.event_id`, eventIds)}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    {/* Baseline Removal Section */}
                                    {taskData.settings.epoch_settings.remove_baseline && (
                                        <motion.div className="space-y-4" layout>
                                            <button
                                                type="button"
                                                onClick={() => handleInputChange(`${basePath}.remove_baseline.enabled`, !taskData.settings?.epoch_settings?.remove_baseline?.enabled)}
                                                className="flex items-center justify-between w-full p-3 border rounded-md hover:border-lime-200 hover:bg-lime-50/30 transition-colors"
                                            >
                                                <div className="flex-1 flex items-center space-x-3">
                                                    <div className={`
                                                        flex items-center justify-center w-5 h-5 border rounded-sm transition-colors
                                                        ${taskData.settings?.epoch_settings?.remove_baseline?.enabled ? 'bg-lime-500 border-lime-600' : 'border-input'}
                                                    `}>
                                                        {taskData.settings?.epoch_settings?.remove_baseline?.enabled && <Check className="h-4 w-4 text-white" />}
                                                    </div>
                                                    <div className="space-y-1 text-left">
                                                        <Label className="font-medium">Remove Baseline</Label>
                                                        <p className="text-sm text-muted-foreground">Subtract baseline from each epoch.</p>
                                                    </div>
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {taskData.settings?.epoch_settings?.remove_baseline?.enabled && (
                                                    <motion.div
                                                        key="epoch-baseline-content"
                                                        className="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-lime-200 ml-2.5 overflow-hidden"
                                                        initial={{ opacity: 0, height: 0, y: 10 }}
                                                        animate={{ opacity: 1, height: 'auto', y: 0, transition: sectionAnimation.transition }}
                                                        exit={{ opacity: 0, height: 0, y: 5, transition: { duration: 0.2 } }}
                                                    >
                                                        {/* Check window exists and is an array before accessing index */}
                                                        {taskData.settings.epoch_settings.remove_baseline.window && Array.isArray(taskData.settings.epoch_settings.remove_baseline.window) && taskData.settings.epoch_settings.remove_baseline.window.length === 2 && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <FormField
                                                                    path={`${basePath}.remove_baseline.window.0`}
                                                                    label="Baseline Start (s)"
                                                                    tooltip="Start of baseline window relative to event (null = tmin)."
                                                                    // Ensure value passed is string for input, handle null/undefined
                                                                    value={taskData.settings.epoch_settings.remove_baseline.window[0]?.toString() ?? ''} 
                                                                    onChange={(path, val) => handleInputChange(path, val === '' ? null : parseFloat(val))} // Convert back to number or null
                                                                    error={errors[`${basePath}.remove_baseline.window`] || errors[`${basePath}.remove_baseline.window.0`]} // Show parent or specific error
                                                                    type="number"
                                                                    placeholder="e.g., -0.2 (empty = tmin)"
                                                                />
                                                                <FormField
                                                                    path={`${basePath}.remove_baseline.window.1`}
                                                                    label="Baseline End (s)"
                                                                    tooltip="End of baseline window relative to event (usually 0 = event onset)."
                                                                     // Ensure value passed is string for input, handle null/undefined
                                                                    value={taskData.settings.epoch_settings.remove_baseline.window[1]?.toString() ?? ''}
                                                                    onChange={(path, val) => handleInputChange(path, val === '' ? null : parseFloat(val))} // Convert back to number or null
                                                                    error={errors[`${basePath}.remove_baseline.window`] || errors[`${basePath}.remove_baseline.window.1`]} // Show parent or specific error
                                                                    type="number"
                                                                    placeholder="e.g., 0"
                                                                />
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    )}

                                    {/* Threshold Rejection Section */}
                                    {taskData.settings.epoch_settings.threshold_rejection && (
                                        <motion.div className="space-y-4" layout>
                                            <button
                                                type="button"
                                                onClick={() => handleInputChange(`${basePath}.threshold_rejection.enabled`, !taskData.settings?.epoch_settings?.threshold_rejection?.enabled)}
                                                className="flex items-center justify-between w-full p-3 border rounded-md hover:border-lime-200 hover:bg-lime-50/30 transition-colors"
                                            >
                                                <div className="flex-1 flex items-center space-x-3">
                                                    <div className={`
                                                        flex items-center justify-center w-5 h-5 border rounded-sm transition-colors
                                                        ${taskData.settings?.epoch_settings?.threshold_rejection?.enabled ? 'bg-lime-500 border-lime-600' : 'border-input'}
                                                    `}>
                                                        {taskData.settings?.epoch_settings?.threshold_rejection?.enabled && <Check className="h-4 w-4 text-white" />}
                                                    </div>
                                                    <div className="space-y-1 text-left">
                                                        <Label className="font-medium">Threshold Rejection</Label>
                                                        <p className="text-sm text-muted-foreground">Reject epochs that exceed voltage threshold.</p>
                                                    </div>
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {taskData.settings?.epoch_settings?.threshold_rejection?.enabled && taskData.settings.epoch_settings.threshold_rejection.volt_threshold && (
                                                    <motion.div
                                                        key="epoch-threshold-content"
                                                        className="pl-8 pt-3 pb-1 space-y-4 border-l-2 border-lime-200 ml-2.5 overflow-hidden"
                                                        initial={{ opacity: 0, height: 0, y: 10 }}
                                                        animate={{ opacity: 1, height: 'auto', y: 0, transition: sectionAnimation.transition }}
                                                        exit={{ opacity: 0, height: 0, y: 5, transition: { duration: 0.2 } }}
                                                    >
                                                        <FormField
                                                            path={`${basePath}.threshold_rejection.volt_threshold.eeg`}
                                                            label="EEG Threshold (V)"
                                                            tooltip="Voltage threshold in Volts (e.g., 150e-6 for 150 µV)."
                                                            value={taskData.settings.epoch_settings.threshold_rejection.volt_threshold.eeg}
                                                            onChange={handleInputChange}
                                                            error={errors[`${basePath}.threshold_rejection.volt_threshold.eeg`]}
                                                            type="text" // Keep as text to allow scientific notation easily
                                                            placeholder="e.g., 150e-6"
                                                        />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-6">
                        <Button variant="outline" onClick={goToPreviousStep}>Back to ICA</Button>
                        <Button className="bg-lime-600 hover:bg-lime-700" onClick={goToNextStep}>Next: Preview</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default Step8Epochs; 