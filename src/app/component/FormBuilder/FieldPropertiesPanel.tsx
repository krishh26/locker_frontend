import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Chip,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormField } from './DragDropFormBuilder';

interface FieldPropertiesPanelProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
}

const FieldPropertiesPanel: React.FC<FieldPropertiesPanelProps> = ({
  field,
  onUpdate,
}) => {
  const [localField, setLocalField] = useState(field);

  useEffect(() => {
    setLocalField(field);
  }, [field]);

  const handleChange = (property: string, value: any) => {
    const updatedField = { ...localField, [property]: value };
    setLocalField(updatedField);
    onUpdate({ [property]: value });
  };

  const handleOptionsChange = (options: string[]) => {
    handleChange('options', options);
  };

  const addOption = () => {
    const currentOptions = localField.options || [];
    const newOptions = [...currentOptions, `Option ${currentOptions.length + 1}`];
    handleOptionsChange(newOptions);
  };

  const updateOption = (index: number, value: string) => {
    const currentOptions = localField.options || [];
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    handleOptionsChange(newOptions);
  };

  const removeOption = (index: number) => {
    const currentOptions = localField.options || [];
    const newOptions = currentOptions.filter((_, i) => i !== index);
    handleOptionsChange(newOptions);
  };

  const hasOptions = ['select', 'radio', 'checkbox'].includes(field.type);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Basic Properties */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Basic Properties
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Field Label"
              value={localField.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              size="small"
              fullWidth
            />

            {['textfield', 'textarea', 'number', 'email'].includes(field.type) && (
              <TextField
                label="Placeholder"
                value={localField.placeholder || ''}
                onChange={(e) => handleChange('placeholder', e.target.value)}
                size="small"
                fullWidth
              />
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={localField.required || false}
                  onChange={(e) => handleChange('required', e.target.checked)}
                />
              }
              label="Required Field"
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Options (for select, radio, checkbox) */}
      {hasOptions && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Options
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {(localField.options || []).map((option, index) => (
                <Box
                  key={index}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <TextField
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    size="small"
                    fullWidth
                    placeholder={`Option ${index + 1}`}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeOption(index)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <IconButton
                  onClick={addOption}
                  sx={{
                    border: '1px dashed',
                    borderColor: 'primary.main',
                    color: 'primary.main',
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Validation Rules */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Validation
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {field.type === 'textfield' && (
              <>
                <TextField
                  label="Minimum Length"
                  type="number"
                  value={localField.validation?.minLength || ''}
                  onChange={(e) => handleChange('validation', {
                    ...localField.validation,
                    minLength: parseInt(e.target.value) || undefined
                  })}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Maximum Length"
                  type="number"
                  value={localField.validation?.maxLength || ''}
                  onChange={(e) => handleChange('validation', {
                    ...localField.validation,
                    maxLength: parseInt(e.target.value) || undefined
                  })}
                  size="small"
                  fullWidth
                />
              </>
            )}

            {field.type === 'number' && (
              <>
                <TextField
                  label="Minimum Value"
                  type="number"
                  value={localField.validation?.min || ''}
                  onChange={(e) => handleChange('validation', {
                    ...localField.validation,
                    min: parseFloat(e.target.value) || undefined
                  })}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Maximum Value"
                  type="number"
                  value={localField.validation?.max || ''}
                  onChange={(e) => handleChange('validation', {
                    ...localField.validation,
                    max: parseFloat(e.target.value) || undefined
                  })}
                  size="small"
                  fullWidth
                />
              </>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Field Info */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Field ID: {field.id}
        </Typography>
        <br />
        <Typography variant="caption" color="text.secondary">
          Type: {field.type}
        </Typography>
      </Box>
    </Box>
  );
};

export default FieldPropertiesPanel;
