import React, { useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { DragDropFormBuilder, FormField } from 'src/app/component/FormBuilder';

const FormBuilderDemo: React.FC = () => {
  const [formFields, setFormFields] = useState<FormField[]>([]);

  const handleFormChange = (fields: FormField[]) => {
    setFormFields(fields);
    console.log('Form fields updated:', fields);
  };

  const handleSave = (fields: FormField[]) => {
    console.log('Saving form with fields:', fields);
    alert('Form saved! Check console for details.');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          🎨 New Drag & Drop Form Builder
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Create forms intuitively with our new drag-and-drop interface. No popups, just smooth interactions!
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => console.log('Current fields:', formFields)}
          >
            Log Current Fields
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSave(formFields)}
            disabled={formFields.length === 0}
          >
            Save Form ({formFields.length} fields)
          </Button>
        </Box>
      </Paper>

      <DragDropFormBuilder
        initialFields={formFields}
        onChange={handleFormChange}
        onSave={handleSave}
      />
    </Box>
  );
};

export default FormBuilderDemo;
