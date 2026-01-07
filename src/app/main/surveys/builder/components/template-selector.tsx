import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  Typography,
  Box,
} from '@mui/material';
import { surveyTemplates, type SurveyTemplate } from './templates';

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: SurveyTemplate) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  open,
  onOpenChange,
  onSelectTemplate,
}) => {
  const handleSelectTemplate = (template: SurveyTemplate) => {
    onSelectTemplate(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="lg" fullWidth>
      <DialogTitle>Create from featured templates</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 3 }}>
          Choose a template to quickly get started with pre-filled questions
        </DialogContentText>

        <Grid container spacing={3}>
          {surveyTemplates.map((template) => (
            <Grid item xs={12} md={6} key={template.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => handleSelectTemplate(template)}
              >
                <Box
                  sx={{
                    height: 150,
                    position: 'relative',
                    background:
                      template.background.type === 'gradient'
                        ? template.background.value
                        : `url(${template.background.value})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(0, 0, 0, 0.2)',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.3)' },
                      transition: 'background-color 0.2s',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 2,
                      color: 'white',
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {template.name}
                    </Typography>
                  </Box>
                </Box>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {template.questions.length} questions
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTemplate(template);
                      }}
                    >
                      Use Template
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelector;

