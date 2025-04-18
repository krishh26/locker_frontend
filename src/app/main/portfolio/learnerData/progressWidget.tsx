import { Box, Card, LinearProgress, Stack, Typography } from '@mui/material';
import { getLearnerDetailsReturn, selectLearnerManagement } from 'app/store/learnerManagement';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { SecondaryButtonOutlined } from 'src/app/component/Buttons';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { useSelector } from 'react-redux';
import FuseLoading from "@fuse/core/FuseLoading";
import { format } from 'date-fns';


function calculateCompletionPercentage(startDate, endDate) {
  const start: any = new Date(startDate);
  const end: any = new Date(endDate);
  const today = new Date();

  const current = today > end ? end : today;
  const totalDuration = end - start;
  const elapsedDuration = current - start;
  const percentageCompleted = (elapsedDuration / totalDuration) * 100;
  return percentageCompleted > 100 ? 100 : percentageCompleted.toFixed(0);
}

function LinearProgressWithLabel(props) {
  const { color, value } = props;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Stack sx={{ width: '100%', mr: 1, color: color, backgroundColor: 'lightgray', borderRadius: "10px" }}>
        <LinearProgress className='h-20' variant="determinate" value={value} sx={{ height: '10px', backgroundColor: '#e5e7eb', borderRadius: "10px", '& .MuiLinearProgress-bar': { backgroundColor: color, borderRadius: "5px" } }} />
      </Stack>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

const ProgressWidget = () => {

  const dispatch: any = useDispatch();
  const navigate = useNavigate();

  const { dataFetchLoading } = useSelector(selectLearnerManagement);

  const [learnerDetails, setLearnerDetails] = useState(undefined)
  const [course, setCourse] = useState([]);
  const [overView, setOverView] = useState({
    fullyCompleted: 0,
    notStarted: 0,
    partiallyCompleted: 0,
    totalSubUnits: 0,
    dayPending: 0
  })

  useEffect(() => {
    async function fetchLearner() {
      const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user;
      if (user) {
        setLearnerDetails(user)
        const data = await dispatch(getLearnerDetailsReturn(user?.learner_id))
        if (data) {
          setCourse(data?.course)
          setOverView(data.course?.reduce((acc, curr) => {
            return {
              fullyCompleted: acc.fullyCompleted + curr.fullyCompleted,
              notStarted: acc.notStarted + curr.notStarted,
              partiallyCompleted: acc.partiallyCompleted + curr.partiallyCompleted,
              totalSubUnits: acc.totalSubUnits + curr.totalSubUnits,
              dayPending: acc.dayPending + Number(calculateCompletionPercentage(curr.start_date, curr.end_date)) ? Number(calculateCompletionPercentage(curr.start_date, curr.end_date)) : 0
            }
          }, overView))
        }
      }
    }
    fetchLearner();
  }, [])

  const formatDate = (date) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    return format(parsedDate, 'dd/MM/yyyy');
  };

  const validDates = course
    .map(c => new Date(c?.start_date).getTime())
    .filter(date => !isNaN(date));

  const minDateValue = validDates.length > 0
    ? Math.min(...validDates)
    : null;

  const validEndDates = course
    .map(c => new Date(c?.end_date).getTime())
    .filter(date => !isNaN(date));

  const maxDateValue = validEndDates.length > 0
    ? Math.max(...validEndDates)
    : null;

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      {dataFetchLoading ? (
        <FuseLoading />
      ) : (
        <div className='p-10'>
          <div className='flex justify-between items-center p-10 border-b-1 !border-grey-400'>
            <Typography className='capitalize text-lg font-semibold'>Welcome,  {learnerDetails?.displayName}</Typography>
            <button onClick={handleBack} className='mb-10 text-[#5b718f]'>
              <KeyboardBackspaceIcon /> Back
            </button>
          </div>

          <div className='m-14'>
            <Typography className='py-8 capitalize text-2xl font-normal'>Overall Progress</Typography>
            <div className='flex gap-8 justify-start items-end'>
              <Card className='p-14 w-2/5 rounded-0 bg-grey-100 flex flex-col gap-8'>
                <div>

                  <Typography className='pb-6 text-sm'>Actual Course Progress {Math.round((overView?.fullyCompleted / overView?.totalSubUnits) * 100)
                  } % (<span className='text-green'>Green</span>) / {Math.round((overView?.partiallyCompleted / overView?.totalSubUnits) * 100)
                    } % Criteria with evidence attached (<span className=' text-[coral] '>Orange</span>)</Typography>

                  <LinearProgressWithLabel value={(overView?.partiallyCompleted / overView?.totalSubUnits) * 100} color="coral" />
                </div>
                <div>
                  <LinearProgressWithLabel value={(overView?.fullyCompleted / overView?.totalSubUnits) * 100} color="green" />
                </div>
                <div>
                  <Typography className='pb-6 text-sm'>Course duration {formatDate(minDateValue)} to {formatDate(maxDateValue)}</Typography>
                  <LinearProgressWithLabel value={overView?.dayPending / course?.length} color="skyblue" />
                </div>

              </Card>
              <div>
                <Link to="/portfolio">
                  <SecondaryButtonOutlined name="Go to dashboard" />
                </Link>
              </div>
            </div>

          </div>

          <div className='m-14 '>
            {course.map((course) => (
              <>
                <Typography className='py-8 capitalize text-2xl font-normal'>{course.course.course_name}</Typography>
                <div className='flex w-4/5 gap-8 justify-start items-center 0 bg-grey-100 border-b-3 !border-grey-300'>
                  <Card className='bg-grey-100 w-full p-14 rounded-0 flex flex-col gap-8'>
                    <div>
                      <Typography className='pb-6 text-sm'>Actual Course Progress {Math.round((course?.fullyCompleted / course?.totalSubUnits) * 100)} % (<span className='text-green'>Green</span>) / {Math.round((course?.partiallyCompleted / course?.totalSubUnits) * 100)} % Criteria with evidence attached (<span className=' text-[coral] '>Orange</span>)</Typography>
                      <LinearProgressWithLabel value={(course?.partiallyCompleted / course?.totalSubUnits) * 100} color="coral" />
                    </div>
                    <div>
                      <LinearProgressWithLabel value={(course?.fullyCompleted / course?.totalSubUnits) * 100} color="green" />
                    </div>
                    <div>
                      <Typography className='pb-6 text-sm'>Course duration {formatDate(course?.start_date)} to {formatDate(course?.end_date)}</Typography>
                      <LinearProgressWithLabel value={Number(calculateCompletionPercentage(course?.start_date, course?.end_date)) ? Number(calculateCompletionPercentage(course?.start_date, course?.end_date)) : 0} color="skyblue" />
                    </div>

                  </Card>
                  <div className='w-1/4 flex flex-col justify-center items-center gap-6 '>
                    <Link to="/portfolio">
                      <SecondaryButtonOutlined name="Go to dashboard" />
                    </Link>
                    <Typography className='text-sm'>Trainer: {(course?.trainer_id?.first_name) + " " + (course?.trainer_id?.last_name)}</Typography>
                  </div>
                </div>
              </>
            ))}
          </div>

          <div className='m-14'>
            <Card className=' w-1/2 rounded-6 bg-grey-200 p-10 flex gap-40'>
              <div className='w-2/5'>
                <div className='py-10 border-b-1 !border-grey-600 mb-16 '>
                  <strong>Progress Bars</strong>
                </div>
                <div className='flex flex-col gap-7'>
                  <Typography className='text-sm'><span className='inline-block h-6 w-20 mr-8 bg-[#ff6c00]'></span>
                    Learner progress, assessed evidence mapped to requirements</Typography>
                  <Typography className='text-sm'><span className='inline-block h-6 w-20 mr-8 bg-[#008000]'></span>
                    Assessor signed off requirements</Typography>
                  <Typography className='text-sm'><span className='inline-block h-6 w-20 mr-8 bg-[#0000FF]'></span>
                    Time elapsed</Typography>
                  <Typography className='text-sm'><span className='inline-block h-6 w-20 mr-8 bg-[#FF0000]'></span>
                    Past end of course</Typography>
                  <Typography className='text-sm'><span className='inline-block h-6 w-20 mr-8 bg-[#808080]'></span>
                    Missing start/end date or learner not in training</Typography>
                  <Typography className='text-sm'><span className='inline-block h-6 w-20 mr-8 bg-[#00008B]'></span>
                    Past end date, in extension period</Typography>

                </div>
              </div>
              <div className='w-2/5'>
                <div className='py-10 border-b-1 !border-grey-600 mb-16 '>
                  <strong>Course Data</strong>
                </div>
                <div>
                  <div className='flex items-center gap-4'>
                    <img className='w-20 h-20' src="./assets/icons/ic-2.png" alt="ic-2" />
                    <Typography className='text-sm'>Secondary Assessor</Typography>
                  </div>
                  <div className='flex items-center gap-4 mt-7'>
                    <img className='w-20 h-20' src="./assets/icons/LeadAssessor.jpg" alt="LeadAssessor" />
                    <Typography className='text-sm'>Lead Assessor</Typography>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>)
      }
    </>
  )
}

export default ProgressWidget