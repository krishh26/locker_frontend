import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import TNAUnits from './tnaUnits';
import TNAQuestionaire from './tnaQuestionaire';
import ViewResults from './viewResults';
import { useDispatch } from 'react-redux';
import { getLearnerDetails } from 'app/store/learnerManagement';
import { useSelector } from 'react-redux';
import { selectGlobalUser } from 'app/store/globalUser';

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

const SkillsScan = () => {

  const [value, setValue] = useState(0);
  const dispatch: any = useDispatch();
  const selectedUser = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectGlobalUser)?.selectedUser;

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (selectedUser?.learner_id)
      dispatch(getLearnerDetails(selectedUser.learner_id))
  }, [selectedUser])

  return (
    <>
      <Grid className="m-10" sx={{ minHeight: 600 }}>
        <Typography className='h1 pl-10'>{selectedUser?.first_name + " " + selectedUser?.last_name}</Typography>
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
              label="Step 1: Choose TNA units"
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
              label="Step 2: TNA Questionaire"
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
              label="Step 3: View Results"
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
        </Box>

        <CustomTabPanel value={value} index={0} >
          <TNAUnits handleTabChange={handleTabChange} />
          {/* <h1>TNA units</h1> */}
        </CustomTabPanel>

        <CustomTabPanel value={value} index={1} >
          {<TNAQuestionaire handleTabChange={handleTabChange} />}
          {/* <h1>TNA Questionaire</h1> */}
        </CustomTabPanel>

        <CustomTabPanel value={value} index={2}>
          {<ViewResults />}
          {/* <h1>View Results</h1> */}
        </CustomTabPanel>
      </Grid >
    </>
  )
}

export default SkillsScan