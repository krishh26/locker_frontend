import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
} from '@mui/material';
import { Monitor, Smartphone, X } from 'lucide-react';
import PublicFormPreview from './public-form-preview';

interface SurveyPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyId: string;
}

const SurveyPreview: React.FC<SurveyPreviewProps> = ({ open, onOpenChange, surveyId }) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          width: viewMode === 'desktop' ? '90vw' : '450px',
          maxWidth: viewMode === 'desktop' ? '1200px' : '450px',
          height: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <span>Preview</span>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="desktop">
              <Monitor size={18} />
            </ToggleButton>
            <ToggleButton value="mobile">
              <Smartphone size={18} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <IconButton onClick={() => onOpenChange(false)} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
            bgcolor: 'grey.100',
          }}
        >
          <PublicFormPreview surveyId={surveyId} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SurveyPreview;

