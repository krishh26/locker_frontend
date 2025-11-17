import { Card, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import InfoIcon from '@mui/icons-material/Info';
import { selectGlobalUser } from 'app/store/globalUser';
import { selectLearnerManagement } from 'app/store/learnerManagement';
import { getContractWork, selectContractWork } from 'app/store/contractedWork';
import FuseLoading from '@fuse/core/FuseLoading';
import axios from 'axios';
import jsonData from 'src/url.json';

interface CourseSummary {
  course_id: number;
  course_name: string;
  course_type?: string;
  status?: string;
  offTheJobHours: number;
  offTheJobMinutes: number;
  hasValidEndDate: boolean;
  isExcluded: boolean;
}

interface OffTheJobSummaryData {
  duration: number; // in weeks
  durationDays: number; // in days
  statutoryLeaveWeeks: number; // statutory leave in weeks
  totalDurationForCalculation: number; // duration minus statutory leave
  currentContractedWorkHours: number | null;
  currentHolidayEntitlement: number | null;
  offTheJobHoursRequired: number;
  offTheJobHoursRequiredToDate: number;
  actualHoursToDate: number;
  actualPercentageToDate: number | null;
  coursesWithoutEndDates: string[];
  excludedCourses: string[];
  courseSummaries: CourseSummary[];
}

const OffTheJobSummary = () => {
  const dispatch: any = useDispatch();
  const { currentUser, selectedUser, selected } = useSelector(selectGlobalUser);
  const { learner } = useSelector(selectLearnerManagement);
  const contractWork = useSelector(selectContractWork);
  const [allTimeLogData, setAllTimeLogData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<OffTheJobSummaryData | null>(null);

  // Fetch contract work data
  useEffect(() => {
    const learnerId = selected ? selectedUser?.learner_id : currentUser?.learner_id;
    if (learnerId) {
      dispatch(getContractWork(learnerId));
    }
  }, [dispatch, selectedUser, currentUser, selected]);

  // Fetch all time log data for calculations
  useEffect(() => {
    const fetchAllTimeLogData = async () => {
      setLoading(true);
      try {
        const userId = selected ? selectedUser?.user_id : currentUser?.user_id;
        if (!userId) return;

        const URL_BASE_LINK = jsonData.API_LOCAL_URL;
        // Fetch all time log entries without pagination
        const response = await axios.get(
          `${URL_BASE_LINK}/time-log/list?pagination=false&user_id=${userId}&type=Off the job`
        );
        setAllTimeLogData(response.data.data || []);
      } catch (error) {
        console.error('Error fetching time log data:', error);
        setAllTimeLogData([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedUser?.user_id || currentUser?.user_id) {
      fetchAllTimeLogData();
    }
  }, [dispatch, selectedUser, currentUser, selected]);

  // Calculate time in minutes from time string (format: "HH:MM")
  const parseTimeToMinutes = (timeString: string): number => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  // Format minutes to hours:minutes string
  const formatMinutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  // Format minutes to decimal hours
  const formatMinutesToDecimalHours = (minutes: number): number => {
    return parseFloat((minutes / 60).toFixed(2));
  };

  // Calculate statutory leave duration in weeks (10% of total duration)
  const calculateStatutoryLeave = (durationWeeks: number): number => {
    if (durationWeeks <= 0) return 0;
    return parseFloat((durationWeeks * 0.1).toFixed(2));
  };

  // Check if start date is on or after 1 August 2022
  const isStartDateAfterAug2022 = (startDate: Date | null): boolean => {
    if (!startDate) return false;
    const aug2022 = new Date('2022-08-01');
    return startDate >= aug2022;
  };

  // Calculate summary data
  useEffect(() => {
    if (!learner?.course) {
      setSummaryData(null);
      return;
    }

    // Get contract work data
    const contractWorkData = contractWork?.data?.[0] || null;
    const contractedWorkHoursPerWeek = contractWorkData?.contracted_work_hours_per_week 
      ? parseFloat(contractWorkData.contracted_work_hours_per_week) 
      : null;
    const holidayEntitlement = contractWorkData?.yearly_holiday_entitlement_in_hours 
      ? parseFloat(contractWorkData.yearly_holiday_entitlement_in_hours) 
      : null;

    const courses = learner.course || [];
    const courseMap = new Map<number, any>();
    courses.forEach((course: any) => {
      const courseId = course.course?.course_id;
      if (courseId) {
        courseMap.set(courseId, course);
      }
    });

    // Group time log entries by course
    const courseHoursMap = new Map<number, number>();
    const coursesWithoutEndDates: string[] = [];
    const excludedCourses: string[] = [];

    allTimeLogData.forEach((entry: any) => {
      if (entry.type === 'Off the job' && entry.course_id?.course_id) {
        const courseId = entry.course_id.course_id;
        const minutes = parseTimeToMinutes(entry.spend_time);
        const currentMinutes = courseHoursMap.get(courseId) || 0;
        courseHoursMap.set(courseId, currentMinutes + minutes);
      }
    });

    // Build course summaries
    const courseSummaries: CourseSummary[] = [];
    let totalActualMinutes = 0;

    courses.forEach((course: any) => {
      const courseId = course.course?.course_id;
      const courseName = course.course?.course_name || 'Unknown Course';
      const courseData = course.course || {};
      
      // Check if course has valid end date
      const hasValidEndDate = !!(course.end_date && new Date(course.end_date).getTime() > 0);
      
      // Check if course is excluded from off the job
      const isExcluded = courseData.included_in_off_the_job === 'No' || 
                        courseData.included_in_off_the_job === false;

      if (!hasValidEndDate) {
        coursesWithoutEndDates.push(courseName);
      }

      if (isExcluded) {
        excludedCourses.push(courseName);
      }

      // Only include courses that have valid end dates and are not excluded
      const shouldInclude = hasValidEndDate && !isExcluded;
      const minutes = shouldInclude ? (courseHoursMap.get(courseId) || 0) : 0;
      
      if (shouldInclude) {
        totalActualMinutes += minutes;
      }

      // Determine course type
      let courseType = '';
      if (courseData.course_core_type === 'Gateway') {
        courseType = 'Gateway Ready';
      } else if (courseData.course_type) {
        courseType = courseData.course_type;
      } else if (courseData.course_core_type) {
        courseType = courseData.course_core_type;
      }

      // Determine status
      const status = course.status || 'Awaiting Induction';

      courseSummaries.push({
        course_id: courseId,
        course_name: courseName,
        course_type: courseType,
        status: status,
        offTheJobHours: Math.floor(minutes / 60),
        offTheJobMinutes: minutes % 60,
        hasValidEndDate,
        isExcluded,
      });
    });

    // Calculate duration (from earliest start date to latest end date)
    let earliestStart: Date | null = null;
    let latestEnd: Date | null = null;
    courses.forEach((course: any) => {
      if (course.start_date) {
        const start = new Date(course.start_date);
        if (!earliestStart || start < earliestStart) {
          earliestStart = start;
        }
      }
      if (course.end_date) {
        const end = new Date(course.end_date);
        if (!latestEnd || end > latestEnd) {
          latestEnd = end;
        }
      }
    });

    // Step 1: Calculate duration in days
    const durationDays = earliestStart && latestEnd
      ? Math.ceil((latestEnd.getTime() - earliestStart.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Step 2: Calculate duration in weeks
    const durationWeeks = durationDays > 0
      ? parseFloat((durationDays / 7).toFixed(2))
      : 0;

    // Step 3: Calculate statutory leave duration (10% of duration in weeks)
    const statutoryLeaveWeeks = calculateStatutoryLeave(durationWeeks);

    // Step 4: Calculate total duration for calculation (duration - statutory leave)
    const totalDurationForCalculation = Math.max(0, durationWeeks - statutoryLeaveWeeks);

    // Step 5: Apply 30-hour cap if start date is on or after 1 August 2022
    const defaultContractedHoursPerWeek = 40;
    let hoursPerWeek = contractedWorkHoursPerWeek || defaultContractedHoursPerWeek;
    
    if (isStartDateAfterAug2022(earliestStart) && hoursPerWeek > 30) {
      hoursPerWeek = 30;
    }

    // Step 6: Calculate total hours (weekly hours × total duration for calculation)
    const totalHours = totalDurationForCalculation > 0
      ? Math.round(hoursPerWeek * totalDurationForCalculation)
      : 0;

    // Step 7: Calculate minimum off-the-job training required (total hours × 20%)
    const offTheJobHoursRequired = totalHours > 0
      ? Math.round(totalHours * 0.2)
      : 520; // Default fallback
    
    // Calculate required to date (proportional based on current date)
    const currentDate = new Date();
    const daysElapsed = earliestStart
      ? Math.max(0, Math.ceil((currentDate.getTime() - earliestStart.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;
    
    // Calculate proportional duration for "to date" calculation
    const weeksElapsed = daysElapsed > 0
      ? parseFloat((daysElapsed / 7).toFixed(2))
      : 0;
    const statutoryLeaveElapsed = calculateStatutoryLeave(weeksElapsed);
    const totalDurationElapsed = Math.max(0, weeksElapsed - statutoryLeaveElapsed);
    const totalHoursElapsed = totalDurationElapsed > 0
      ? Math.round(hoursPerWeek * totalDurationElapsed)
      : 0;
    
    const offTheJobHoursRequiredToDate = totalHoursElapsed > 0
      ? Math.round(totalHoursElapsed * 0.2)
      : 0;

    // Calculate actual hours to date
    const actualHoursToDate = formatMinutesToDecimalHours(totalActualMinutes);

    // Calculate percentage
    const actualPercentageToDate = offTheJobHoursRequiredToDate > 0
      ? Math.round((actualHoursToDate / offTheJobHoursRequiredToDate) * 100 * 100) / 100
      : null;

    setSummaryData({
      duration: durationWeeks,
      durationDays,
      statutoryLeaveWeeks,
      totalDurationForCalculation,
      currentContractedWorkHours: contractedWorkHoursPerWeek,
      currentHolidayEntitlement: holidayEntitlement,
      offTheJobHoursRequired,
      offTheJobHoursRequiredToDate,
      actualHoursToDate,
      actualPercentageToDate,
      coursesWithoutEndDates,
      excludedCourses,
      courseSummaries,
    });
  }, [allTimeLogData, learner, contractWork]);

  if (loading) {
    return <FuseLoading />;
  }

  if (!summaryData) {
    return null;
  }

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
              <Typography className="font-600">{summaryData.duration.toFixed(2)} weeks</Typography>
              <Tooltip 
                title={`Calculated from earliest course start date to latest course end date. Statutory leave of ${summaryData.statutoryLeaveWeeks.toFixed(2)} weeks has been deducted from the total duration.`}
                arrow
              >
                <InfoIcon sx={{ color: '#ff9800', fontSize: '18px', cursor: 'help' }} />
              </Tooltip>
            </Grid>
            <Grid className="flex items-center gap-10">
              <Typography className="font-400">Current Contracted Work Hours:</Typography>
              <Typography className="font-600">
                {summaryData.currentContractedWorkHours !== null 
                  ? `${summaryData.currentContractedWorkHours}` 
                  : 'N/A'}
              </Typography>
              {summaryData.currentContractedWorkHours === null && (
                <Tooltip 
                  title="Contracted work hours per week are not set. Please configure this in the Contract Work Hours section. A default of 40 hours per week will be used for calculations."
                  arrow
                >
                  <InfoIcon sx={{ color: '#ff9800', fontSize: '18px', cursor: 'help' }} />
                </Tooltip>
              )}
            </Grid>
            <Grid className="flex items-center gap-10">
              <Typography className="font-400">Current Holiday Entitlement:</Typography>
              <Typography className="font-600">
                {summaryData.currentHolidayEntitlement !== null 
                  ? `${summaryData.currentHolidayEntitlement}` 
                  : 'N/A'}
              </Typography>
              {summaryData.currentHolidayEntitlement === null && (
                <Tooltip 
                  title="Holiday entitlement is not set. Please configure this in the Contract Work Hours section."
                  arrow
                >
                  <InfoIcon sx={{ color: '#ff9800', fontSize: '18px', cursor: 'help' }} />
                </Tooltip>
              )}
            </Grid>
            <Grid className="flex items-center gap-10">
              <Typography className="font-400">Off the Job Hours Required:</Typography>
              <Typography className="font-600">{summaryData.offTheJobHoursRequired} hours</Typography>
            </Grid>
            <Grid className="flex items-center gap-10">
              <Typography className="font-400">Off the Job Hours Required to Date:</Typography>
              <Typography className="font-600">{summaryData.offTheJobHoursRequiredToDate} hours</Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Warnings Section */}
        {(summaryData.coursesWithoutEndDates.length > 0 || summaryData.excludedCourses.length > 0) && (
          <Grid className="mb-20 p-15 rounded-4" sx={{ backgroundColor: '#f5f5dc', border: '1px solid #d4af37' }}>
            <Typography className="h5 font-600 mb-10">Warnings</Typography>
            {summaryData.coursesWithoutEndDates.length > 0 && (
              <Grid className="mb-10">
                <Typography className="font-400 mb-5">
                  The following Courses don't have valid end dates, therefore time log entries assigned to them won't be used in calculations:
                </Typography>
                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                  {summaryData.coursesWithoutEndDates.map((courseName, index) => (
                    <li key={index}>
                      <Typography className="font-400">{courseName}</Typography>
                    </li>
                  ))}
                </ul>
              </Grid>
            )}
            {summaryData.excludedCourses.length > 0 && (
              <Grid>
                <Typography className="font-400 mb-5">
                  The following Courses have been set to 'Exclude from Off the Job', therefore time log entries assigned to them won't be used in calculations:
                </Typography>
                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                  {summaryData.excludedCourses.map((courseName, index) => (
                    <li key={index}>
                      <Typography className="font-400">{courseName}</Typography>
                    </li>
                  ))}
                </ul>
              </Grid>
            )}
          </Grid>
        )}

        {/* Course List Table */}
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
                {summaryData.courseSummaries.map((course, index) => (
                  <TableRow key={course.course_id || index}>
                    <TableCell sx={{ borderRight: "1px solid #ddd", borderBottom: "1px solid #ddd" }}>
                      {course.course_name}
                    </TableCell>
                    <TableCell sx={{ borderRight: "1px solid #ddd", borderBottom: "1px solid #ddd" }}>
                      {course.course_type || ''}
                    </TableCell>
                    <TableCell sx={{ borderRight: "1px solid #ddd", borderBottom: "1px solid #ddd" }}>
                      {course.status}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #ddd" }}>
                      {course.isExcluded || !course.hasValidEndDate 
                        ? '0:00' 
                        : formatMinutesToTime(course.offTheJobHours * 60 + course.offTheJobMinutes)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Summary Footer */}
        <Grid className="flex flex-col gap-10">
          <Grid className="flex items-center gap-10">
            <Typography className="font-600">Actual Hours To Date:</Typography>
            <Typography className="font-600">
              {summaryData.actualHoursToDate.toFixed(2)} ({formatMinutesToTime(Math.round(summaryData.actualHoursToDate * 60))})
            </Typography>
          </Grid>
          <Grid className="flex items-center gap-10">
            <Typography className="font-600">Actual Percentage To Date:</Typography>
            <Typography className="font-600">
              {summaryData.actualPercentageToDate !== null 
                ? `${summaryData.actualPercentageToDate.toFixed(2)}%` 
                : 'N/A'}
            </Typography>
            {summaryData.actualPercentageToDate === null && (
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

