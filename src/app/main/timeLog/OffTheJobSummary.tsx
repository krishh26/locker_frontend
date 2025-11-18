import { Card, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip } from '@mui/material';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import InfoIcon from '@mui/icons-material/Info';
import { selectGlobalUser } from 'app/store/globalUser';
import FuseLoading from '@fuse/core/FuseLoading';
import { getOtjSummary, selectTimeLog } from 'app/store/timeLog';

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
    <Grid className="w-full rounded-4 mb-20" sx={{ border: "1px solid #ddd" }}>
      <Card className="rounded-4 p-20 bg-grey-200" sx={{ borderBottom: "1px solid #ddd" }}>
        <Typography className="h3 font-500">Off the Job Summary</Typography>
      </Card>

      <Grid className="p-20">
        {/* Summary Metrics */}
        <Grid className="mb-20">
          <Typography className="h4 font-500 mb-10">Summary</Typography>
          <Grid className="flex flex-col gap-10">
            <Grid className="flex items-center gap-10">
              <Typography className="font-400">Duration:</Typography>
              <Typography className="font-600">{formattedDuration} weeks</Typography>
              <Tooltip 
                title="Calculated from earliest course start date to latest course end date. Statutory leave has been deducted from the total duration."
                arrow
              >
                <InfoIcon sx={{ color: '#ff9800', fontSize: '18px', cursor: 'help' }} />
              </Tooltip>
            </Grid>
            <Grid className="flex items-center gap-10">
              <Typography className="font-400">Current Contracted Work Hours:</Typography>
              <Typography className="font-600">N/A</Typography>
              <Tooltip 
                title="Contracted work hours per week are not set. Please configure this in the Contract Work Hours section."
                arrow
              >
                <InfoIcon sx={{ color: '#ff9800', fontSize: '18px', cursor: 'help' }} />
              </Tooltip>
            </Grid>
            <Grid className="flex items-center gap-10">
              <Typography className="font-400">Current Holiday Entitlement:</Typography>
              <Typography className="font-600">N/A</Typography>
              <Tooltip 
                title="Holiday entitlement is not set. Please configure this in the Contract Work Hours section."
                arrow
              >
                <InfoIcon sx={{ color: '#ff9800', fontSize: '18px', cursor: 'help' }} />
              </Tooltip>
            </Grid>
            <Grid className="flex items-center gap-10">
              <Typography className="font-400">Off the Job Hours Required:</Typography>
              <Typography className="font-600">
                {summaryData.otjRequired !== undefined ? `${summaryData.otjRequired.toFixed(0)} hours` : 'N/A'}
              </Typography>
            </Grid>
            <Grid className="flex items-center gap-10">
              <Typography className="font-400">Off the Job Hours Required to Date:</Typography>
              <Typography className="font-600">
                {summaryData.requiredToDate !== undefined ? `${summaryData.requiredToDate.toFixed(0)} hours` : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Warnings Section */}
        {summaryData.warnings && summaryData.warnings.length > 0 && (
          <Grid className="mb-20 p-15 rounded-4" sx={{ backgroundColor: '#f5f5dc', border: '1px solid #d4af37' }}>
            <Typography className="h5 font-600 mb-10">Warnings</Typography>
            <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
              {summaryData.warnings.map((warning, index) => (
                <li key={index}>
                  <Typography className="font-400">{warning}</Typography>
                </li>
              ))}
            </ul>
          </Grid>
        )}

        {/* Course List Table */}
        {summaryData.courseSummaries && summaryData.courseSummaries.length > 0 && (
          <Grid className="mb-20">
            <Typography className="h4 font-500 mb-10">Course List and Summary</Typography>
            <TableContainer>
              <Table size="small" sx={{ border: "1px solid #ddd" }}>
                <TableHead sx={{ backgroundColor: '#f8f8f8' }}>
                  <TableRow>
                    <TableCell sx={{ borderRight: "1px solid #ddd", fontWeight: 600 }}>Course</TableCell>
                    <TableCell sx={{ borderRight: "1px solid #ddd", fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ borderRight: "1px solid #ddd", fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Off the Job Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summaryData.courseSummaries.map((course, index) => {
                    const totalMinutes = (course.offTheJobHours || 0) * 60 + (course.offTheJobMinutes || 0);
                    return (
                      <TableRow key={course.course_id || index}>
                        <TableCell sx={{ borderRight: "1px solid #ddd", borderBottom: "1px solid #ddd" }}>
                          {course.course_name}
                        </TableCell>
                        <TableCell sx={{ borderRight: "1px solid #ddd", borderBottom: "1px solid #ddd" }}>
                          {course.course_type || ''}
                        </TableCell>
                        <TableCell sx={{ borderRight: "1px solid #ddd", borderBottom: "1px solid #ddd" }}>
                          {course.status || ''}
                        </TableCell>
                        <TableCell sx={{ borderBottom: "1px solid #ddd" }}>
                          {formatMinutesToTime(totalMinutes)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}

        {/* Summary Footer */}
        <Grid className="flex flex-col gap-10">
          <Grid className="flex items-center gap-10">
            <Typography className="font-600">Actual Hours To Date (Total Logged Hours):</Typography>
            <Typography className="font-600">
              {summaryData.totalLoggedHours !== undefined 
                ? `${summaryData.totalLoggedHours.toFixed(2)} hours (${formatHoursToTime(summaryData.totalLoggedHours)})`
                : 'N/A'}
            </Typography>
          </Grid>
          {summaryData.hoursThisWeek !== undefined && (
            <Grid className="flex items-center gap-10">
              <Typography className="font-600">Hours This Week:</Typography>
              <Typography className="font-600">
                {summaryData.hoursThisWeek.toFixed(2)} hours ({formatHoursToTime(summaryData.hoursThisWeek)})
              </Typography>
            </Grid>
          )}
          {summaryData.hoursThisMonth !== undefined && (
            <Grid className="flex items-center gap-10">
              <Typography className="font-600">Hours This Month:</Typography>
              <Typography className="font-600">
                {summaryData.hoursThisMonth.toFixed(2)} hours ({formatHoursToTime(summaryData.hoursThisMonth)})
              </Typography>
            </Grid>
          )}
          <Grid className="flex items-center gap-10">
            <Typography className="font-600">Actual Percentage To Date:</Typography>
            <Typography className="font-600">
              {actualPercentage !== null ? `${actualPercentage}%` : 'N/A'}
            </Typography>
            {actualPercentage === null && (
              <Tooltip 
                title="Percentage cannot be calculated because there are no required hours to date. This may occur if the apprenticeship has not started yet or if there is insufficient data."
                arrow
              >
                <InfoIcon sx={{ color: '#ff9800', fontSize: '18px', cursor: 'help' }} />
              </Tooltip>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OffTheJobSummary;
