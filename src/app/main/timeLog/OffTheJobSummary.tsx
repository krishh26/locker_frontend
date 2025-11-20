import { 
  Card, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  Tooltip,
  Box,
  Divider,
  Alert,
  Chip
} from '@mui/material';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { selectGlobalUser } from 'app/store/globalUser';
import FuseLoading from '@fuse/core/FuseLoading';
import { getOtjSummary, selectTimeLog } from 'app/store/timeLog';
import { alpha, useTheme } from '@mui/material/styles';

interface OffTheJobSummaryProps {
  courseId?: string | number | null;
}

interface ApiResponse {
  durationWeeks?: number;
  otjRequired?: number;
  requiredToDate?: number;
  totalLoggedHours?: number;
  hoursThisWeek?: number;
  hoursThisMonth?: number;
  warnings?: string[];
  courseSummaries?: Array<{
    course_id: number;
    course_name: string;
    course_type?: string;
    status?: string;
    offTheJobHours?: number;
    offTheJobMinutes?: number;
  }>;
}

const OffTheJobSummary = ({ courseId = null }: OffTheJobSummaryProps) => {
  const dispatch: any = useDispatch();
  const theme = useTheme();
  const { currentUser, selectedUser, selected } = useSelector(selectGlobalUser);
  const timeLog = useSelector(selectTimeLog);
  const summaryData: ApiResponse | null = timeLog?.otjSummaryData || null;
  const loading = timeLog?.otjSummaryLoading || false;

  // Fetch OTJ summary data
  useEffect(() => {
    const learnerId = selected ? selectedUser?.learner_id : currentUser?.learner_id;
    
    if (learnerId) {
      dispatch(getOtjSummary(learnerId, courseId, true));
    }
  }, [dispatch, selectedUser, currentUser, selected, courseId]);

  // Format minutes to hours:minutes string
  const formatMinutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  // Format hours to hours:minutes string
  const formatHoursToTime = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <FuseLoading />;
  }

  if (!summaryData) {
    return null;
  }

  // Format duration weeks (round to 2 decimal places)
  const formattedDuration = summaryData.durationWeeks 
    ? (Math.round(summaryData.durationWeeks * 100) / 100).toFixed(0)
    : '0';

  // Calculate percentage if we have required to date
  const actualPercentage = summaryData.requiredToDate && summaryData.requiredToDate > 0 && summaryData.totalLoggedHours !== undefined
    ? (Math.round((summaryData.totalLoggedHours / summaryData.requiredToDate) * 100 * 100) / 100).toFixed(2)
    : null;

  return (
    <Box className="w-full mb-20">
      {/* Header Card */}
      <Card 
        sx={{ 
          borderRadius: '8px 8px 0 0',
          border: '1px solid #ddd',
          borderBottom: 'none',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.light, 0.04)} 100%)`,
        }}
      >
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography className="h3 font-600" sx={{ color: theme.palette.text.primary, fontSize: '1.583rem' }}>
            Off the Job Summary
          </Typography>
        </Box>
      </Card>

      {/* Main Content Card */}
      <Card sx={{ borderRadius: '0 0 8px 8px', border: '1px solid #ddd', borderTop: 'none' }}>
        <Box sx={{ p: 3 }}>
          {/* Summary Section - Grid Layout */}
          <Box sx={{ mb: 4 }}>
            <Typography className="h4 font-600" sx={{ mb: 2.5, color: theme.palette.text.primary, fontSize: '1.333rem' }}>
              Summary
            </Typography>
            <Grid container spacing={2.5}>
              {/* Duration Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    p: 2,
                    height: '100%',
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography className="font-400" sx={{ fontSize: '15.33px', color: theme.palette.text.secondary }}>
                      Duration
                    </Typography>
                    <Tooltip 
                      title="Calculated from earliest course start date to latest course end date. Statutory leave has been deducted from the total duration."
                      arrow
                    >
                      <InfoIcon sx={{ color: '#ff9800', fontSize: '19.33px', cursor: 'help' }} />
                    </Tooltip>
                  </Box>
                  <Typography className="h5 font-600" sx={{ color: theme.palette.text.primary, fontSize: '1.208rem' }}>
                    {formattedDuration} weeks
                  </Typography>
                </Card>
              </Grid>

              {/* Contracted Work Hours Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    p: 2,
                    height: '100%',
                    borderLeft: `4px solid ${theme.palette.secondary.main}`,
                    backgroundColor: alpha(theme.palette.secondary.main, 0.02),
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography className="font-400" sx={{ fontSize: '15.33px', color: theme.palette.text.secondary }}>
                      Contracted Work Hours
                    </Typography>
                    <Tooltip 
                      title="Contracted work hours per week are not set. Please configure this in the Contract Work Hours section."
                      arrow
                    >
                      <InfoIcon sx={{ color: '#ff9800', fontSize: '19.33px', cursor: 'help' }} />
                    </Tooltip>
                  </Box>
                  <Typography className="h5 font-600" sx={{ color: theme.palette.text.primary, fontSize: '1.208rem' }}>
                    N/A
                  </Typography>
                </Card>
              </Grid>

              {/* Holiday Entitlement Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    p: 2,
                    height: '100%',
                    borderLeft: `4px solid ${theme.palette.info.main}`,
                    backgroundColor: alpha(theme.palette.info.main, 0.02),
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography className="font-400" sx={{ fontSize: '15.33px', color: theme.palette.text.secondary }}>
                      Holiday Entitlement
                    </Typography>
                    <Tooltip 
                      title="Holiday entitlement is not set. Please configure this in the Contract Work Hours section."
                      arrow
                    >
                      <InfoIcon sx={{ color: '#ff9800', fontSize: '19.33px', cursor: 'help' }} />
                    </Tooltip>
                  </Box>
                  <Typography className="h5 font-600" sx={{ color: theme.palette.text.primary, fontSize: '1.208rem' }}>
                    N/A
                  </Typography>
                </Card>
              </Grid>

              {/* Off the Job Hours Required Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    p: 2,
                    height: '100%',
                    borderLeft: `4px solid ${theme.palette.success.main}`,
                    backgroundColor: alpha(theme.palette.success.main, 0.02),
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <Typography className="font-400" sx={{ fontSize: '15.33px', color: theme.palette.text.secondary, mb: 1 }}>
                    Off the Job Hours Required
                  </Typography>
                  <Typography className="h5 font-600" sx={{ color: theme.palette.text.primary, fontSize: '1.208rem' }}>
                    {summaryData.otjRequired !== undefined ? `${summaryData.otjRequired.toFixed(0)} hours` : 'N/A'}
                  </Typography>
                </Card>
              </Grid>

              {/* Off the Job Hours Required to Date Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    p: 2,
                    height: '100%',
                    borderLeft: `4px solid ${theme.palette.warning.main}`,
                    backgroundColor: alpha(theme.palette.warning.main, 0.02),
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <Typography className="font-400" sx={{ fontSize: '15.33px', color: theme.palette.text.secondary, mb: 1 }}>
                    Required to Date
                  </Typography>
                  <Typography className="h5 font-600" sx={{ color: theme.palette.text.primary, fontSize: '1.208rem' }}>
                    {summaryData.requiredToDate !== undefined ? `${summaryData.requiredToDate.toFixed(0)} hours` : 'N/A'}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Warnings Section */}
          {summaryData.warnings && summaryData.warnings.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Alert 
                severity="warning" 
                icon={<WarningAmberIcon />}
                sx={{ 
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
              >
                <Typography className="h5 font-600" sx={{ mb: 1, fontSize: '1.208rem' }}>
                  Warnings
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 3, mt: 1 }}>
                  {summaryData.warnings.map((warning, index) => (
                    <li key={index}>
                      <Typography className="font-400" sx={{ fontSize: '15.33px' }}>
                        {warning}
                      </Typography>
                    </li>
                  ))}
                </Box>
              </Alert>
            </Box>
          )}

          {/* Actual Hours Section */}
          <Box sx={{ mb: 4 }}>
            <Typography className="h4 font-600" sx={{ mb: 2.5, color: theme.palette.text.primary, fontSize: '1.333rem' }}>
              Actual Hours To Date
            </Typography>
            <Grid container spacing={2.5}>
              {/* Total Logged Hours Card */}
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    p: 2.5,
                    height: '100%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[6],
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <AccessTimeIcon sx={{ color: theme.palette.primary.main, fontSize: '21.33px' }} />
                    <Typography className="font-500" sx={{ fontSize: '15.33px', color: theme.palette.text.secondary }}>
                      Total Logged Hours
                    </Typography>
                  </Box>
                  <Typography className="h4 font-700" sx={{ color: theme.palette.primary.main, mb: 0.5, fontSize: '1.333rem' }}>
                    {summaryData.totalLoggedHours !== undefined 
                      ? `${summaryData.totalLoggedHours.toFixed(2)} hours` 
                      : 'N/A'}
                  </Typography>
                  {summaryData.totalLoggedHours !== undefined && (
                    <Typography className="font-400" sx={{ fontSize: '13.33px', color: theme.palette.text.secondary }}>
                      ({formatHoursToTime(summaryData.totalLoggedHours)})
                    </Typography>
                  )}
                </Card>
              </Grid>

              {/* Hours This Week Card */}
              {summaryData.hoursThisWeek !== undefined && (
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      p: 2.5,
                      height: '100%',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[6],
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <CalendarTodayIcon sx={{ color: theme.palette.success.main, fontSize: '21.33px' }} />
                      <Typography className="font-500" sx={{ fontSize: '15.33px', color: theme.palette.text.secondary }}>
                        Hours This Week
                      </Typography>
                    </Box>
                    <Typography className="h4 font-700" sx={{ color: theme.palette.success.main, mb: 0.5, fontSize: '1.083rem' }}>
                      {summaryData.hoursThisWeek.toFixed(2)} hours
                    </Typography>
                    <Typography className="font-400" sx={{ fontSize: '13.33px', color: theme.palette.text.secondary }}>
                      ({formatHoursToTime(summaryData.hoursThisWeek)})
                    </Typography>
                  </Card>
                </Grid>
              )}

              {/* Hours This Month Card */}
              {summaryData.hoursThisMonth !== undefined && (
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      p: 2.5,
                      height: '100%',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[6],
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <CalendarTodayIcon sx={{ color: theme.palette.info.main, fontSize: '21.33px' }} />
                      <Typography className="font-500" sx={{ fontSize: '15.33px', color: theme.palette.text.secondary }}>
                        Hours This Month
                      </Typography>
                    </Box>
                    <Typography className="h4 font-700" sx={{ color: theme.palette.info.main, mb: 0.5, fontSize: '1.083rem' }}>
                      {summaryData.hoursThisMonth.toFixed(2)} hours
                    </Typography>
                    <Typography className="font-400" sx={{ fontSize: '13.33px', color: theme.palette.text.secondary }}>
                      ({formatHoursToTime(summaryData.hoursThisMonth)})
                    </Typography>
                  </Card>
                </Grid>
              )}

              {/* Percentage Card */}
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    p: 2.5,
                    height: '100%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.light, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[6],
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <TrendingUpIcon sx={{ color: theme.palette.warning.main, fontSize: '21.33px' }} />
                    <Typography className="font-500" sx={{ fontSize: '15.33px', color: theme.palette.text.secondary }}>
                      Percentage To Date
                    </Typography>
                    {actualPercentage === null && (
                      <Tooltip 
                        title="Percentage cannot be calculated because there are no required hours to date. This may occur if the apprenticeship has not started yet or if there is insufficient data."
                        arrow
                      >
                        <InfoIcon sx={{ color: '#ff9800', fontSize: '17.33px', cursor: 'help', ml: 'auto' }} />
                      </Tooltip>
                    )}
                  </Box>
                  <Typography className="h4 font-700" sx={{ color: theme.palette.warning.main, fontSize: '1.083rem' }}>
                    {actualPercentage !== null ? `${actualPercentage}%` : 'N/A'}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Course List Table */}
          {summaryData.courseSummaries && summaryData.courseSummaries.length > 0 && (
            <Box>
              <Typography className="h4 font-600" sx={{ mb: 2, color: theme.palette.text.primary, fontSize: '1.333rem' }}>
                Course List and Summary
              </Typography>
              <TableContainer 
                component={Card}
                variant="outlined"
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Table size="small">
                  <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '15.33px' }}>Course</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '15.33px' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '15.33px' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '15.33px' }}>Off the Job Hours</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summaryData.courseSummaries.map((course, index) => {
                      const totalMinutes = (course.offTheJobHours || 0) * 60 + (course.offTheJobMinutes || 0);
                      return (
                        <TableRow 
                          key={course.course_id || index}
                          sx={{ 
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.04)
                            }
                          }}
                        >
                          <TableCell sx={{ py: 1.5, fontSize: '15.33px' }}>{course.course_name}</TableCell>
                          <TableCell sx={{ py: 1.5, fontSize: '15.33px' }}>
                            {course.course_type ? (
                              <Chip 
                                label={course.course_type} 
                                size="small" 
                                variant="outlined"
                                sx={{ fontSize: '13.33px' }}
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell sx={{ py: 1.5, fontSize: '15.33px' }}>
                            {course.status ? (
                              <Chip 
                                label={course.status} 
                                size="small" 
                                color={course.status.toLowerCase() === 'active' ? 'success' : 'default'}
                                sx={{ fontSize: '13.33px' }}
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell sx={{ py: 1.5, fontWeight: 500, fontSize: '15.33px' }}>
                            {formatMinutesToTime(totalMinutes)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default OffTheJobSummary;
