import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useGetSurveyByIdQuery } from 'app/store/api/survey-api';
import ResponsesTable from './components/responses-table';

const Responses = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  
  // Fetch survey from API
  const { data: surveyResponse, isLoading: isLoadingSurvey } = useGetSurveyByIdQuery(
    surveyId || '',
    { skip: !surveyId, refetchOnMountOrArgChange: true }
  );
  const survey = surveyResponse?.data?.survey;

  if (!surveyId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Survey ID not provided</Typography>
      </Box>
    );
  }

  if (isLoadingSurvey) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">Loading survey...</Typography>
      </Box>
    );
  }

  if (!survey) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate('/surveys')}>
            <ArrowLeft size={20} />
          </IconButton>
          <Typography variant="h5">Survey Not Found</Typography>
        </Box>
        <Typography color="text.secondary">The survey you're looking for doesn't exist</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/surveys')}>
          <ArrowLeft size={20} />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            {survey.name} - Responses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage survey responses
          </Typography>
        </Box>
      </Box>

      {/* Responses Table */}
      <ResponsesTable surveyId={surveyId} />
    </Box>
  );
};

export default Responses;

