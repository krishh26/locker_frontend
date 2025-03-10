import React, { useEffect, useState } from "react";
import {
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "../Buttons";
import { FileUploader } from "react-drag-drop-files";
import { Autocomplete, Box, Paper, TextField, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import {
  fetchCourseAPI,
  selectCourseManagement,
} from "app/store/courseManagement";
import { useSelector } from "react-redux";
import { createResourceAPI } from "app/store/resourcesManagement";
import Style from "./style.module.css";

const ResourceUploadDialog = (props) => {
  const { handleClose } = props.dialogFn;
  const { data } = useSelector(selectCourseManagement);

  const dispatch: any = useDispatch();

  const [units, setUnits] = useState({ units: [] });

  const [resourceData, setResourceData] = useState({
    course_id: "",
    name: "",
    description: "",
    size: "",
    hours: 0,
    minute: 0,
    job_type: "",
    resource_type: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (file) => {
    setFile(file);
    setResourceData((prev) => ({
      ...prev,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
    }));
  };

  useEffect(() => {
    dispatch(fetchCourseAPI());
  }, []);

  const recouseHandler = async () => {
    setLoading(true);
    const formData = new FormData();

    for (const key in resourceData) {
      formData.append(key, resourceData[key]);
    }
    formData.append("file", file);
    const response = await dispatch(createResourceAPI(formData));
    if (response) {
      handleClose();
      setFile(null);
    }
    setLoading(false);
  };
  return (
    <>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded border border-gray-300 max-w-md w-full shadow-md">
        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-full">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Course
            </Typography>

            <Autocomplete
              disableClearable
              fullWidth
              size="small"
              options={data}
              getOptionLabel={(option: any) => option.course_name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select Course"
                  name="role"
                />
              )}
              // onChange={(e, value: any) => setUnits(data.find(item => item.course_id === value.course_id))}
              onChange={(e, value) =>
                setResourceData((prev) => ({
                  ...prev,
                  course_id: value.course_id,
                }))
              }
              sx={{
                ".MuiAutocomplete-clearIndicator": {
                  color: "#5B718F",
                },
              }}
              PaperComponent={({ children }) => (
                <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
              )}
            />

            {/* <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", marginTop: "1rem" }}>Unit</Typography>
            <Autocomplete
              fullWidth
              size="small"
              options={units.units}
              getOptionLabel={(option: any) => option.title}
              renderInput={(params) => <TextField {...params} placeholder="Select Unit" name="role" />}
              onChange={(e, value) => setResourceData((prev) => ({ ...prev, unit_id: value.unit_id }))}
              sx={{
                '.MuiAutocomplete-clearIndicator': {
                  color: "#5B718F"
                }
              }}
              PaperComponent={({ children }) => (
                <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
              )}
            /> */}
          </div>
        </Box>

        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-full">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Choose resource for course
            </Typography>

            <FileUploader
              children={
                <div
                  style={{
                    border: "1px dotted lightgray",
                    padding: "5rem",
                    cursor: "pointer",
                  }}
                >
                  {file ? (
                    <p className="text-center mb-4">{file.name}</p>
                  ) : (
                    <>
                      <p className="text-center mb-4">
                        Drag and drop your files here or{" "}
                        <a className="text-blue-500">Browse</a>
                      </p>
                      <p className="text-center mb-4">
                        Max 10MB files are allowed
                      </p>
                    </>
                  )}
                </div>
              }
              handleChange={handleChange}
              name="file"
            />
          </div>
        </Box>

        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-2/3">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Minimum GLH<sup>*</sup>
            </Typography>
            <div className="flex gap-12">
              <TextField
                name="hours"
                placeholder="Enter hour"
                size="small"
                type="number"
                fullWidth
                className="w-1/2"
                value={resourceData?.hours}
                onChange={(e) => {
                  const value = Number(e.target.value);

                  if (value < 0 || value > 23) {
                    return;
                  }

                  setResourceData((prev) => ({
                    ...prev,
                    [e.target.name]: value,
                  }));
                }}
              />

              <TextField
                name="minute"
                placeholder="Enter minute"
                size="small"
                type="number"
                fullWidth
                className="w-1/2"
                value={resourceData.minute}
                onChange={(e) => {
                  const value = Number(e.target.value);

                  if (value < 0 || value > 59) {
                    return;
                  }

                  setResourceData((prev) => ({
                    ...prev,
                    [e.target.name]: value,
                  }));
                }}
              />
            </div>
          </div>
          <div className="w-1/3">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              On/off the job<sup>*</sup>
            </Typography>
            <Autocomplete
              fullWidth
              size="small"
              options={["On", "Off"].map((option) => option)}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select job" name="role" />
              )}
              onChange={(e, value) =>
                setResourceData((prev) => ({ ...prev, job_type: value }))
              }
              sx={{
                ".MuiAutocomplete-clearIndicator": {
                  color: "#5B718F",
                },
              }}
              PaperComponent={({ children }) => (
                <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
              )}
            />
          </div>
        </Box>

        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-full">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Resource type<sup>*</sup>
            </Typography>
            <Autocomplete
              fullWidth
              size="small"
              options={["PDF", "WORD", "PPT", "Text", "Image"].map(
                (option) => option
              )}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select type" name="role" />
              )}
              onChange={(e, value) =>
                setResourceData((prev) => ({ ...prev, resource_type: value }))
              }
              sx={{
                ".MuiAutocomplete-clearIndicator": {
                  color: "#5B718F",
                },
              }}
              PaperComponent={({ children }) => (
                <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
              )}
            />
          </div>
        </Box>

        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-full">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Description
            </Typography>
            <TextField
              name="description"
              size="small"
              placeholder="Type here..."
              fullWidth
              type="text"
              onChange={(e) =>
                setResourceData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
            />
          </div>
        </Box>

        <div className="flex justify-end mt-4">
          {loading ? (
            <LoadingButton style={{ width: "10rem" }} />
          ) : (
            <>
              <SecondaryButtonOutlined
                name="Cancel"
                style={{ width: "10rem", marginRight: "2rem" }}
                onClick={handleClose}
              />
              <SecondaryButton
                name="Create"
                style={{ width: "10rem" }}
                onClick={recouseHandler}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ResourceUploadDialog;
