import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  FormGroup,
  FormLabel,
  Alert,
  Card,
  CardContent,
  Button,
} from '@mui/material';

interface FormPreviewProps {
  fields: any[];
  formTitle?: string;
  formDescription?: string;
  onSubmit?: (values: { [key: string]: any }) => void;
}

const FormPreview: React.FC<FormPreviewProps> = ({
  fields,
  formTitle = 'Form Preview',
  formDescription,
  onSubmit,
}) => {
  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const renderField = (field: any) => {
    const value = formValues[field.id] || '';
    const fieldType = field.type;

    switch (fieldType) {
      case 'text':
      case 'textfield':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <TextField
            key={field.id}
            label={field.label}
            placeholder={field.placeholder}
            type={fieldType === 'email' ? 'email' : fieldType === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            fullWidth
            required={field.required}
            margin="normal"
            variant="outlined"
          />
        );

      case 'textarea':
        return (
          <TextField
            key={field.id}
            label={field.label}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            fullWidth
            required={field.required}
            margin="normal"
            variant="outlined"
            multiline
            rows={4}
          />
        );

      case 'select':
        return (
          <FormControl key={field.id} fullWidth margin="normal" required={field.required}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              label={field.label}
            >
              {field.options?.map((option: string, index: number) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'radio':
        return (
          <Box key={field.id} sx={{ mt: 2, mb: 1 }}>
            <FormLabel component="legend" required={field.required}>
              {field.label}
            </FormLabel>
            <RadioGroup
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            >
              {field.options?.map((option: string, index: number) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </Box>
        );

      case 'checkbox':
        return (
          <Box key={field.id} sx={{ mt: 2, mb: 1 }}>
            <FormLabel component="legend" required={field.required}>
              {field.label}
            </FormLabel>
            <FormGroup>
              {field.options?.map((option: string, index: number) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={Array.isArray(value) ? value.includes(option) : false}
                      onChange={(e) => {
                        const currentValues = Array.isArray(value) ? value : [];
                        if (e.target.checked) {
                          handleFieldChange(field.id, [...currentValues, option]);
                        } else {
                          handleFieldChange(field.id, currentValues.filter(v => v !== option));
                        }
                      }}
                    />
                  }
                  label={option}
                />
              ))}
            </FormGroup>
          </Box>
        );

      case 'date':
        return (
          <TextField
            key={field.id}
            label={field.label}
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            fullWidth
            required={field.required}
            margin="normal"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'file':
        return (
          <Box key={field.id} sx={{ mt: 2, mb: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <TextField
              type="file"
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                handleFieldChange(field.id, target.files);
              }}
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        );

      default:
        return (
          <TextField
            key={field.id}
            label={field.label}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            fullWidth
            required={field.required}
            margin="normal"
            variant="outlined"
          />
        );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formValues);
    } else {
      console.log('Form submitted with values:', formValues);
      alert('Form submitted successfully! Check console for form data.');
    }
  };

  const handleClearForm = () => {
    setFormValues({});
  };

  return (
    <Card elevation={2} sx={{ maxWidth: 800, mx: 'auto' }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
          {formTitle}
        </Typography>
        
        {formDescription && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {formDescription}
          </Typography>
        )}

        {fields.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No fields added to the form yet. Switch to edit mode to add fields.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            {fields.map(renderField)}
            
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" type="button" onClick={handleClearForm}>
                Clear Form
              </Button>
              <Button variant="contained" type="submit">
                Submit Form
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FormPreview;
