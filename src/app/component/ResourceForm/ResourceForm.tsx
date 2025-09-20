import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Typography,
  FormHelperText,
  CircularProgress,
  Paper,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FileUploader } from 'react-drag-drop-files';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';

import { themeHelpers } from 'src/app/utils/themeUtils';

import type { AddResourcePayload, UpdateResourcePayload, WellbeingResource } from 'app/store/api/resourcesApi';

// Theme-aware styled components
const ThemedPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: themeHelpers.getShadow(theme, 2),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: themeHelpers.getShadow(theme, 4),
  },
}));

const ThemedTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiFormHelperText-root': {
    color: theme.palette.text.secondary,
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
}));

const ThemedFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiFormHelperText-root': {
    color: theme.palette.text.secondary,
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
}));

const ThemedButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: themeHelpers.getShadow(theme, 3),
  },
}));

const ThemedFileUploadArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-2px)',
    boxShadow: themeHelpers.getShadow(theme, 2),
  },
  '&.error': {
    borderColor: theme.palette.error.main,
    backgroundColor: theme.palette.error.light + '20',
  },
}));

const ThemedTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

const ThemedFormHelperText = styled(FormHelperText)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&.Mui-error': {
    color: theme.palette.error.main,
  },
}));

// File types allowed for upload
const fileTypes = [
  'JPG',
  'PNG',
  'GIF',
  'PDF',
  'DOCX',
  'XLSX',
  'PPTX',
  'TXT',
  'ZIP',
  'MP4',
  'MP3',
  'AVI',
  'MOV',
];

// Form validation schema
const createValidationSchema = (isEdit: boolean) => {
  return yup.object().shape({
    resource_name: yup.string().required('Resource name is required'),
    resourceType: yup.string().oneOf(['FILE', 'URL'], 'Resource type is required').required('Resource type is required'),
    location: yup.string().when('resourceType', {
      is: 'URL',
      then: (schema) => schema.required('URL is required').url('Please enter a valid URL'),
      otherwise: (schema) => schema.required('File is required'),
    }),
    description: yup.string().optional(),
    isActive: yup.boolean().default(true),
  });
};

export interface ResourceFormData {
  resource_name: string;
  resourceType: 'FILE' | 'URL';
  location: string | File;
  description: string;
  isActive: boolean;
}

