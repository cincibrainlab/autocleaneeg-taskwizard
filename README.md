# EEG Workflow Wizard

A React TypeScript application that generates configuration files for the Autoclean EEG preprocessing pipeline. This wizard guides users through a 9-step process to create configuration files for automated EEG data processing.

## 🧠 Overview

The EEG Workflow Wizard is designed for researchers at Cincinnati Children's Hospital Medical Center to streamline the setup of EEG data preprocessing pipelines. It generates three essential configuration files:

- **`config.yaml`** - Autoclean pipeline configuration
- **`lossless_config.yaml`** - PyLossless filtering parameters  
- **`task_script.py`** - Python implementation script

## 🚀 Live Demo

Visit the live application: [EEG Workflow Wizard](https://yourusername.github.io/EegWorkflowWizard-cinci/)

## 🛠️ Development

### Prerequisites

- Node.js 18 or higher
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/EegWorkflowWizard-cinci.git
cd EegWorkflowWizard-cinci

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── steps/          # Step components (Step4-Step9)
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   └── ...             # Other components
├── lib/
│   ├── configTemplates.ts  # Predefined task configurations
│   ├── fileGeneration.ts   # Output file creation logic
│   ├── types.ts            # TypeScript interfaces
│   └── ...                 # Utilities and validation
└── App.tsx             # Main wizard orchestration
```

## 🔧 Technology Stack

- **React 19** + TypeScript
- **Vite** - Build tool and dev server
- **shadcn/ui** - Component library
- **Tailwind CSS v4** - Styling
- **js-yaml** - YAML serialization
- **JSZip** - File bundling
- **Framer Motion** - Animations

## 📋 Wizard Steps

1. **Template Selection** - Choose from predefined EEG task templates
2. **Task Configuration** - Set basic task parameters
3. **File Management** - Configure input/output settings
4. **Montage Setup** - Define electrode configurations
5. **Resample & Re-reference** - Set sampling and referencing options
6. **Trim & Crop** - Configure data segmentation
7. **EOG & ICA** - Set up artifact removal
8. **Epochs** - Define epoching parameters
9. **Configure & Export** - Generate and download configuration files

## 🎯 EEG Domain Context

This application generates configurations for automated EEG (electroencephalography) data preprocessing, integrating two Python libraries:

- **Autoclean** - High-level EEG pipeline orchestration
- **PyLossless** - Low-level filtering and artifact detection

## 🚀 Deployment

The application automatically deploys to GitHub Pages when changes are pushed to the `main` branch via GitHub Actions.

To set up GitHub Pages deployment:
1. Go to repository Settings → Pages
2. Select "GitHub Actions" as the source
3. Push to main branch to trigger deployment

## 📄 License

[Add your license information here]

## 🏥 Affiliation

Developed for Cincinnati Children's Hospital Medical Center
