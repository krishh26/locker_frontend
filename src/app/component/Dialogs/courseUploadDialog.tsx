import React, { useState } from "react";
import {
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "../Buttons";
import { FileUploader } from "react-drag-drop-files";
import { useDispatch } from "react-redux";
import {
  jsonConverter,
  selectCourseManagement,
} from "app/store/courseManagement";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import samplePDF from "./sample.pdf";

const CourseUploadDialog = (props) => {
  const { handleClose } = props.dialogFn;
  const { dataUpdatingLoadding } = useSelector(selectCourseManagement);
  const dispatch: any = useDispatch();
  const navigate = useNavigate();

  const fileTypes = ["PDF"];
  const [file, setFile] = useState(null);
  const handleChange = (file) => {
    setFile(file);
    console.log(file);
  };

  const uploadHandler = async () => {
    const fromData = new FormData();
    fromData.append("pdf", file);

    const response = await dispatch(jsonConverter(fromData));
    if (response) {
      navigate("/courseBuilder/course");
    }
  };

  function handleDivClick() {
    window.open(samplePDF, "_blank"); // Open the PDF file in a new tab
  }

  return (
    <>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded border border-gray-300 max-w-md w-full shadow-md">
        <div className="font-bold mb-2">Upload Your Files</div>
        <p className="mb-2">You can upload only one PDF file</p>

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
        <div className="mt-4 pt-4">
          <p className="font-bold">Sample File:</p>
          <div className="flex items-center justify-between mt-2 mb-10 cursor-pointer">
            <div
              className="flex items-center border-1 w-full p-4"
              onClick={handleDivClick}
            >
              <img
                src="assets/images/svgImage/samplepdf.svg"
                alt="PDF"
                className="w-36 mr-2"
              />
              <div>
                <p>Sample File</p>
                <p className="text-sm">
                  This file contains important information about which format
                  will support.{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
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
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CourseUploadDialog;
