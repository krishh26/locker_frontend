import React from 'react';
import { Box, Stepper, Step, StepLabel, Tooltip, Paper } from '@mui/material';

interface StepperComponentProps {
  steps: string[];
  activeStep: number;
  completedSteps: Record<number, boolean>;
  handleStepClick: (step: number) => void;
  isStepClickable: (index: number) => boolean;
  getTooltipTitle: (index: number) => string;
}

const StepperComponent: React.FC<StepperComponentProps> = ({
  steps,
  activeStep,
  completedSteps,
  handleStepClick,
  isStepClickable,
  getTooltipTitle
}) => {
  return (
    <Paper elevation={0} className="mb-6 p-4 border border-gray-200">
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => {
          const stepProps: { completed?: boolean } = {};
          if (completedSteps[index]) {
            stepProps.completed = true;
          }
          
          const isClickable = isStepClickable(index);
          const tooltipTitle = getTooltipTitle(index);

          return (
            <Step key={label} {...stepProps}>
              <Tooltip title={tooltipTitle} placement="top" arrow>
                <Box 
                  onClick={() => handleStepClick(index)}
                  sx={{ 
                    cursor: isClickable ? 'pointer' : 'default',
                    opacity: isClickable ? 1 : 0.7,
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    transition: 'background-color 0.3s',
                    '&:hover': {
                      backgroundColor: isClickable ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                    },
                    '& .MuiStepLabel-root': {
                      width: '100%'
                    }
                  }}
                >
                  <StepLabel>
                    {label}
                  </StepLabel>
                </Box>
              </Tooltip>
            </Step>
          );
        })}
      </Stepper>
    </Paper>
  );
};

export default StepperComponent;
