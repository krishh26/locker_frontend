import React from 'react';
import { Box, Typography } from '@mui/material';
import { ClipboardList } from 'lucide-react';
import SurveysDataTable from './components/surveys-data-table';

const Surveys = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <ClipboardList size={32} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Surveys
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage survey forms
          </Typography>
        </Box>
      </Box>
      <SurveysDataTable />
    </Box>
  );
};

export default Surveys;

