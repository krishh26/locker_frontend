import { Autocomplete, Box, Button, Card, Grid, LinearProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import { selectGlobalUser } from 'app/store/globalUser';
import { getLearnerDetailsReturn } from 'app/store/learnerManagement';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { SecondaryButtonOutlined } from 'src/app/component/Buttons';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';


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

const CourseProgressMap = () => {

  const dispatch: any = useDispatch();
  const navigate = useNavigate();

  const { selectedUser, dataFetchLoading } = useSelector(selectGlobalUser);
  const courseList = selectedUser?.course?.map((item) => (item?.course));

  console.log(courseList);

  const [learnerDetails, setLearnerDetails] = useState(undefined)
  const [course, setCourse] = useState([]);

  useEffect(() => {
    async function fetchLearner() {
      const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user;
      if (user) {
        setLearnerDetails(user)
        const data = await dispatch(getLearnerDetailsReturn(user?.learner_id))
        if (data) {
          setCourse(data?.course)
        }
      }
    }
    fetchLearner();
  }, [])

  const [selectedValue, setSelectedValue] = useState("Show all criteria");

  const handleUpdate = (event, value) => {
    setSelectedValue(value);
    // Add your logic here to handle the update if needed
  };

  const [expandedCourses, setExpandedCourses] = useState<number[]>([])

  const toggleCourse = (courseId: number) => {
    console.log(courseId);

    setExpandedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const toggleAllCourses = () => {
    setExpandedCourses(prev =>
      prev?.length === courseList?.length ? [] : courseList.map(course => course.course_id)
    )
  }

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <div className='flex justify-between items-center p-10 border-b-1 !border-grey-400'>
        <Typography className='capitalize text-lg font-semibold'>Welcome,  {learnerDetails?.displayName}</Typography>
        <button onClick={handleBack} className='mb-10 text-[#5b718f]'>
          <KeyboardBackspaceIcon /> Back
        </button>
      </div>

      <div className='m-14'>
        <Typography className='font-semibold'>Progress Map:</Typography>
        <Typography className='font-semibold'>{learnerDetails?.displayName} - TQUK Level 5 Diploma for Operations and Departmental Managers (RQF) - 60335932</Typography>
        <Typography className='font-semibold'>Trainer Name : Michelle Parris</Typography>
        <Typography className='font-semibold'>05/10/2024</Typography>
      </div>

      <div className='m-14 w-2/5 flex gap-2 items-center justify-between'>
        <div className='flex gap-2 w-1/2 items-center '>
          <Typography className='min-w-60' sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", fontWeight: "600" }}>Filter :</Typography>
          {/* <Autocomplete
            disableClearable
            fullWidth
            size="small"
            options={courseList}
            getOptionLabel={(option: any) => option?.course_name}
            // value={employer.find((emp) => emp.employer.employer_id === learnerData.employer_id) || null}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select Course"
                name="course"
              />
            )}
            // onChange={(event, value) => {
            //     setLearnerData((prevData) => ({
            //         ...prevData,
            //         employer_id: value?.employer?.employer_id || null,
            //     }));
            // }}
            sx={{
              ".muiltr-1okx3q8-MuiButtonBase-root-MuiIconButton-root-MuiAutocomplete-popupIndicator": {
                color: "black",
              },
            }}
            PaperComponent={({ children }) => (
              <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
            )}
          /> */}
          <Autocomplete
            disableClearable
            fullWidth
            size="small"
            value={selectedValue}
            options={[
              "Show all criteria",
              "Show Non Completed criteria",
              "Show In Progress Criteria",
              "Show completed criteria",
              "Show non started criteria",
            ]}
            onChange={handleUpdate}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="No filter..."
                name="funding_body"
              />
            )}
            sx={{
              ".muiltr-1okx3q8-MuiButtonBase-root-MuiIconButton-root-MuiAutocomplete-popupIndicator": {
                color: "black",
              },
            }}
            PaperComponent={({ children }) => (
              <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
            )}
          />
        </div>

        <div>
          <SecondaryButtonOutlined name="Export to PDF" />
        </div>
      </div>
      <div>
        <div className=' flex gap-10 m-14'>
          <SecondaryButtonOutlined
            className="flex items-center justify-center min-w-20 max-h-20 text-xl p-0"
            onClick={toggleAllCourses}
            name={expandedCourses?.length === courseList?.length ? '-' : '+'}
          />
          Open all units/Close all units
          {/* {expandedCourses?.length === courseList?.length ? 'Close all units' : 'Open all units'} */}
        </div>
        <div className='m-14'>
          <Typography className='py-8 capitalize text-2xl font-normal'>Overall Progress</Typography>
          <div className='flex gap-8 justify-start items-end'>
            <Card className='p-14 w-2/5 rounded-0 bg-grey-100 flex flex-col gap-8'>
              <div>
                <Typography className='pb-6 text-sm'>Signed OffProgress (<span className='text-green'>Green</span>) / Criteria Awaiting Sign Off (<span className=' text-[coral] '>Orange</span>)</Typography>
                <LinearProgressWithLabel color="green" value={0} />
              </div>
              <div>
                <LinearProgressWithLabel color="coral" value={37} />
              </div>
              <div>
                <Typography className='pb-6 text-sm'>Time Progress: <span className='text-[dodgerblue]'>10%</span></Typography>
                <LinearProgressWithLabel color="dodgerblue" value={10} />
                <Typography className='pb-6 text-sm pt-8'>Course duration 08/08/2024 to 09/07/2026</Typography>
              </div>

            </Card>
          </div>

        </div>
      </div>

      <div className='m-14'>
        {courseList?.map(course => (
          <Card key={course?.course_id} className="mb-10 p-10 rounded-4">
            <div className="flex items-center gap-10">
              <SecondaryButtonOutlined
                className="flex items-center justify-center min-w-20 max-h-20 text-xl p-0"
                onClick={() => toggleCourse(course?.course_id)}
                name={expandedCourses.includes(course?.course_id) ? "-" : "+"}
              />
              <Typography>{course?.course_name}</Typography>
            </div>
            {expandedCourses.includes(course?.course_id) && (
              <div className="mt-4">
                <Typography>Content for....</Typography>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

export default CourseProgressMap