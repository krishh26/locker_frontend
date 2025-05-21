import {
  Card,
  Dialog,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Menu,
  Tooltip,
  Box,
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
  resetCourseData,
} from "app/store/courseManagement";
import FuseLoading from "@fuse/core/FuseLoading";
import Close from "@mui/icons-material/Close";
import Style from "./style.module.css";
import { selectGlobalUser } from "app/store/globalUser";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const CourseBuilder = () => {
  const { dataUpdatingLoadding, meta_data, data, dataFetchLoading } =
    useSelector(selectCourseManagement);
  const dispatch: any = useDispatch();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [coreTypeFilter, setCoreTypeFilter] = useState("");
  const { pagination } = useSelector(selectGlobalUser)

  // Main course types for filtering
  const mainCourseTypes = [
    'Qualification', 'Standard', 'Gateway'
  ];

  // Course type descriptions for tooltips
  const courseTypeDescriptions = {
    'Qualification': 'Create a qualification course with units and criteria',
    'Standard': 'Create a standard course with modules and topics',
    'Gateway': 'Create a gateway course for assessments'
  };

  const fetchCourse = (a = searchKeyword, page = 1, coreType = coreTypeFilter) => {
    dispatch(fetchCourseAPI({ page, page_size: pagination?.page_size }, a, "", coreType));
  }

  useEffect(() => {
    fetchCourse()
  }, [dispatch, pagination]);

  const navigate = useNavigate();

  // State for file upload dialog
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  // State for course type dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateCourse = (courseCoreType = "Qualification") => {
    // Reset course data in Redux store before navigating
    dispatch(resetCourseData());

    // Always include the course core type in the URL as a query parameter
    navigate(`/courseBuilder/course?type=${courseCoreType}`);
    handleMenuClose();
  };

  const searchAPIHandler = () => {
    fetchCourse(searchKeyword, 1, coreTypeFilter);
  };

  const searchByKeywordUser = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      searchAPIHandler();
    }
  };

  const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
    if (e.target.value === "") {
      searchAPIHandler();
    }
  };

  const handleCoreTypeChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setCoreTypeFilter(value);
    fetchCourse(searchKeyword, 1, value);
  };


  const handleChangePage = (_event: unknown, newPage: number) => {
    fetchCourse(searchKeyword, newPage, coreTypeFilter)
  };

  return (
    <>
      <Card className="mx-10 rounded-6" style={{ height: "100%", overflowY: "scroll" }}>
        {/* Always show the search and filter bar */}
        <div className={`m-12 flex items-center justify-between mt-10 ${Style.Search_container}`}>
          <div className="flex items-center gap-4 w-2/3">
            <TextField
              label="Search by keyword"
              fullWidth
              size="small"
              onKeyDown={searchByKeywordUser}
              onChange={searchHandler}
              value={searchKeyword}
              className={`w-1/2 ${Style.Search}`}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {searchKeyword ? (
                      <Close
                        onClick={() => {
                          setSearchKeyword("");
                          fetchCourse("")
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

            <FormControl size="small" className="w-1/3">
              <InputLabel id="core-type-filter-label">Course Core Type</InputLabel>
              <Select
                labelId="core-type-filter-label"
                id="core-type-filter"
                value={coreTypeFilter}
                label="Course Core Type"
                onChange={handleCoreTypeChange}
              >
                <MenuItem value="">All Types</MenuItem>
                {mainCourseTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className={`flex items-center space-x-4 ${Style.button}`}>
            <SecondaryButton
              className="py-6 mr-4"
              name="Upload File"
              startIcon={
                <img
                  src="assets/images/svgimage/uploadfileicon.svg"
                  alt="Create File"
                  className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
                />
              }
              onClick={handleOpen}
            />

            {/* Create Course Button with Dropdown */}
            <Box className={`flex items-center space-x-4 ${Style.button}`}>
              <SecondaryButton
                id="create-course-button"
                name="Create Course"
                className="min-h-[35px]"
                aria-controls={openMenu ? 'create-course-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openMenu ? 'true' : undefined}
                onClick={handleMenuClick}
                startIcon={
                  <img
                    src="assets/images/svgimage/createcourseicon.svg"
                    alt="Create Course"
                    className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
                  />
                }
                endIcon={<KeyboardArrowDownIcon />}
              />
              <Menu
                id="create-course-menu"
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'create-course-button',
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {mainCourseTypes.map((type) => (
                  <Tooltip key={type} title={courseTypeDescriptions[type]} placement="left">
                    <MenuItem onClick={() => handleCreateCourse(type)}>
                      <AddIcon fontSize="small" sx={{ mr: 1 }} />
                      {type}
                    </MenuItem>
                  </Tooltip>
                ))}
              </Menu>
            </Box>
          </div>
        </div>

        {dataFetchLoading ? (
          <FuseLoading />
        ) : data?.length ? (
          <CourseManagementTable
            columns={courseManagementTableColumn}
            rows={data}
            meta_data={meta_data}
            dataUpdatingLoadding={dataUpdatingLoadding}
            handleChangePage={handleChangePage}
          />
        ) : (
          <div className="m-12 p-6 border border-gray-200 rounded-md bg-gray-50">
            <div className="flex flex-col justify-center items-center gap-6 py-10">
              <DataNotFound width="20%" />
              <Typography variant="h5">No courses found</Typography>

              {searchKeyword || coreTypeFilter ? (
                <Typography variant="body2" className="text-center">
                  No courses match your search criteria. Try adjusting your filters or create a new course.
                </Typography>
              ) : (
                <Typography variant="body2" className="text-center">
                  There are no courses available. Get started by creating your first course.
                </Typography>
              )}

              <div className="flex flex-row items-center gap-4 mt-4">
                <SecondaryButton
                  name="Upload File"
                  startIcon={
                    <img
                      src="assets/images/svgimage/uploadfileicon.svg"
                      alt="Create File"
                      className="w-6 h-6 mr-2"
                    />
                  }
                  onClick={handleOpen}
                />

                {/* Create Course Button with Dropdown */}
                  <SecondaryButton
                    id="create-course-button-empty"
                    name="Create Course"
                    className="min-h-[35px]"
                    aria-controls={openMenu ? 'create-course-menu-empty' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMenu ? 'true' : undefined}
                    onClick={handleMenuClick}
                    startIcon={
                      <img
                        src="assets/images/svgimage/createcourseicon.svg"
                        alt="Create Course"
                        className="w-6 h-6 mr-2"
                      />
                    }
                    endIcon={<KeyboardArrowDownIcon />}
                  />
              </div>
            </div>
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
