import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Alert,
} from '@mui/material';
import { CheckCircle2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectSurveyById, selectQuestionsBySurveyId } from 'app/store/surveySlice';
import { addResponse } from 'app/store/responseSlice';

const SurveyForm = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const dispatch = useDispatch();
  const survey = useSelector((state: any) => (surveyId ? selectSurveyById(state, surveyId) : null));
  const questions = useSelector((state: any) =>
    surveyId ? selectQuestionsBySurveyId(state, surveyId) : []
  );
  const [submitted, setSubmitted] = useState(false);

  const sortedQuestions = [...questions].sort((a: any, b: any) => a.order - b.order);

  // Build dynamic Yup schema
  const schemaFields: Record<string, yup.Schema<any>> = {};
  const defaultValues: Record<string, any> = {};

  sortedQuestions.forEach((question: any) => {
    if (question.type === 'checkbox') {
      if (question.required) {
        schemaFields[question.id] = yup
          .array()
          .of(yup.string())
          .min(1, 'At least one option must be selected')
          .required('At least one option must be selected');
      } else {
        schemaFields[question.id] = yup.array().of(yup.string()).optional();
      }
      defaultValues[question.id] = [];
    } else if (question.type === 'date') {
      if (question.required) {
        schemaFields[question.id] = yup
          .string()
          .required('Please select a date')
          .test('not-empty', 'Please select a date', (value) => {
            return value !== undefined && value !== null && value.trim().length > 0;
          });
      } else {
        schemaFields[question.id] = yup.string().optional();
      }
      defaultValues[question.id] = '';
    } else {
      if (question.required) {
        schemaFields[question.id] = yup
          .string()
          .required('This field is required')
          .test('not-empty', 'This field is required', (value) => {
            return value !== undefined && value !== null && value.trim().length > 0;
          });
      } else {
        schemaFields[question.id] = yup.string().optional();
      }
      defaultValues[question.id] = '';
    }
  });

  const formSchema = yup.object().shape(schemaFields);
  type FormValues = yup.InferType<typeof formSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(formSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues,
  });

  if (!survey) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Paper sx={{ p: 4, maxWidth: 500 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
            Survey Not Found
          </Typography>
          <Typography color="text.secondary">
            The survey you're looking for doesn't exist.
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (survey.status !== 'Published') {
    const backgroundStyle = survey.background
      ? survey.background.type === 'gradient'
        ? { background: survey.background.value }
        : {
            backgroundImage: `url(${survey.background.value})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }
      : {};

    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          ...backgroundStyle,
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 500, bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
            Survey Not Available
          </Typography>
          <Typography color="text.secondary">
            This survey is not currently available for responses.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const onSubmit = (data: FormValues) => {
    const answers: Record<string, string | string[] | null> = {};

    sortedQuestions.forEach((question: any) => {
      const value = data[question.id];
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length === 0) {
          answers[question.id] = null;
        } else {
          answers[question.id] = value as string | string[];
        }
      } else {
        answers[question.id] = null;
      }
    });

    dispatch(
      addResponse({
        surveyId: survey.id,
        answers,
      }) as any
    );

    setSubmitted(true);
  };


  const backgroundStyle = survey.background
    ? survey.background.type === 'gradient'
      ? { background: survey.background.value }
      : {
          backgroundImage: `url(${survey.background.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
    : { bgcolor: 'grey.100' };

  if (submitted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          ...backgroundStyle,
        }}
      >
        <Paper
          sx={{
            p: 6,
            maxWidth: 500,
            textAlign: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <CheckCircle2 size={64} style={{ color: '#4caf50', margin: '0 auto 16px' }} />
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Thank You!
          </Typography>
          <Typography color="text.secondary">
            Your response has been recorded successfully.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const renderQuestionField = (question: any) => {
    const error = errors[question.id];

    switch (question.type) {
      case 'short-text':
        return (
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder="Your answer"
                fullWidth
                size="small"
                error={!!error}
                helperText={error?.message as string}
              />
            )}
          />
        );
      case 'long-text':
        return (
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder="Your answer"
                fullWidth
                multiline
                rows={4}
                error={!!error}
                helperText={error?.message as string}
              />
            )}
          />
        );
      case 'multiple-choice':
        return (
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => (
              <FormControl error={!!error}>
                <RadioGroup {...field}>
                  {question.options?.map((option: string) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
                {error && <FormHelperText>{error.message as string}</FormHelperText>}
              </FormControl>
            )}
          />
        );
      case 'checkbox':
        return (
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => (
              <FormControl error={!!error}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {question.options?.map((option: string) => (
                    <FormControlLabel
                      key={option}
                      control={
                        <Checkbox
                          checked={(field.value as string[])?.includes(option) || false}
                          onChange={(e) => {
                            const currentValue = (field.value as string[]) || [];
                            const newValue = e.target.checked
                              ? [...currentValue, option]
                              : currentValue.filter((v) => v !== option);
                            field.onChange(newValue);
                          }}
                        />
                      }
                      label={option}
                    />
                  ))}
                </Box>
                {error && <FormHelperText>{error.message as string}</FormHelperText>}
              </FormControl>
            )}
          />
        );
      case 'rating':
        return (
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => (
              <FormControl error={!!error}>
                <RadioGroup {...field} row>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <FormControlLabel
                      key={rating}
                      value={String(rating)}
                      control={<Radio />}
                      label={String(rating)}
                    />
                  ))}
                </RadioGroup>
                {error && <FormHelperText>{error.message as string}</FormHelperText>}
              </FormControl>
            )}
          />
        );
      case 'date':
        return (
          <Controller
            name={question.id}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                error={!!error}
                helperText={error?.message as string}
              />
            )}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', p: 4, py: 8, ...backgroundStyle }}>
      <Box sx={{ mx: 'auto', maxWidth: 800 }}>
        <Paper
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            p: 4,
          }}
        >
          {/* Survey Header */}
          <Box sx={{ mb: 4, pb: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              {survey.name}
            </Typography>
            {survey.description && (
              <Typography variant="body2" color="text.secondary">
                {survey.description}
              </Typography>
            )}
          </Box>

          {/* Validation Error Alert */}
          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Please fill in all required fields before submitting.
            </Alert>
          )}

          {/* Questions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {sortedQuestions.map((question: any, index: number) => (
              <Box key={question.id}>
                <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
                  {index + 1}. {question.title}
                  {question.required && (
                    <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                      *
                    </Typography>
                  )}
                </Typography>
                {question.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {question.description}
                  </Typography>
                )}
                {renderQuestionField(question)}
              </Box>
            ))}
          </Box>

          {/* Submit Button */}
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Button type="submit" variant="contained" fullWidth size="large">
              Submit
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default SurveyForm;

