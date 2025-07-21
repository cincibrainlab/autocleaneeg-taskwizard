# Autoclean Config Wizard

A web-based configuration wizard for the Autoclean EEG preprocessing pipeline. This tool guides users through a step-by-step process to generate Python scripts for automated EEG data processing workflows.

## What is this?

The Autoclean Config Wizard is designed for neuroscience researchers who need to set up EEG data preprocessing pipelines. Instead of manually writing configuration files and Python scripts, this wizard provides an intuitive interface to:

- Select from predefined EEG task templates (Resting State, Chirp, ASSR)
- Configure processing steps like filtering, resampling, and artifact removal
- Set up epoching parameters and channel montages
- Generate a complete Python script ready for execution

## Output

The wizard generates a downloadable Python script (`task_script.py`) that implements your configured EEG processing pipeline using the Autoclean framework.

## Usage

1. Visit the web application
2. Follow the 9-step wizard to configure your EEG processing pipeline
3. Download the generated Python task file
4. Run the task file with you autoclean-eeg installation

## EEG Processing Steps Supported

- Template selection (Resting Eyes Open, Chirp Default, ASSR Default)
- Montage configuration
- Resampling and re-referencing
- Data trimming and cropping
- EOG channel handling and ICA artifact removal
- Epoching configuration
- Custom parameter settings

The generated scripts work with the Autoclean Python library for EEG preprocessing automation.