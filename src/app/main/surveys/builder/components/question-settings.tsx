import React, { useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
  FormControlLabel,
  Switch,
  IconButton,
  Typography,
} from '@mui/material';
import { Plus, Trash2 } from 'lucide-react';
import {
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  type Question,
} from 'app/store/api/survey-api';

const questionFormSchema = yup.object().shape({
  title: yup.string().required('Title is required.'),
  description: yup.string().optional(),
  type: yup
    .string()
    .oneOf(['short-text', 'long-text', 'multiple-choice', 'checkbox', 'rating', 'date'], 'Invalid question type')
    .required('Question type is required'),
  required: yup.boolean().required(),
  options: yup
    .array(
      yup.object().shape({
        value: yup.string().required('Option value is required'),
      })
    )
    .optional()
    .test('options-required', 'At least one option is required for this question type.', function (value) {
      const { type } = this.parent;
      if (type === 'multiple-choice' || type === 'checkbox') {
        return value !== undefined && value !== null && Array.isArray(value) && value.length > 0;
      }
      return true;
    }),
});

type QuestionFormValues = yup.InferType<typeof questionFormSchema>;

interface QuestionSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyId: string;
  question?: Question | null;
}

const QuestionSettings: React.FC<QuestionSettingsProps> = ({
  open,
  onOpenChange,
  surveyId,
  question,
}) => {
  const [createQuestion, { isLoading: isCreating }] = useCreateQuestionMutation();
  const [updateQuestion, { isLoading: isUpdating }] = useUpdateQuestionMutation();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: yupResolver(questionFormSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'short-text',
      required: false,
      options: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const questionType = watch('type');
  const showOptions = questionType === 'multiple-choice' || questionType === 'checkbox';

  useEffect(() => {
    if (question) {
      reset({
        title: question.title,
        description: question.description || '',
        type: question.type,
        required: question.required,
        options: question.options?.map((opt) => ({ value: opt })) || [],
      });
    } else {
      reset({
        title: '',
        description: '',
        type: 'short-text',
        required: false,
        options: [],
      });
    }
  }, [question, reset]);

  useEffect(() => {
    if (showOptions && fields.length === 0) {
      append({ value: '' });
    }
  }, [showOptions, fields.length, append]);

  const onSubmit = async (data: QuestionFormValues) => {
    const questionData = {
      title: data.title,
      description: data.description,
      type: data.type,
      required: data.required,
      options:
        showOptions && data.options
          ? data.options.map((opt) => opt.value).filter((v) => v.trim())
          : null,
    };

    try {
      if (question) {
        await updateQuestion({
          surveyId,
          questionId: question.id,
          updates: questionData,
        }).unwrap();
        // You can add a toast notification here if you have a toast system
      } else {
        await createQuestion({
          surveyId,
          question: questionData,
        }).unwrap();
        // You can add a toast notification here if you have a toast system
      }
      reset();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error('Failed to save question:', error);
      // You can add error toast notification here
    }
  };

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{question ? 'Edit Question' : 'Add Question'}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            {question ? 'Update the question details.' : 'Create a new question for your survey.'}
          </DialogContentText>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Title"
                  placeholder="Enter question title"
                  error={!!errors.title}
                  helperText={errors.title?.message}
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
                  placeholder="Enter question description (optional)"
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  fullWidth
                  multiline
                  rows={2}
                />
              )}
            />
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>Question Type</InputLabel>
                  <Select {...field} label="Question Type">
                    <MenuItem value="short-text">Short Text</MenuItem>
                    <MenuItem value="long-text">Long Text</MenuItem>
                    <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
                    <MenuItem value="checkbox">Checkbox</MenuItem>
                    <MenuItem value="rating">Rating (1-5)</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                  </Select>
                  {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
                </FormControl>
              )}
            />

            {showOptions && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2">Options</Typography>
                  <Button
                    size="small"
                    startIcon={<Plus size={16} />}
                    onClick={() => append({ value: '' })}
                  >
                    Add Option
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {fields.map((field, index) => (
                    <Box key={field.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <Controller
                        name={`options.${index}.value`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            placeholder={`Option ${index + 1}`}
                            size="small"
                            fullWidth
                            error={!!errors.options?.[index]?.value}
                            helperText={errors.options?.[index]?.value?.message}
                          />
                        )}
                      />
                      {fields.length > 1 && (
                        <IconButton size="small" onClick={() => remove(index)} color="error">
                          <Trash2 size={18} />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Box>
                {errors.options && typeof errors.options.message === 'string' && (
                  <FormHelperText error>{errors.options.message}</FormHelperText>
                )}
              </Box>
            )}

            <Controller
              name="required"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={field.onChange} />}
                  label="Required"
                />
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
              ? (question ? 'Updating...' : 'Creating...')
              : (question ? 'Update Question' : 'Add Question')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default QuestionSettings;

