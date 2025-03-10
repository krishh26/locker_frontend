import {
  Card,
  Dialog,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { SecondaryButton } from "src/app/component/Buttons";
import CourseUploadDialog from "src/app/component/Dialogs/courseUploadDialog";
import { courseManagementTableColumn } from "src/app/contanst";
import { useSelector } from "react-redux";
import CourseManagementTable from "src/app/component/Table/CourseManagementTable";
import SearchIcon from "@mui/icons-material/Search";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  fetchCourseAPI,
  selectCourseManagement,
} from "app/store/courseManagement";
import FuseLoading from "@fuse/core/FuseLoading";
import Close from "@mui/icons-material/Close";
import Style from "./style.module.css";

const CourseBuilder = () => {
  const { dataUpdatingLoadding, meta_data, data, dataFetchLoading } =
    useSelector(selectCourseManagement);
  const dispatch: any = useDispatch();
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    dispatch(fetchCourseAPI());
  }, []);

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleCreateCourse = () => {
    navigate("/courseBuilder/course");
  };

  const searchAPIHandler = () => {
    dispatch(fetchCourseAPI({ page: 1, page_size: 25 }, searchKeyword));
  };

  const searchByKeywordUser = (e) => {
    if (e.key === "Enter") {
      searchAPIHandler();
    }
  };

  const searchHandler = (e) => {
    setSearchKeyword(e.target.value);
    if (e.target.value === "") {
      searchAPIHandler();
    }
  };

  return (
    <>
      <Card className="mx-10 rounded-6" style={{ height: "100%" }}>
        {data.length || searchKeyword ? (
          <div className={`m-12 flex items-center justify-between mt-10 ${Style.Search_container}`}>
            <TextField
              label="Search by keyword"
              fullWidth
              size="small"
              onKeyDown={searchByKeywordUser}
              onChange={searchHandler}
              value={searchKeyword}
              className={`w-1/4 ${Style.Search}`}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {searchKeyword ? (
                      <Close
                        onClick={() => {
                          setSearchKeyword("");
                          dispatch(
                            fetchCourseAPI({ page: 1, page_size: 25 }, "")
                          );
                        }}
                        sx={{
                          color: "#5B718F",
                          fontSize: 18,
                          cursor: "pointer",
                        }}
                      />
                    ) : (
                      <IconButton
                        id="dashboard-search-events-btn"
                        disableRipple
                        sx={{ color: "#5B718F" }}
                        onClick={() => searchAPIHandler()}
                        size="small"
                      >
                        <SearchIcon fontSize="small" />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />

            <div className={`flex items-center space-x-4 ${Style.button}`}>
              <SecondaryButton
                disable={true}
                className="py-6 mr-4"
                name="Upload Files"
                startIcon={
                  <img
                    src="assets/images/svgimage/uploadfileicon.svg"
                    alt="Create File"
                    className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
                  />
                }
                onClick={handleOpen}
              />
              <SecondaryButton
                className="py-6"
                name="Create Course"
                startIcon={
                  <img
                    src="assets/images/svgimage/createcourseicon.svg"
                    alt="Create File"
                    className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
                  />
                }
                onClick={handleCreateCourse}
              />
            </div>
          </div>
        ) : null}

        {dataFetchLoading ? (
          <FuseLoading />
        ) : data.length ? (
          <CourseManagementTable
            columns={courseManagementTableColumn}
            rows={data}
            meta_data={meta_data}
            dataUpdatingLoadding={dataUpdatingLoadding}
          />
        ) : (
          <div
            className="flex flex-col justify-center items-center gap-10 "
            style={{ height: "94%" }}
          >
            <DataNotFound width="25%" />
            <Typography variant="h5">No data found</Typography>
            <Typography variant="body2" className="text-center">
              It is a long established fact that a reader will be <br />
              distracted by the readable content.
            </Typography>

            {!searchKeyword && (
              <div className="flex items-center space-x-4">
                <Tooltip title="Coming Soon...!">
                  <span>
                    <SecondaryButton
                      disable={true}
                      disableRipple
                      name="Upload Files"
                      startIcon={
                        <img
                          src="assets/images/svgimage/uploadfileicon.svg"
                          alt="Create File"
                          className="w-6 h-6 mr-2 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
                        />
                      }
                      // onClick={handleOpen}
                    />
                  </span>
                </Tooltip>
                <div className="w-48 text-center">OR</div>
                <SecondaryButton
                  name="Create Course"
                  startIcon={
                    <img
                      src="assets/images/svgimage/createcourseicon.svg"
                      alt="Create File"
                      className="w-6 h-6 mr-2 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
                    />
                  }
                  onClick={handleCreateCourse}
                />
              </div>
            )}
          </div>
        )}
      </Card>

      <Dialog
        open={open}
        onClose={handleClose}
        sx={{
          ".MuiDialog-paper": {
            borderRadius: "4px",
            padding: "1rem",
          },
        }}
      >
        <CourseUploadDialog dialogFn={{ handleClose }} />
      </Dialog>
    </>
  );
};

export default CourseBuilder;
