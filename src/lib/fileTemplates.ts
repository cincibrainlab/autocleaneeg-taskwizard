export const taskScriptTemplate = `from autoclean.core.task import Task

# =============================================================================
#                     {{TASK_DESCRIPTION}} EEG PREPROCESSING CONFIGURATION
# =============================================================================
# This configuration controls how your {{TASK_DESCRIPTION}} EEG data will be 
# automatically cleaned and processed. Each section handles a different aspect
# of the preprocessing pipeline.
#
# 🟢 enabled: True  = Apply this processing step
# 🔴 enabled: False = Skip this processing step
#
# 💡 TIP: A web-based configuration wizard is available to generate this
#         automatically - you shouldn't need to edit this manually!
# =============================================================================

config = {{CONFIG_DICT}}

class {{CLASS_NAME}}(Task):

    def run(self) -> None:
        # Import raw EEG data
        self.import_raw()

        #Basic preprocessing steps
        self.resample_data()

        self.filter_data()

        self.drop_outer_layer()

        self.assign_eog_channels()

        self.trim_edges()

        self.crop_duration()

        self.original_raw = self.raw.copy()
        
        # Create BIDS-compliant paths and filenames
        self.create_bids_path()
        
        # Channel cleaning
        self.clean_bad_channels()
        
        # Re-referencing
        self.rereference_data()
        
        # Artifact detection
        self.annotate_noisy_epochs()
        self.annotate_uncorrelated_epochs()
        self.detect_dense_oscillatory_artifacts()
        
        # ICA processing with optional export
        self.run_ica()  # Export after ICA
        self.run_ICLabel()
        
        # Epoching with export
        {{EPOCHING_CODE}}
        
        # Detect outlier epochs
        self.detect_outlier_epochs()
        
        # Clean epochs using GFP with export
        self.gfp_clean_epochs() 

        # Generate visualization reports
        self.generate_reports()


    def generate_reports(self) -> None:
        """Generate quality control visualizations and reports."""
        if self.raw is None or self.original_raw is None:
            return
            
        # Plot raw vs cleaned overlay using mixin method
        self.plot_raw_vs_cleaned_overlay(self.original_raw, self.raw)
        
        # Plot PSD topography using mixin method
        self.step_psd_topo_figure(self.original_raw, self.raw)
        
        # Additional report generation can be added here

`; 