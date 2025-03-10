import {
  Autocomplete,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  ListItemText,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { Stack } from "@mui/system";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import NorthEastIcon from '@mui/icons-material/NorthEast';
import React, { useEffect, useState } from "react";
import {
  DangerButton,
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "src/app/component/Buttons";
import { TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { tr } from "date-fns/locale";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectUser } from "app/store/userSlice";
import AlertDialog from "src/app/component/Dialogs/AlertDialog";
import FuseLoading from "@fuse/core/FuseLoading";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import { FormBuilder as FormBuilderIo } from "react-formio";
import "formiojs/dist/formio.full.css";
import './style.css'
import { useNavigate } from "react-router-dom";
import { AddUsersToForm, deleteFormHandler, fetchUserAllAPI, getFormDataAPI, getUserFormDataAPI, selectFormData, slice } from "app/store/formData";
import { userTableMetaData } from "src/app/contanst/metaData";
import { UserRole } from "src/enum";
import { fetchUserAPI } from "app/store/userManagement";
import Close from "@mui/icons-material/Close";
import SubmittedForms from "./submittedForms";
import FormBuilder from "./formBuilder";

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

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const { data } = useSelector(selectUser);

  return (
    <>
      <Grid className="m-10" sx={{ minHeight: 600 }}>
        {data.role === "Admin" &&
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
                label="Submitted Form"
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
        }

        <CustomTabPanel value={value} index={0} >
          <FormBuilder />
          {/* <h1>Tab 1</h1> */}
        </CustomTabPanel>

        <CustomTabPanel value={value} index={1}>
          {<SubmittedForms />}
          {/* <h1>Tab 2</h1> */}
        </CustomTabPanel>
      </Grid >
    </>
  );
};

export default Forms;
