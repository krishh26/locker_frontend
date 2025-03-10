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
  createActivityAPI,
  createCpdPlanningAPI,
  createEvaluationAPI,
  createReflectionAPI,
  selectCpdPlanning,
  updateActivityAPI,
  updateCpdPlanningAPI,
  updateEvaluationAPI,
  updateReflectionsAPI,
} from "app/store/cpdPlanning";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import Style from "./style.module.css"
import { selectstoreDataSlice } from "app/store/reloadData";

// Separate components for dialog content

const ExportPdfDialogContent = () => <div>Hello PDF In Evaluation</div>;

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

const Cpd = (props) => {
  const { edit = "Save" } = props;
  const { data, dataFetchLoading, dataUpdatingLoadding, meta_data } =
    useSelector(selectCpdPlanning);
  const [value, setValue] = useState(0);
  const [dialogType, setDialogType] = useState<string | null>(data.dialogType);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch: any = useDispatch();
  const { singleData } = useSelector(selectCpdPlanning);
  const { user_id } = useSelector(selectstoreDataSlice)

  const [formData, setFormData] = useState({
    year: singleData?.year || "",
    start_date: singleData?.start_date || "",
    end_date: singleData?.end_date || "",
    cpd_plan: singleData?.cpd_plan || "",
    impact_on_you: singleData?.impact_on_you || "",
    impact_on_colleagues: singleData?.impact_on_colleagues || "",
    impact_on_managers: singleData?.impact_on_managers || "",
    impact_on_organisation: singleData?.impact_on_organisation || "",
    activities: [],
    evaluations: [],
    reflections: [],
  });

  const [activityData, setActivityData] = useState({
    cpd_id: singleData?.cpdId || null,
    date: singleData?.date || "",
    learning_objective: singleData?.learning_objective || "",
    activity: singleData?.activity || "",
    comment: singleData?.comment || "",
    support_you: singleData?.support_you || "",
    timeTake: {
      day: singleData?.timeTake?.day || 0,
      hours: singleData?.timeTake?.hours || 0,
      minutes: singleData?.timeTake?.minutes || 0,
    },
    completed: singleData?.completed || "",
    files: singleData?.files || [],
  });

  const handleAddActivity = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      activities: [...prevFormData.activities, activityData],
    }));

    setActivityData({
      cpd_id: cpdId || null,
      date: "",
      learning_objective: "",
      activity: "",
      comment: "",
      support_you: "",
      timeTake: {
        day: 0,
        hours: 0,
        minutes: 0,
      },
      completed: "",
      files: [],
    });
  };

  const [evaluationData, setEvaluationData] = useState({
    cpd_id: singleData?.cpdId || null,
    learning_objective: singleData?.learning_objective || "",
    completed: singleData?.completed || "",
    example_of_learning: singleData?.example_of_learning || "",
    support_you: singleData?.support_you || "",
    feedback: singleData?.feedback || "",
    files: singleData?.files || [],
  });

  const handleAddEvaluation = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      evaluations: [...prevFormData.evaluations, evaluationData],
    }));

    setEvaluationData({
      cpd_id: cpdId || null,
      learning_objective: "",
      completed: "",
      example_of_learning: "",
      support_you: "",
      feedback: "",
      files: [],
    });
  };

  const [reflectionData, setReflectionData] = useState({
    cpd_id: singleData?.cpdId || null,
    learning_objective: singleData?.learning_objective || "",
    what_went_well: singleData?.what_went_well || "",
    differently_next_time: singleData?.differently_next_time || "",
    feedback: singleData?.feedback || "",
    files: singleData?.files || [],
  });

  const handleAddReflection = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      reflections: [...prevFormData.reflections, reflectionData],
    }));

    setReflectionData({
      cpd_id: cpdId || null,
      learning_objective: "",
      what_went_well: "",
      differently_next_time: "",
      feedback: "",
      files: [],
    });
  };

  const [minEndDate, setMinEndDate] = useState("");

  const [cpdId, setcpdId] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    if (name === "start_date") {
      setMinEndDate(value);
    }
    if (name == "year") {
      setcpdId(data.data.find((item) => item.year === value).id);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let response = "";
      let id = singleData.id;
      console.log(id);

      switch (dialogType) {
        case "addPlan":
          if (edit === "Save") {
            response = await dispatch(createCpdPlanningAPI({ ...formData }));
          } else if (edit == "edit") {
            response = await dispatch(updateCpdPlanningAPI({ ...formData }));
          }
          console.log("Submitting Add Plan data:", formData);
          break;
        case "addNew":
          // handleAddActivity()

          if (edit === "Save") {
            response = await dispatch(
              createActivityAPI({ ...activityData, cpd_id: cpdId })
            );
          } else if (edit == "edit") {
            response = await dispatch(updateActivityAPI(id, activityData));
          }
          console.log("Submitting Add New data:", id, activityData);
          break;
        case "addNewEvaluation":
          handleAddEvaluation();

          if (edit === "Save") {
            response = await dispatch(
              createEvaluationAPI({ ...evaluationData, cpd_id: cpdId })
            );
          } else if (edit == "edit") {
            response = await dispatch(updateEvaluationAPI(id, evaluationData));
          }
          console.log("Submitting Add New Evaluation data:", evaluationData);
          break;
        case "exportPdf":
          console.log("Exporting PDF with data:", formData);
          break;
        case "addReflection":
          handleAddReflection();
          if (edit === "Save") {
            response = await dispatch(
              createReflectionAPI({ ...reflectionData, cpd_id: cpdId })
            );
          } else if (edit == "edit") {
            response = await dispatch(updateReflectionsAPI(id, reflectionData));
          }
          console.log("Submitting Add Reflection data:", reflectionData);
          break;
        default:
          break;
      }

      if (response) {
        navigate("/cpd");
      }
    } catch (error) {
      console.error("Error during submission:", error);
    } finally {
      setLoading(false);
      handleClose();
      setcpdId("");
    }
  };

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
            {value === 0 && (
              <SecondaryButton
                className="p-12"
                name="Add Plan"
                startIcon={<AddIcon sx={{ mx: -0.5 }} />}
                onClick={() => handleClickOpen("addPlan")}
              />
            )}
            {value === 1 && (
              <SecondaryButton
                className="p-12"
                name="Add New"
                startIcon={<AddIcon sx={{ mx: -0.5 }} />}
                onClick={() => handleClickOpen("addNew")}
              />
            )}
            {value === 2 && (
              <>
                <SecondaryButton
                  className="p-12"
                  name="Export PDF"
                  startIcon={<AddIcon sx={{ mx: -0.5 }} />}
                  onClick={() => handleClickOpen("exportPdf")}
                />
                <SecondaryButton
                  className="p-12"
                  name="Add New"
                  startIcon={<AddIcon sx={{ mx: -0.5 }} />}
                  onClick={() => handleClickOpen("addNewEvaluation")}
                />
              </>
            )}
            {value === 3 && (
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
            dialogType={dialogType}
            setDialogType={setDialogType}
            dataFetchLoading={dataFetchLoading}
            dataUpdatingLoadding={dataUpdatingLoadding}
            learnerId={user_id}
          />
        </CustomTabPanel>

        <CustomTabPanel value={value} index={2}>
          <Evaluation
            dialogType={dialogType}
            setDialogType={setDialogType}
            dataFetchLoading={dataFetchLoading}
            dataUpdatingLoadding={dataUpdatingLoadding}
            learnerId={user_id}
          />
        </CustomTabPanel>

        <CustomTabPanel value={value} index={3}>
          <Reflection
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
