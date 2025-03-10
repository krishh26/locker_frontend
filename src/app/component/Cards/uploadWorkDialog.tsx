import React, { useEffect, useState } from "react";
import {
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "../Buttons";
import { FileUploader } from "react-drag-drop-files";
import { useDispatch } from "react-redux";
import {
  fetchCourseAPI,
  jsonConverter,
  selectCourseManagement,
} from "app/store/courseManagement";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAssignmentAPI, selectAssignment, slice, uploadPDF } from "app/store/assignment";
import { Grid, MenuItem, Select, Typography } from "@mui/material";

const UploadWorkDialog = (props) => {
  const { handleClose } = props.dialogFn || {};
  const { dataUpdatingLoadding } = useSelector(selectAssignment);
  const dispatch: any = useDispatch();
  const navigate = useNavigate();

  const fileTypes = ["PDF"];
  const [file, setFile] = useState(null);

  const [courseId, setCourseId] = useState('');

  const handleCourseChange = (event) => {
    const courseId = event.target.value;
    setCourseId(courseId);
  };

  const handleChange = (file) => {
    setFile(file);
  };

  const uploadHandler = async () => {
    const fromData = new FormData();
    fromData.append("file", file);
    fromData.append("course_id", courseId);

    const response = await dispatch(createAssignmentAPI(fromData));
    if (response) {
      navigate("/portfolio/newassignment");
      
    };
  }

  useEffect(() => {
    dispatch(fetchCourseAPI());
  }, []);

  const { data } = useSelector(selectCourseManagement);
  console.log(data);


  return (
    <>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded border border-gray-300 max-w-md w-full shadow-md">
        <Grid className='w-full pb-10'>
          <Typography className="font-semibold mb-2 ">Select Course</Typography>
          <Select
            name="course_id"
            value={courseId}
            size="small"
            placeholder='Select Course'
            required
            fullWidth
            onChange={handleCourseChange}
          >
            {data?.map(data => (
              <MenuItem key={data.id} value={data.course_id}>
                {data.course_name}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        <div className="font-semibold mb-2">Upload Your Files</div>

        <FileUploader
          children={
            <div
              style={{
                border: "1px dotted lightgray",
                padding: "5rem",
                cursor: "pointer",
              }}
            >
              <div className="flex justify-center mt-8">
                <img
                  src="assets/images/svgImage/uploadimage.svg"
                  alt="Alert"
                  className="w-36"
                />
              </div>
              {file ? (
                <p className="text-center mb-4">{file.name}</p>
              ) : (
                <>
                  <p className="text-center mb-4">
                    Drag and drop your files here or{" "}
                    <a className="text-blue-500">Browse</a>
                  </p>
                  <p className="text-center mb-4">Max 10MB files are allowed</p>
                </>
              )}
            </div>
          }
          handleChange={handleChange}
          name="file"
          types={fileTypes}
        />
        <div className="flex justify-end mt-4">
          {dataUpdatingLoadding ? (
            <LoadingButton style={{ width: "10rem" }} />
          ) : (
            <>
              <SecondaryButtonOutlined
                name="Cancel"
                style={{ width: "10rem", marginRight: "2rem" }}
                onClick={handleClose}
              />
              <SecondaryButton
                name="Upload"
                style={{ width: "10rem" }}
                onClick={uploadHandler}
                disable={!file}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadWorkDialog;
