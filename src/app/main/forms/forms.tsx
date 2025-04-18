import React, { useState } from "react";
import { Grid, Tab, Tabs, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectUser } from "app/store/userSlice";
import "formiojs/dist/formio.full.css";
import './style.css'
import { slice } from "app/store/formData";
import SubmittedForms from "./submittedForms";
import FormBuilder from "./formBuilder";
import Templates from "./tamplates";

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
        <Box >
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

const Forms = (props) => {
  const [value, setValue] = useState(0);
  const dispatch = useDispatch();

  const handleTabChange = (event, newValue) => {
    dispatch(slice.storeFormData({ data: {}, mode: "" }))
    setValue(newValue);
  };

  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;


  return (
    <>
      <Grid className="m-10" sx={{ minHeight: 600 }}>
        {user?.role === "Admin" &&
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
                label="Form bulider"
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
                label="Templates"
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
                label="Submitted Form"
                {...a11yProps(2)}
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
        }

        <CustomTabPanel value={value} index={0} >
          <FormBuilder />
          {/* <h1>Tab 1</h1> */}
        </CustomTabPanel>

        <CustomTabPanel value={value} index={1}>
          <Templates />
        </CustomTabPanel>

        <CustomTabPanel value={value} index={2}>
          {<SubmittedForms />}
          {/* <h1>Tab 2</h1> */}
        </CustomTabPanel>

      </Grid >
    </>
  );
};

export default Forms;
