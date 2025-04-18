import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';
import React, { useState } from 'react'
import CourseData from './courseData';
import AssignmentData from './assignmentData';
import ResourseData from './resourse';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { Link, useNavigate } from 'react-router-dom';
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const LearnerToData = () => {

  const navigate = useNavigate();

  const [value, setValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleBack = () => {
    navigate(-1);
  };
  return (
    <>
      <Grid className="m-10" sx={{ minHeight: 600 }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Tabs
            value={value}
            onChange={handleTabChange}
            aria-label="basic tabs example"
            className="border-1 m-12 rounded-md"
            sx={{
              "& .MuiTabs-indicator": {
                display: "none",
              },
            }}
          >
            <Tab
              label="Course"
              {...a11yProps(0)}
              sx={{
                borderRight: "1px solid #e5e7eb",
                "&:last-child": { borderRight: "none" },
                "&:hover": {
                  backgroundColor: "#6D81A3",
                  color: "#ffffff",
                  borderRadius: "0px",
                },
                "&.Mui-selected": {
                  backgroundColor: "#6D81A3",
                  color: "#ffffff",
                  borderRadius: "0px",
                },
              }}
            />
            <Tab
              label="Assignment"
              {...a11yProps(1)}
              sx={{
                borderRight: "1px solid #e5e7eb",
                "&:last-child": { borderRight: "none" },
                "&.Mui-selected": {
                  backgroundColor: "#6D81A3",
                  color: "#ffffff",
                  borderRadius: "0px",
                },
              }}
            />
            <Tab
              label="Resources"
              {...a11yProps(1)}
              sx={{
                borderRight: "1px solid #e5e7eb",
                "&:last-child": { borderRight: "none" },
                "&.Mui-selected": {
                  backgroundColor: "#6D81A3",
                  color: "#ffffff",
                  borderRadius: "0px",
                },
              }}
            />
          </Tabs>
          <button onClick={handleBack} className='mb-10 text-[#5b718f]'>
            <KeyboardBackspaceIcon /> Back
          </button>
        </Box>

        <CustomTabPanel value={value} index={0} >
          <CourseData />
          {/* <h1>Course</h1> */}
        </CustomTabPanel>

        <CustomTabPanel value={value} index={1}>
          {<AssignmentData />}
          {/* <h1>Assignment</h1> */}
        </CustomTabPanel>

        <CustomTabPanel value={value} index={2}>
          {<ResourseData />}
          {/* <h1>Resources</h1> */}
        </CustomTabPanel>
      </Grid >
    </>
  )
}

export default LearnerToData;