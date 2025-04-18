import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Planning from "./planning";
import Activity from "./activity";
import Evaluation from "./evaluation";
import Reflection from "./reflection";
import {
  SecondaryButton,
} from "src/app/component/Buttons";
import {
  selectCpdPlanning,
} from "app/store/cpdPlanning";
import { useSelector } from "react-redux";
import Style from "./style.module.css"
import { selectstoreDataSlice } from "app/store/reloadData";
import { selectGlobalUser } from "app/store/globalUser";
import { UserRole } from "src/enum";

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
        <Box sx={{ p: 3 }}>
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

const Cpd = () => {
  const { data, dataFetchLoading, dataUpdatingLoadding } = useSelector(selectCpdPlanning);
  const [value, setValue] = useState(0);
  const [dialogType, setDialogType] = useState<string | null>(data.dialogType);
  const { user_id } = useSelector(selectstoreDataSlice)
  const { currentUser } = useSelector(selectGlobalUser);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleClickOpen = (type) => {
    setDialogType(type);
  };

  const handleClose = () => {
    setDialogType(null);
  };

  return (
    <div>
      <Box sx={{ width: "100%" }}>
        <Box
          className={Style.tabs}
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
              label="Planning"
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
              label="Activity"
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
              label="Evaluation"
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
            <Tab
              label="Reflection"
              {...a11yProps(3)}
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

          <div className={`flex space-x-4 mr-12 ${Style.addplan_btn}`}>
            {(value === 0 && user_id === null && currentUser?.role === UserRole.Learner) && (
              <SecondaryButton
                className="p-12"
                name="Add Plan"
                startIcon={<AddIcon sx={{ mx: -0.5 }} />}
                onClick={() => handleClickOpen("addPlan")}
              />
            )}
            {(value === 1 && user_id === null && currentUser?.role === UserRole.Learner) && (
              <SecondaryButton
                className="p-12"
                name="Add New"
                startIcon={<AddIcon sx={{ mx: -0.5 }} />}
                onClick={() => handleClickOpen("addNew")}
              />
            )}
            {(value === 2 && user_id === null) && (
              <>
                <SecondaryButton
                  className="p-12"
                  name="Export PDF"
                  startIcon={<AddIcon sx={{ mx: -0.5 }} />}
                  onClick={() => handleClickOpen("exportPdf")}
                />
                {currentUser?.role === UserRole.Learner && <SecondaryButton
                  className="p-12"
                  name="Add New"
                  startIcon={<AddIcon sx={{ mx: -0.5 }} />}
                  onClick={() => handleClickOpen("addNewEvaluation")}
                />}
              </>
            )}
            {(value === 3 && user_id === null && currentUser?.role === UserRole.Learner) && (
              <SecondaryButton
                className="p-12"
                name="Add Reflection"
                startIcon={<AddIcon sx={{ mx: -0.5 }} />}
                onClick={() => handleClickOpen("addReflection")}
              />
            )}
          </div>
        </Box>

        <CustomTabPanel value={value} index={0}>
          <Planning
            dialogType={dialogType}
            setDialogType={setDialogType}
            dataFetchLoading={dataFetchLoading}
            dataUpdatingLoadding={dataUpdatingLoadding}
            learnerId={user_id}
          />
        </CustomTabPanel>

        <CustomTabPanel value={value} index={1}>
          <Activity
            cpdData={data}
            dialogType={dialogType}
            setDialogType={setDialogType}
            dataFetchLoading={dataFetchLoading}
            dataUpdatingLoadding={dataUpdatingLoadding}
            learnerId={user_id}
          />
        </CustomTabPanel>

        <CustomTabPanel value={value} index={2}>
          <Evaluation
            cpdData={data}
            dialogType={dialogType}
            setDialogType={setDialogType}
            dataFetchLoading={dataFetchLoading}
            dataUpdatingLoadding={dataUpdatingLoadding}
            learnerId={user_id}
          />
        </CustomTabPanel>

        <CustomTabPanel value={value} index={3}>
          <Reflection
            cpdData={data}
            dialogType={dialogType}
            setDialogType={setDialogType}
            dataFetchLoading={dataFetchLoading}
            dataUpdatingLoadding={dataUpdatingLoadding}
            learnerId={user_id}
          />
        </CustomTabPanel>
      </Box>
    </div>
  );
};

export default Cpd;
