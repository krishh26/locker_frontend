import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { addSurvey, updateSurvey, type Survey } from 'app/store/surveySlice';

const surveyFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  status: z.enum(['Draft', 'Published']),
});

type SurveyFormValues = z.infer<typeof surveyFormSchema>;

interface SurveyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  survey?: Survey | null;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ open, onOpenChange, survey }) => {
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
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
      });
    } else {
      reset({
        name: '',
        description: '',
        status: 'Draft',
      });
    }
  }, [survey, reset]);

  const onSubmit = (data: SurveyFormValues) => {
    if (survey) {
      dispatch(
        updateSurvey({
          id: survey.id,
          updates: {
            name: data.name,
            description: data.description,
            status: data.status,
          },
        }) as any
      );
    } else {
      dispatch(
        addSurvey({
          name: data.name,
          description: data.description,
          status: data.status,
        }) as any
      );
    }
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{survey ? 'Edit Survey' : 'Create Survey'}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {survey
            ? 'Update the survey details. Click save when youre done.'
            : "Create a new survey form. Click save when youre done."}
        </Typography>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
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
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
                fullWidth
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
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.status.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onOpenChange(false)} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={!isValid}>
          {survey ? 'Update Survey' : 'Create Survey'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SurveyForm;

