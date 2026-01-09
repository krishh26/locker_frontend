import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Box,
} from '@mui/material';
import { useCreateSurveyMutation, useUpdateSurveyMutation, type Survey } from 'app/store/api/survey-api';

const surveyFormSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters.'),
  description: yup.string().optional(),
  status: yup.string().oneOf(['Draft', 'Published'], 'Invalid status').required('Status is required'),
});

type SurveyFormValues = yup.InferType<typeof surveyFormSchema>;

interface SurveyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  survey?: Survey | null;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ open, onOpenChange, survey }) => {
  const [createSurvey, { isLoading: isCreating }] = useCreateSurveyMutation();
  const [updateSurvey, { isLoading: isUpdating }] = useUpdateSurveyMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SurveyFormValues>({
    resolver: yupResolver(surveyFormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldUnregister: false,
    defaultValues: {
      name: '',
      description: '',
      status: 'Draft',
    },
  });

  useEffect(() => {
    if (survey) {
      reset({
        name: survey.name,
        description: survey.description || '',
        status: survey.status === 'Archived' ? 'Draft' : survey.status,
      }, { keepErrors: false });
    } else {
      reset({
        name: '',
        description: '',
        status: 'Draft',
      }, { keepErrors: false });
    }
  }, [survey, reset, open]);

  const onSubmit = async (data: SurveyFormValues) => {
    try {
      if (survey) {
        await updateSurvey({
          surveyId: survey.id,
          updates: {
            name: data.name,
            description: data.description,
            status: data.status as 'Draft' | 'Published',
          },
        }).unwrap();
        // You can add a toast notification here if you have a toast system
      } else {
        await createSurvey({
          name: data.name,
          description: data.description,
          status: data.status as 'Draft' | 'Published',
        }).unwrap();
        // You can add a toast notification here if you have a toast system
      }
      reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to save survey:', error);
      // You can add error toast notification here
    }
  };

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{survey ? 'Edit Survey' : 'Create Survey'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            {survey
              ? "Update the survey details. Click save when you're done."
              : "Create a new survey form. Click save when you're done."}
          </DialogContentText>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Name"
                  placeholder="Enter survey name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  placeholder="Enter survey description (optional)"
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel>Status</InputLabel>
                  <Select {...field} label="Status">
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Published">Published</MenuItem>
                  </Select>
                  {errors.status && (
                    <FormHelperText>{errors.status.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating
              ? (survey ? 'Updating...' : 'Creating...')
              : (survey ? 'Update Survey' : 'Create Survey')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SurveyForm;
