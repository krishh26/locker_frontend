import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Button,
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PreviewIcon from '@mui/icons-material/Preview';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropFormBuilder, FormField } from 'src/app/component/FormBuilder';
import {
  createFormDataAPI,
  updateFormDataAPI,
  selectFormData,
  slice,
} from 'app/store/formData';
import { LoadingButton } from 'src/app/component/Buttons';

const ImprovedFormBuilder: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: any = useDispatch();
  const { singleData, mode, dataUpdatingLoadding } = useSelector(selectFormData);

  const [formMetadata, setFormMetadata] = useState({
    form_name: '',
    description: '',
    type: 'survey',
  });

  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    // Load existing form data if in edit mode
    if (mode === 'edit' && singleData) {
      setFormMetadata({
        form_name: singleData.form_name || '',
        description: singleData.description || '',
        type: singleData.type || 'survey',
      });
      
      // Convert existing form data to our FormField format
      if (singleData.form_data) {
        const convertedFields = convertFormIOToFormFields(singleData.form_data);
        setFormFields(convertedFields);
      }
    }
  }, [mode, singleData]);

  const convertFormIOToFormFields = (formIOComponents: any[]): FormField[] => {
    return formIOComponents.map((component, index) => ({
      id: component.key || `field_${index}`,
      type: mapFormIOTypeToOurType(component.type),
      label: component.label || component.placeholder || 'Untitled Field',
      placeholder: component.placeholder,
      required: component.validate?.required || false,
      options: component.values?.map((v: any) => v.label || v.value) || component.data?.values?.map((v: any) => v.label),
      validation: component.validate,
      properties: component,
    }));
  };

  const mapFormIOTypeToOurType = (formIOType: string): string => {
    const typeMap: { [key: string]: string } = {
      textfield: 'textfield',
      textarea: 'textarea',
      select: 'select',
      radio: 'radio',
      checkbox: 'checkbox',
      number: 'number',
      email: 'email',
      datetime: 'date',
      file: 'file',
    };
    return typeMap[formIOType] || 'textfield';
  };

  const convertToFormIOFormat = (fields: FormField[]) => {
    return fields.map((field) => {
      const baseComponent = {
        key: field.id,
        type: mapOurTypeToFormIO(field.type),
        label: field.label,
        placeholder: field.placeholder,
        input: true,
        validate: {
          required: field.required,
          ...field.validation,
        },
      };

      // Add type-specific properties
      if (['select', 'radio', 'checkbox'].includes(field.type) && field.options) {
        return {
          ...baseComponent,
          values: field.options.map((option) => ({
            label: option,
            value: option.toLowerCase().replace(/\s+/g, '_'),
          })),
        };
      }

      return baseComponent;
    });
  };

  const mapOurTypeToFormIO = (ourType: string): string => {
    const typeMap: { [key: string]: string } = {
      textfield: 'textfield',
      textarea: 'textarea',
      select: 'select',
      radio: 'radio',
      checkbox: 'checkbox',
      number: 'number',
      email: 'email',
      date: 'datetime',
      file: 'file',
    };
    return typeMap[ourType] || 'textfield';
  };

  const handleSave = async () => {
    if (!formMetadata.form_name.trim()) {
      alert('Please enter a form name');
      return;
    }

    if (formFields.length === 0) {
      alert('Please add at least one field to the form');
      return;
    }

    const formData = {
      id: singleData?.id || null,
      form_name: formMetadata.form_name,
      description: formMetadata.description,
      type: formMetadata.type,
      form_data: convertToFormIOFormat(formFields),
    };

    try {
      let response: any;
      if (mode === 'edit') {
        response = await dispatch(updateFormDataAPI(formData));
      } else {
        response = await dispatch(createFormDataAPI(formData));
      }

      if (response) {
        navigate('/forms');
      }
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  const handleCancel = () => {
    navigate('/forms');
    dispatch(slice.setSingleData({ form_data: [] }));
    dispatch(slice.setMode(''));
  };

  // Form Preview Component
  const FormPreview: React.FC = () => {
    const [formValues, setFormValues] = useState<{ [key: string]: any }>({});

    const handleFieldChange = (fieldId: string, value: any) => {
      setFormValues(prev => ({ ...prev, [fieldId]: value }));
    };

    const renderField = (field: FormField) => {
      const value = formValues[field.id] || '';

      switch (field.type) {
        case 'textfield':
        case 'email':
        case 'number':
          return (
            <TextField
              key={field.id}
              label={field.label}
              placeholder={field.placeholder}
              type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
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
                {field.options?.map((option, index) => (
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
                {field.options?.map((option, index) => (
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
                {field.options?.map((option, index) => (
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
      console.log('Form submitted with values:', formValues);
      alert('Form submitted! Check console for values.');
    };

    return (
      <Card elevation={2} sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
            {formMetadata.form_name || 'Untitled Form'}
          </Typography>

          {formMetadata.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {formMetadata.description}
            </Typography>
          )}

          {formFields.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No fields added to the form yet. Switch to edit mode to add fields.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              {formFields.map(renderField)}

              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" type="button">
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

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={handleCancel} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {mode === 'edit' ? 'Edit Form' : 'Create New Form'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>
            
            {dataUpdatingLoadding ? (
              <LoadingButton />
            ) : (
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save Form
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Form Metadata */}
      <Paper elevation={1} sx={{ p: 3, m: 2 }}>
        <Typography variant="h6" gutterBottom>
          Form Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Form Name"
              value={formMetadata.form_name}
              onChange={(e) => setFormMetadata({ ...formMetadata, form_name: e.target.value })}
              fullWidth
              required
              placeholder="Enter form name..."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Form Type"
              value={formMetadata.type}
              onChange={(e) => setFormMetadata({ ...formMetadata, type: e.target.value })}
              fullWidth
              placeholder="e.g., survey, feedback, assessment"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              value={formMetadata.description}
              onChange={(e) => setFormMetadata({ ...formMetadata, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="Describe the purpose of this form..."
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Form Builder */}
      <Box sx={{ flex: 1, p: 2 }}>
        {isPreviewMode ? (
          <Box sx={{
            height: '100%',
            overflow: 'auto',
            backgroundColor: '#f5f5f5',
            p: 3,
            borderRadius: 2
          }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>
              📋 Form Preview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              This is how your form will appear to users. You can interact with all fields to test functionality.
            </Typography>
            <FormPreview />
          </Box>
        ) : (
          <DragDropFormBuilder
            initialFields={formFields}
            onChange={setFormFields}
            onSave={handleSave}
          />
        )}
      </Box>
    </Box>
  );
};

export default ImprovedFormBuilder;
