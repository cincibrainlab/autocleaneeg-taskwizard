import React from 'react';

// Import shadcn/ui components
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Import local components and types
import RejectionPolicySection from '@/components/RejectionPolicySection'; // Adjust path if needed
import { TaskData, ValidationErrors } from '@/lib/types'; // Adjust path as needed

// Define the props interface
interface Step9Props {
    currentTaskName: string;
    taskData: TaskData; // Pass the specific task data
    handleInputChange: (path: string, value: any) => void;
    errors: ValidationErrors;
    pythonPreview: string;
    handlePreview: () => void;
    handleDownload: () => Promise<void>; // Assuming it returns Promise<void>
    goToPreviousStep: () => void;
}

const Step9Configure: React.FC<Step9Props> = ({
    currentTaskName,
    taskData,
    handleInputChange,
    errors,
    pythonPreview,
    handlePreview,
    handleDownload,
    goToPreviousStep,
}) => {
    // Ensure taskData and rejection_policy exist if needed by RejectionPolicySection
    if (!taskData) {
        console.warn("Task data missing in Step9Configure");
        return null; // Or render an error/loading state
    }

    return (
        <> 
            {/* Configuration Complete - No rejection policy needed in new structure */}
            
            {/* Preview & Download Section */}
            <Card className="border-t-4 border-t-emerald-500 shadow-md mt-6 overflow-hidden">
                <CardHeader className="mx-1 mt-1 mb-0 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 pt-4 pb-4">
                    <CardTitle>Step 9: Preview & Download</CardTitle>
                    <CardDescription>Preview your configuration and download the Python task file.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="flex flex-wrap gap-4"> {/* Use flex-wrap for smaller screens */}
                        <Button onClick={handlePreview} className="bg-emerald-600 hover:bg-emerald-700 flex-shrink-0">Preview Python File</Button>
                        <Button onClick={handleDownload} className="bg-teal-600 hover:bg-teal-700 flex-shrink-0">Download Task File</Button>
                    </div>
                    
                    {/* Display Validation errors related to Python file generation */}
                    {(errors.pythonGeneration || errors.fileGeneration) && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{errors.pythonGeneration || errors.fileGeneration}</AlertDescription>
                        </Alert>
                    )}
                    
                    {/* Python Preview Area */}
                    {pythonPreview && (
                        <Textarea
                            readOnly
                            value={pythonPreview}
                            className="mt-4 font-mono h-96 text-sm border-emerald-200"
                            placeholder="Python task file preview will appear here..."
                        />
                    )}
                </CardContent>
            </Card>
            
            {/* Final Navigation Button */}
            <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={goToPreviousStep}>Back to Epochs</Button>
                {/* No "Next" button on the final step */}
            </div>
        </>
    );
};

export default Step9Configure; 