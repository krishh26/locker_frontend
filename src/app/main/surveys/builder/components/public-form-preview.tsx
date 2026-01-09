import React from 'react';
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
  Divider,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { selectSurveyById, selectQuestionsBySurveyId } from 'app/store/surveySlice';

interface PublicFormPreviewProps {
  surveyId: string;
}

const PublicFormPreview: React.FC<PublicFormPreviewProps> = ({ surveyId }) => {
  const survey = useSelector((state: any) => selectSurveyById(state, surveyId));
  const questions = useSelector((state: any) => selectQuestionsBySurveyId(state, surveyId));

  if (!survey) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Survey not found</Typography>
      </Box>
    );
  }

  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);

  // Handle both nested background object and flat backgroundType/backgroundValue structure
  const backgroundType = survey.background?.type || survey.backgroundType;
  const backgroundValue = survey.background?.value || survey.backgroundValue;
  
  const backgroundStyle = backgroundType && backgroundValue
    ? backgroundType === 'gradient'
      ? { background: backgroundValue }
      : {
          backgroundImage: `url(${backgroundValue})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
    : { bgcolor: 'grey.100' };

  const renderQuestionField = (question: any) => {
    switch (question.type) {
      case 'short-text':
        return <TextField placeholder="Your answer" disabled fullWidth size="small" />;
      case 'long-text':
        return <TextField placeholder="Your answer" disabled fullWidth multiline rows={4} />;
      case 'multiple-choice':
        return (
          <RadioGroup>
            {question.options?.map((option: string) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio disabled />}
                label={option}
                disabled
              />
            ))}
          </RadioGroup>
        );
      case 'checkbox':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {question.options?.map((option: string) => (
              <FormControlLabel
                key={option}
                control={<Checkbox disabled />}
                label={option}
                disabled
              />
            ))}
          </Box>
        );
      case 'rating':
        return (
          <RadioGroup row>
            {[1, 2, 3, 4, 5].map((rating) => (
              <FormControlLabel
                key={rating}
                value={String(rating)}
                control={<Radio disabled />}
                label={String(rating)}
                disabled
              />
            ))}
          </RadioGroup>
        );
      case 'date':
        return <TextField type="date" disabled fullWidth size="small" InputLabelProps={{ shrink: true }} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', p: 4, py: 8, ...backgroundStyle }}>
      <Box sx={{ mx: 'auto', maxWidth: 800 }}>
        <Paper
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

          {/* Questions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {sortedQuestions.map((question, index) => (
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
          {sortedQuestions.length > 0 && (
            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Button variant="contained" fullWidth disabled>
                Submit
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default PublicFormPreview;