export interface ResourceFormProps {
  mode: 'add' | 'edit';
  initialData?: WellbeingResource;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ResourceForm: React.FC<ResourceFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUploadError, setFileUploadError] = useState<string>('');

  const isEdit = mode === 'edit';

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ResourceFormData>({
    resolver: yupResolver(createValidationSchema(isEdit)),
    defaultValues: {
      resource_name: initialData?.resource_name || '',
      resourceType: initialData?.content?.startsWith('http') ? 'URL' : 'FILE',
      location: initialData?.content || '',
      description: initialData?.description || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  const watchedResourceType = watch('resourceType');

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && isEdit) {
      reset({
        resource_name: initialData.resource_name,
        resourceType: initialData.content?.startsWith('http') ? 'URL' : 'FILE',
        location: initialData.content,
        description: initialData.description,
        isActive: initialData.isActive,
      });
    }
  }, [initialData, isEdit, reset]);

  const handleFileChange = (file: File) => {
    setUploadedFile(file);
    setFileUploadError('');
    setValue('location', file);
  };

  const handleFormSubmit = async (data: ResourceFormData) => {
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Add name
      formData.append('name', data.resource_name);
      
      // Add resourceType
      formData.append('resourceType', data.resourceType);
      
      // Add file or URL
      if (data.resourceType === 'FILE') {
        if (!uploadedFile && !initialData) {
          setFileUploadError('Please upload a file');
          return;
        }
        
        if (uploadedFile) {
          // Append the actual file to FormData
          formData.append('file', uploadedFile);
        } else if (initialData && isEdit) {
          // For edit mode, if no new file is uploaded, we might need to handle existing file
          // This depends on your backend implementation
          formData.append('file', 'existing');
        }
      } else {
        // For URL type, append the URL as a string
        formData.append('url', data.location as string);
      }
      
      // Add description
      formData.append('description', data.description || '');
      
      // Add additional fields if needed
      if (isEdit) {
        formData.append('isActive', data.isActive.toString());
      }

      // Log FormData contents for debugging
      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      })

      // Pass FormData to the onSubmit function
      await onSubmit(formData as any);
    } catch (error) {
      console.error('Form submission error:', error);
      enqueueSnackbar('Failed to save resource', { variant: 'error' });
    }
  };

  return (
    <ThemedPaper elevation={2} sx={{ p: 4, width: 800, mx: 'auto' }}>
      <ThemedTypography variant="h5" gutterBottom>
        {isEdit ? 'Edit Resource' : 'Add New Resource'}
      </ThemedTypography>

      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 3 }}>
        {/* Resource Name */}
        <Controller
          name="resource_name"
          control={control}
          render={({ field }) => (
            <ThemedTextField
              {...field}
              fullWidth
              label="Resource Name"
              error={!!errors.resource_name}
              helperText={errors.resource_name?.message}
              margin="normal"
              required
            />
          )}
        />

        {/* Resource Type */}
        <Controller
          name="resourceType"
          control={control}
          render={({ field }) => (
            <ThemedFormControl fullWidth margin="normal" error={!!errors.resourceType}>
              <InputLabel>Resource Type</InputLabel>
              <Select {...field} label="Resource Type">
                <MenuItem value="FILE">File Upload</MenuItem>
                <MenuItem value="URL">URL Link</MenuItem>
              </Select>
              {errors.resourceType && (
                <ThemedFormHelperText>{errors.resourceType.message}</ThemedFormHelperText>
              )}
            </ThemedFormControl>
          )}
        />

        {/* File Upload or URL Input */}
        {watchedResourceType === 'FILE' ? (
          <Box sx={{ mt: 2 }}>
            <ThemedTypography variant="subtitle2" gutterBottom>
              Upload File
            </ThemedTypography>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <FileUploader
                  handleChange={handleFileChange}
                  name="file"
                  types={fileTypes}
                  multiple={false}
                  maxSize={10}
                >
                  <ThemedFileUploadArea
                    className={fileUploadError ? 'error' : ''}
                  >
                    {uploadedFile ? (
                      <Box>
                        <ThemedTypography variant="body1" color="primary">
                          {uploadedFile.name}
                        </ThemedTypography>
                        <ThemedTypography variant="body2" color="text.secondary">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </ThemedTypography>
                      </Box>
                    ) : initialData && isEdit ? (
                      <Box>
                        <ThemedTypography variant="body1" color="text.secondary">
                          Current file: {initialData.content}
                        </ThemedTypography>
                        <ThemedTypography variant="body2" color="text.secondary">
                          Upload a new file to replace
                        </ThemedTypography>
                      </Box>
                    ) : (
                      <Box>
                        <ThemedTypography variant="body1" gutterBottom>
                          Drag and drop your file here or{' '}
                          <ThemedTypography color="primary" sx={{ textDecoration: 'underline' }}>
                            Browse
                          </ThemedTypography>
                        </ThemedTypography>
                        <ThemedTypography variant="body2" color="text.secondary">
                          Max 10MB files are allowed
                        </ThemedTypography>
                        <ThemedTypography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          Supported formats: {fileTypes.join(', ')}
                        </ThemedTypography>
                      </Box>
                    )}
                  </ThemedFileUploadArea>
                </FileUploader>
              )}
            />
            {fileUploadError && (
              <ThemedFormHelperText error sx={{ mt: 1 }}>
                {fileUploadError}
              </ThemedFormHelperText>
            )}
            {errors.location && (
              <ThemedFormHelperText error sx={{ mt: 1 }}>
                {errors.location.message}
              </ThemedFormHelperText>
            )}
          </Box>
        ) : (
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <ThemedTextField
                {...field}
                fullWidth
                label="Resource URL"
                type="url"
                error={!!errors.location}
                helperText={errors.location?.message || 'Enter the URL where the resource can be accessed'}
                margin="normal"
                required
              />
            )}
          />
        )}

        {/* Description */}
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <ThemedTextField
              {...field}
              fullWidth
              label="Description"
              multiline
              rows={4}
              error={!!errors.description}
              helperText={errors.description?.message}
              margin="normal"
            />
          )}
        />

        {/* Active Status (only for edit mode) */}
        {isEdit && (
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label="Active"
                sx={{ mt: 2 }}
              />
            )}
          />
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
          <ThemedButton
            variant="outlined"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </ThemedButton>
          <ThemedButton
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Saving...' : isEdit ? 'Update Resource' : 'Add Resource'}
          </ThemedButton>
        </Box>
      </Box>
    </ThemedPaper>
  );
};

export default ResourceForm;
