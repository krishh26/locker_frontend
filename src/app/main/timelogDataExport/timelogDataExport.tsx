import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Box,
  Autocomplete,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDispatch, useSelector } from 'react-redux';
import { selectGlobalUser } from 'app/store/globalUser';
import { showMessage } from 'app/store/fuse/messageSlice';
import { useGetTimelogExportDataMutation } from 'app/store/api/timelog-export-api';
import { downloadCSV, formatDateForExcel } from 'src/utils/csvExport';
import axios from 'axios';
import jsonData from 'src/url.json';
import { useThemeColors, themeHelpers } from '../../utils/themeUtils';
import { styled } from '@mui/material/styles';

// Styled components for theme integration
const ThemedCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: themeHelpers.getShadow(theme, 1),
  transition: 'all 0.3s ease',
  
  '&:hover': {
    boxShadow: themeHelpers.getShadow(theme, 2),
  },
}));

const ThemedTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: 'all 0.2s ease',
    
    '&:hover': {
      backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.02),
    },
    
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${themeHelpers.withOpacity(theme.palette.primary.main, 0.1)}`,
    },
  },
  
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
  
  '& .MuiOutlinedInput-input': {
    color: theme.palette.text.primary,
  },
}));

const ThemedFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: 'all 0.2s ease',
    
    '&:hover': {
      backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.02),
    },
    
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${themeHelpers.withOpacity(theme.palette.primary.main, 0.1)}`,
    },
  },
  
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
  
  '& .MuiSelect-select': {
    color: theme.palette.text.primary,
  },
}));

const ThemedButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: themeHelpers.getShadow(theme, 2),
  },
}));

const ClearButton = styled(ThemedButton)(({ theme }) => ({
  backgroundColor: '#ff9800',
  color: 'white',
  
  '&:hover': {
    backgroundColor: '#f57c00',
  },
}));

const ExportButton = styled(ThemedButton)(({ theme }) => ({
  backgroundColor: '#e91e63',
  color: 'white',
  
  '&:hover': {
    backgroundColor: '#c2185b',
  },
}));

// Timelog data interface
interface TimelogExportData {
  id: number;
  activity_date: string;
  activity_type: string;
  unit: string;
  type: string;
  spend_time: string;
  start_time: string;
  end_time: string;
  impact_on_learner: string;
  evidence_link: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
  trainer_id: {
    user_id: number;
    user_name: string;
    email: string;
  };
  course_id: {
    course_id: number;
    course_name: string;
    course_code: string;
  };
}

// Helper function to escape CSV fields
const escapeCSVField = (field: string): string => {
  if (field === null || field === undefined) {
    return '';
  }
  
  const stringField = String(field);
  
  // If field contains comma, newline, or double quote, wrap in quotes and escape quotes
  if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  
  return stringField;
};

// Convert timelog data to CSV format
const convertTimelogToCSV = (data: TimelogExportData[]): string => {
  if (!data || data.length === 0) {
    return '';
  }

  // Define CSV headers
  const headers = [
    'ID',
    'Activity Date',
    'Activity Type',
    'Unit',
    'Type',
    'Spend Time',
    'Start Time',
    'End Time',
    'Impact on Learner',
    'Evidence Link',
    'Verified',
    'Trainer Name',
    'Trainer Email',
    'Course Name',
    'Course Code',
    'Created At',
    'Updated At'
  ];

  // Convert data to CSV rows
  const rows = data.map(item => [
    item.id.toString(),
    formatDateForExcel(item.activity_date),
    escapeCSVField(item.activity_type),
    escapeCSVField(item.unit),
    escapeCSVField(item.type),
    escapeCSVField(item.spend_time),
    escapeCSVField(item.start_time),
    escapeCSVField(item.end_time),
    escapeCSVField(item.impact_on_learner),
    escapeCSVField(item.evidence_link),
    item.verified ? 'Yes' : 'No',
    escapeCSVField(item.trainer_id?.user_name || ''),
    escapeCSVField(item.trainer_id?.email || ''),
    escapeCSVField(item.course_id?.course_name || ''),
    escapeCSVField(item.course_id?.course_code || ''),
    formatDateForExcel(item.created_at),
    formatDateForExcel(item.updated_at)
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  return csvContent;
};

// Main export function
const exportTimelogDataToCSV = (data: TimelogExportData[], filename?: string): boolean => {
  try {
    const csvContent = convertTimelogToCSV(data);
    
    if (!csvContent) {
      console.warn('No data to export');
      return false;
    }
    
    downloadCSV(csvContent, filename);
    return true;
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return false;
  }
};

interface FilterData {
  primaryAssessor: string;
  employer: string;
  course: string;
  curriculumManager: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  showOnlyOffTheJob: boolean;
}

const TimelogDataExport: React.FC = () => {
  const dispatch: any = useDispatch();
  const { currentUser } = useSelector(selectGlobalUser);
  const colors = useThemeColors();

  const [filters, setFilters] = useState<FilterData>({
    primaryAssessor: '',
    employer: '',
    course: '',
    curriculumManager: '',
    dateFrom: null,
    dateTo: null,
    showOnlyOffTheJob: false,
  });

  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // API data for dropdowns
  const [primaryAssessors, setPrimaryAssessors] = useState<Array<{ id: string; name: string }>>([]);
  const [employers, setEmployers] = useState<Array<{ id: string; name: string }>>([]);
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);

  const [curriculumManagers, setCurriculumManagers] = useState([
    { id: '1', name: 'Emma Davis' },
    { id: '2', name: 'Robert Brown' },
    { id: '3', name: 'Lisa Anderson' },
  ]);

  // API base URL
  const URL_BASE_LINK = jsonData.API_LOCAL_URL;

  // RTK Query mutation for fetching timelog export data
  const [getTimelogExportData, { isLoading: isTimelogLoading, error: timelogError }] = useGetTimelogExportDataMutation();

  // Fetch primary assessors (Admin role)
  const fetchPrimaryAssessors = async () => {
    try {
      const response = await axios.get(`${URL_BASE_LINK}/user/list?role=Admin`);
      const assessors = response.data.data.map((user: any) => ({
        id: user.user_id.toString(),
        name: user.user_name || `${user.first_name} ${user.last_name}`.trim()
      }));
      setPrimaryAssessors(assessors);
    } catch (error) {
      console.error('Error fetching primary assessors:', error);
      setPrimaryAssessors([]);
    }
  };

  // Fetch employers (Employer role)
  const fetchEmployers = async () => {
    try {
      const response = await axios.get(`${URL_BASE_LINK}/user/list?role=Employer`);
      const employerUsers = response.data.data.map((user: any) => ({
        id: user.user_id.toString(),
        name: user.employer.employer_name
      }));
      setEmployers(employerUsers);
    } catch (error) {
      console.error('Error fetching employers:', error);
      setEmployers([]);
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${URL_BASE_LINK}/course/list`);
      const courseList = response.data.data.map((course: any) => ({
        id: course.course_id.toString(),
        name: course.course_name
      }));
      setCourses(courseList);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        await Promise.all([
          fetchPrimaryAssessors(),
          fetchEmployers(),
          fetchCourses()
        ]);
      } catch (error) {
        console.error('Error loading dropdown data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);


  const handleFilterChange = (field: keyof FilterData, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleClearFilters = () => {
    setFilters({
      primaryAssessor: '',
      employer: '',
      course: '',
      curriculumManager: '',
      dateFrom: null,
      dateTo: null,
      showOnlyOffTheJob: false,
    });
    setError(null);
  };

  const handleExportToExcel = async () => {
    try {
      setExporting(true);
      setError(null);

      // Validate date range
      if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
        setError('Date "From" cannot be later than date "To"');
        return;
      }

      // Call the API mutation
      const result = await getTimelogExportData({
        trainer_id: filters.primaryAssessor || undefined,
        course_id: filters.course || undefined,
        date_from: filters.dateFrom?.toISOString().split('T')[0] || undefined,
        date_to: filters.dateTo?.toISOString().split('T')[0] || undefined,
        type: filters.showOnlyOffTheJob ? 'Off the job' : undefined,
      });

      if ('data' in result && result.data && result.data.data && result.data.data.length > 0) {
        // Export the data to CSV
        const timelogData = result.data.data;
        const success = exportTimelogDataToCSV(
          timelogData, 
          `timelog-export-${new Date().toISOString().split('T')[0]}.csv`
        );
        
        if (success) {
          dispatch(showMessage({
            message: 'Timelog data exported successfully!',
            variant: 'success'
          }));
        } else {
          setError('Failed to export data. Please try again.');
        }
      } else if ('error' in result) {
        setError('Failed to fetch data. Please try again.');
      } else {
        setError('No data found for the selected filters.');
      }
    } catch (err) {
      console.error('Export error:', err);
      setError('An error occurred while exporting data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3} sx={{ p: 3, minHeight: '100vh' }}>
        {/* Header */}
        <Grid item xs={12}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600, 
              color: colors.text.primary,
              mb: 1
            }}
          >
            Timelog Data Export
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: colors.text.secondary,
              mb: 3
            }}
          >
            Filter and export timelog data to Excel format
          </Typography>
        </Grid>

        {/* Error Alert */}
        {error && (
          <Grid item xs={12}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Grid>
        )}

        {/* Filter Section */}
        <Grid item xs={12}>
          <ThemedCard>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  color: colors.text.primary
                }}
              >
                Filter Options
              </Typography>

              <Grid container spacing={3}>
                {/* First Row - Dropdown Filters */}
                <Grid item xs={12} sm={6} md={3}>
                  <Autocomplete
                    options={primaryAssessors}
                    getOptionLabel={(option) => option.name}
                    value={primaryAssessors.find(a => a.id === filters.primaryAssessor) || null}
                    onChange={(_, value) => handleFilterChange('primaryAssessor', value?.id || '')}
                    loading={loadingData}
                    renderInput={(params) => (
                      <ThemedTextField
                        {...params}
                        label="By Admin"
                        placeholder={loadingData ? "Loading..." : "Please Select"}
                        size="small"
                        fullWidth
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingData ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Autocomplete
                    options={employers}
                    getOptionLabel={(option) => option.name}
                    value={employers.find(e => e.id === filters.employer) || null}
                    onChange={(_, value) => handleFilterChange('employer', value?.id || '')}
                    loading={loadingData}
                    renderInput={(params) => (
                      <ThemedTextField
                        {...params}
                        label="By Employer"
                        placeholder={loadingData ? "Loading..." : "Please Select"}
                        size="small"
                        fullWidth
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingData ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Autocomplete
                    options={courses}
                    getOptionLabel={(option) => option.name}
                    value={courses.find(c => c.id === filters.course) || null}
                    onChange={(_, value) => handleFilterChange('course', value?.id || '')}
                    loading={loadingData}
                    renderInput={(params) => (
                      <ThemedTextField
                        {...params}
                        label="By Course"
                        placeholder={loadingData ? "Loading..." : "Please Select"}
                        size="small"
                        fullWidth
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingData ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Autocomplete
                    options={curriculumManagers}
                    getOptionLabel={(option) => option.name}
                    value={curriculumManagers.find(cm => cm.id === filters.curriculumManager) || null}
                    onChange={(_, value) => handleFilterChange('curriculumManager', value?.id || '')}
                    renderInput={(params) => (
                      <ThemedTextField
                        {...params}
                        label="By Curriculum Manager"
                        placeholder="Please Select"
                        size="small"
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                {/* Second Row - Date Range and Checkbox */}
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Date Range From"
                    value={filters.dateFrom}
                    onChange={(date) => handleFilterChange('dateFrom', date)}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        placeholder: "choose date",
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'background.paper',
                            borderRadius: 1.5,
                            transition: 'all 0.2s ease',
                          },
                          '& .MuiInputLabel-root': {
                            color: 'text.secondary',
                            fontWeight: 500,
                          },
                          '& .MuiOutlinedInput-input': {
                            color: 'text.primary',
                          },
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Date Range To"
                    value={filters.dateTo}
                    onChange={(date) => handleFilterChange('dateTo', date)}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        placeholder: "choose date",
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'background.paper',
                            borderRadius: 1.5,
                            transition: 'all 0.2s ease',
                          },
                          '& .MuiInputLabel-root': {
                            color: 'text.secondary',
                            fontWeight: 500,
                          },
                          '& .MuiOutlinedInput-input': {
                            color: 'text.primary',
                          },
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.showOnlyOffTheJob}
                        onChange={(e) => handleFilterChange('showOnlyOffTheJob', e.target.checked)}
                        sx={{
                          color: colors.primary.main,
                          '&.Mui-checked': {
                            color: colors.primary.main,
                          },
                        }}
                      />
                    }
                    label="Show only Off the Job Records"
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        color: colors.text.primary,
                        fontWeight: 500,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </ThemedCard>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
            <ClearButton
              variant="contained"
              onClick={handleClearFilters}
              disabled={exporting || isTimelogLoading}
            >
              Clear
            </ClearButton>
            
            <ExportButton
              variant="contained"
              onClick={handleExportToExcel}
              disabled={exporting || isTimelogLoading}
              startIcon={(exporting || isTimelogLoading) ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {(exporting || isTimelogLoading) ? 'Exporting...' : 'Export to Excel'}
            </ExportButton>
          </Box>
        </Grid>

        {/* Info Section */}
        <Grid item xs={12}>
          <ThemedCard>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  color: colors.text.primary
                }}
              >
                Export Information
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: colors.text.secondary,
                  lineHeight: 1.6
                }}
              >
                • Use the filters above to narrow down the timelog data you want to export<br/>
                • The exported Excel file will include all timelog entries matching your selected criteria<br/>
                • Date range filters will include entries from the start of "From" date to the end of "To" date<br/>
                • "Show only Off the Job Records" will filter to include only off-the-job training activities<br/>
                • If no filters are selected, all available timelog data will be exported
              </Typography>
            </CardContent>
          </ThemedCard>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default TimelogDataExport;
