import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Stack } from "@mui/system";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AlertDialog from "src/app/component/Dialogs/AlertDialog";
import {
  DangerButton,
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "src/app/component/Buttons";
import {
  createActivityAPI,
  deleteActivityHandler,
  getCpdPlanningAPI,
  selectCpdPlanning,
  slice,
  updateActivityAPI,
  uploadImages,
} from "app/store/cpdPlanning";
import { selectUser } from "app/store/userSlice";
import { Link } from "react-router-dom";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { FileUploader } from "react-drag-drop-files";
import { showMessage } from "app/store/fuse/messageSlice";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import FuseLoading from "@fuse/core/FuseLoading";
import Style from "./style.module.css";
import CustomPagination from "src/app/component/Pagination/CustomPagination";
import { selectGlobalUser } from "app/store/globalUser";

interface Column {
  id:
  | "date"
  | "learning_objective"
  | "activity"
  | "comment"
  | "support_you"
  | "files"
  | "completed"
  | "added_by"
  | "action";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: "date", label: "Date", minWidth: 10 },
  { id: "learning_objective", label: "Learning Objective", minWidth: 10 },
  { id: "activity", label: "Activity", minWidth: 10 },
  { id: "comment", label: "Comment", minWidth: 10 },
  { id: "support_you", label: "Who could support you", minWidth: 10 },
  { id: "files", label: "Files", minWidth: 10 },
  { id: "completed", label: "Completed", minWidth: 10 },
  { id: "added_by", label: "Added By", minWidth: 10 },
  { id: "action", label: "Action", minWidth: 10 },
];

const AddNewDialogContent = (props) => {
  const {
    edit = "Save",
    formData,
    cpdData,
    setActivityData,
    activityData = {},
    handleChangeYear,
  } = props;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setActivityData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTimeTakeChange = (e) => {
    const { name, value } = e.target;
    setActivityData((prev) => ({
      ...prev,
      timeTake: {
        ...prev.timeTake,
        [name]: parseInt(value),
      },
    }));
  };

  const formatDate = (date) => {
    if (!date) return "";
    const formattedDate = date.substr(0, 10);
    return formattedDate;
  };

  const fileTypes = ["PDF"];
  const [files, setFiles] = useState([]);

  const handleFileChange = (newFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const dispatch: any = useDispatch();

  const handleUploadButtonClick = async () => {
    if (files?.length > 5) {
      dispatch(
        showMessage({
          message: "You can only upload up to 5 files.",
          variant: "error",
        })
      );
      return;
    }
    const data = await dispatch(uploadImages(files));

    setActivityData((prevData) => ({
      ...prevData,
      files: [...prevData.files, ...data.data],
    }));
    setFiles([]);
  };

  const handleDelete = (fileToDelete) => () => {
    setActivityData((prevData) => ({
      ...prevData,
      files: prevData.files.filter((file) => file !== fileToDelete),
    }));
  };

  return (
    <>
      <div>
        <Box className="flex flex-col justify-between gap-12">
          <div className="flex flex-row justify-between gap-12 w-full">
            <div className="w-full">
              <Typography
                sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
                className={Style.name}
              >
                Year
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  labelId="year-select-label"
                  id="year-select"
                  name="year"
                  value={activityData?.year}
                  onChange={handleChangeYear}
                  disabled={edit === "view" || edit === "edit"}
                >
                  {cpdData?.length ? (
                    cpdData.map((yearItem) => (
                      <MenuItem key={yearItem.year} value={yearItem.year}>
                        {yearItem.year}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Cpd Data not found.</MenuItem>
                  )}
                </Select>
              </FormControl>
            </div>
            <div className="w-full">
              <Typography
                sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
                className={Style.name}
              >
                Date
              </Typography>
              <TextField
                name="date"
                size="small"
                type="date"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                value={formatDate(activityData?.date)}
                onChange={handleChange}
                disabled={edit === "view"}
              />
            </div>
          </div>
          <div className="w-full">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Learning Objective
            </Typography>
            <TextField
              name="learning_objective"
              size="small"
              placeholder="Lorem ipsum is just dummy context....."
              fullWidth
              multiline
              rows={3}
              value={activityData?.learning_objective}
              onChange={handleChange}
              disabled={edit === "view"}
            />
          </div>
          <div className="w-full">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Activity
            </Typography>
            <TextField
              name="activity"
              size="small"
              placeholder="Lorem ipsum is just dummy context....."
              fullWidth
              multiline
              rows={3}
              value={activityData?.activity}
              onChange={handleChange}
              disabled={edit === "view"}
            />
          </div>
          <div className="w-full">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Comment
            </Typography>
            <TextField
              name="comment"
              size="small"
              placeholder="Lorem ipsum is just dummy context....."
              fullWidth
              multiline
              rows={3}
              value={activityData?.comment}
              onChange={handleChange}
              disabled={edit === "view"}
            />
          </div>
          <div className="w-full">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Who should support you
            </Typography>
            <TextField
              name="support_you"
              size="small"
              placeholder="Lorem ipsum is just dummy context....."
              fullWidth
              multiline
              rows={3}
              value={activityData?.support_you}
              onChange={handleChange}
              disabled={edit === "view"}
            />
          </div>
          <div>
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              How long did it take
            </Typography>
            <Box className="flex justify-between gap-12 sm:flex-row">
              <TextField
                label="day"
                name="day"
                size="small"
                type="number"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                value={activityData?.timeTake?.day}
                onChange={(e) => {
                  const value = Number(e.target.value);

                  if (value < 0 || value > 365) {
                    return;
                  }
                  handleTimeTakeChange(e);
                }}
                disabled={edit === "view"}
              />
              <TextField
                label="hours"
                name="hours"
                size="small"
                type="number"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                value={activityData?.timeTake?.hours}
                onChange={(e) => {
                  const value = Number(e.target.value);

                  if (value < 0 || value > 24) {
                    return;
                  }
                  handleTimeTakeChange(e);
                }}
                disabled={edit === "view"}
              />
              <TextField
                label="minutes"
                name="minutes"
                size="small"
                type="number"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                value={activityData?.timeTake?.minutes}
                onChange={(e) => {
                  const value = Number(e.target.value);

                  if (value < 0 || value > 60) {
                    return;
                  }
                  handleTimeTakeChange(e);
                }}
                disabled={edit === "view"}
              />
            </Box>
          </div>
          <div className="w-full">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Completed
            </Typography>
            <Select
              name="completed"
              value={activityData?.completed}
              onChange={handleChange}
              fullWidth
              size="small"
              displayEmpty
              placeholder="Select"
              disabled={edit === "view"}
            >
              <MenuItem value={"Fully"}>Fully</MenuItem>
              <MenuItem value={"Partially"}>Partially</MenuItem>
              <MenuItem value={"Not at all"}>Not at all</MenuItem>
            </Select>
          </div>
          <Box className="flex justify-between gap-12 sm:flex-row">
            <div className="w-full">
              <Typography
                sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
                className={Style.name}
              >
                Choose resource for activity
              </Typography>

              <FileUploader
                multiple={true}
                children={
                  <div
                    style={{
                      border: "1px dotted lightgray",
                      padding: "1rem",
                      cursor: "pointer",
                    }}
                  >
                    <div className="flex justify-center mt-8">
                      <img
                        src="assets/images/svgImage/uploadimage.svg"
                        alt="Upload"
                        className="w-64 pb-8"
                      />
                    </div>
                    {files?.length > 0 ? (
                      files.map((file, index) => (
                        <p className="text-center mb-4" key={index}>
                          {file.name}
                        </p>
                      ))
                    ) : (
                      <>
                        <p className="text-center mb-4">
                          Drag and drop your files here or{" "}
                          <a className="text-blue-500 font-500 ">Browse</a>
                        </p>
                        <p className="text-center mb-4">
                          Max 10MB files are allowed
                        </p>
                      </>
                    )}
                  </div>
                }
                handleChange={handleFileChange}
                name="file"
                types={fileTypes}
                disabled={edit === "view"}
              />
            </div>
          </Box>
          <div style={{ marginTop: "16px" }}>
            {activityData?.files.map((file, index) => (
              <Chip
                key={index}
                icon={
                  <Link
                    to={file.url}
                    target="_blank"
                    rel="noopener"
                    style={{ border: "0px", backgroundColor: "unset" }}
                  >
                    <FileCopyIcon />
                  </Link>
                }
                label={
                  <Link
                    to={file.url}
                    target="_blank"
                    rel="noopener"
                    style={{ border: "0px", backgroundColor: "unset" }}
                  >
                    {file.key}
                  </Link>
                }
                onDelete={edit !== "view" ? handleDelete(file) : undefined}
                style={{ margin: "4px" }}
              />
            ))}
          </div>
          <div className="w-full mt-4">
            <Button
              variant="contained"
              color="primary"
              onClick={handleUploadButtonClick}
              disabled={files?.length === 0}
            >
              Upload
            </Button>
          </div>
        </Box>
      </div>
    </>
  );
};

const Activity = (props) => {
  const {
    cpdData,
    dialogType,
    dataFetchLoading,
    setDialogType,
    setUpdateData = () => { },
    dataUpdatingLoadding,
    setFormData = () => { },
    learnerId
  } = props;

  const { singleData } = useSelector(selectCpdPlanning);

  const [activityData, setActivityData] = useState({
    year: singleData?.year || "",
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


  const [deleteId, setDeleteId] = useState("");
  const [openMenuDialog, setOpenMenuDialog] = useState<any>({});
  const [edit, setEdit] = useState("save");
  const [open, setOpen] = useState(false);
  const { pagination } = useSelector(selectGlobalUser)

  const [page, setPage] = useState(1);
  const rowsPerPage = pagination.page_size;

  const dispatch: any = useDispatch();
  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;

  const cpdPlanningData = useSelector(selectCpdPlanning);

  const handleChange = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      activities: [...prevFormData.activities, activityData],
    }));
  };

  const isFormValid =
    Object.values(activityData).find((data) => data === "") === undefined;


  const fetchActivityData = () => {
    dispatch(getCpdPlanningAPI(learnerId || user?.user_id, "activities"));
  }

  useEffect(() => {
    fetchActivityData()
  }, [dispatch]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const oopen = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const editIcon = (edit, value) => {
    setEdit(edit);
    setUpdateData(openMenuDialog);
    setOpen(true);

    const singleData = {
      id: openMenuDialog?.id || "",
      year: openMenuDialog?.year || "",
      date: openMenuDialog?.date || "",
      learning_objective: openMenuDialog?.learning_objective || "",
      activity: openMenuDialog?.activity || "",
      comment: openMenuDialog?.comment || "",
      support_you: openMenuDialog?.support_you || "",
      timeTake: {
        day: openMenuDialog?.timeTake?.day || 0,
        hours: openMenuDialog?.timeTake?.hours || 0,
        minutes: openMenuDialog?.timeTake?.minutes || 0,
      },
      completed: openMenuDialog?.completed || "",
      files: openMenuDialog?.files || [],
    };
    setActivityData(singleData);
    dispatch(slice.setCpdSingledata(singleData));
    dispatch(slice.setDialogType(value));
  };

  const [cpdId, setcpdId] = useState("");

  const handleChangeYear = (event) => {
    const { name, value } = event.target;
    setActivityData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    if (name == "year") {
      setcpdId(cpdPlanningData?.data?.find((item) => item?.year === value)?.id);
    }
  };

  const handleSubmit = async () => {
    try {
      let response;
      let id = singleData?.id;
      if (dialogType === "addNew")
        response = await dispatch(
          createActivityAPI({ ...activityData, cpd_id: cpdId })
        );
      else if (edit == "edit")
        response = await dispatch(updateActivityAPI(id, activityData));
    } catch (error) {
      console.error("Error during submission:", error);
    } finally {
      handleClose();
    }
  };

  const deleteIcon = (id) => {
    setDeleteId(id?.id);
  };

  const openMenu = (e, id) => {
    handleClick(e);
    setOpenMenuDialog(id);
  };

  const formatDate = (date) => {
    if (!date) return "";
    const formattedDate = date.substr(0, 10);
    return formattedDate;
  };

  const deleteConfromation = async () => {
    await dispatch(deleteActivityHandler(deleteId));
    setDeleteId("");
  };

  const handleClose = () => {
    dispatch(slice.setCpdSingledata({}));
    setOpen(false);
    setAnchorEl(null);
    setDialogType("");
    setEdit("");

    setActivityData({
      year: "",
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

  useEffect(() => {
    setPage(1);
  }, [rowsPerPage]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  let allActivities = cpdPlanningData.data?.flatMap((item) =>
    item?.activities ? item.activities : []
  );
  const paginatedData = allActivities.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const pageCount = Math.ceil(allActivities?.length / rowsPerPage);
  console.log("page :", page);
  console.log("pages :", pageCount);
  console.log("items :", allActivities?.length);

  return (
    <>
      <div>
        <TableContainer sx={{ minHeight: 580, display: "flex", flexDirection: "column", justifyContent: "space-between" }} className="-m-12">
          {dataFetchLoading ? (
            <FuseLoading />
          ) : paginatedData?.length ? (
            <Table
              sx={{ minWidth: 650, height: "100%" }}
              size="small"
              aria-label="simple table"
            >
              {" "}
              <TableHead>
                <TableRow>
                  {columns?.map((column) => (
                    <TableCell
                      key={column?.id}
                      align={column.align}
                      style={{
                        minWidth: column.minWidth,
                        backgroundColor: "#F8F8F8",
                      }}
                    >
                      {column?.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData?.map((row) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns?.map((column) => {
                      const value = row[column?.id];
                      return (
                        <TableCell key={column?.id} align={column.align}>
                          {column.format && typeof value === "number" ? (
                            column.format(value)
                          ) : column?.id === "action" ? (
                            <IconButton
                              size="small"
                              sx={{ color: "#5B718F", marginRight: "4px" }}
                              onClick={(e) => openMenu(e, row)}
                            >
                              <MoreHorizIcon fontSize="small" />
                            </IconButton>
                          ) : column?.id === "files" ? (
                            <div style={{ display: "flex" }}>
                              <AvatarGroup
                                max={4}
                                className="items-center"
                                sx={{
                                  ".MuiAvatar-root": {
                                    backgroundColor: "#6d81a3",
                                    width: "3.4rem",
                                    height: "3.4rem",
                                    fontSize: "medium",
                                    border: "1px solid #FFFFFF",
                                  },
                                }}
                              >
                                {value.map((file, index) => (
                                  <Link
                                    to={file.url}
                                    target="_blank"
                                    rel="noopener"
                                    style={{
                                      border: "0px",
                                      backgroundColor: "unset",
                                    }}
                                  >
                                    <Avatar>
                                      <FileCopyIcon className="text-white text-xl" />
                                    </Avatar>
                                  </Link>
                                ))}
                              </AvatarGroup>
                            </div>
                          ) : column?.id === "date" ? (
                            formatDate(value)
                          ) : (
                            value
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div>
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
              </div>
            </div>
          )}
          <CustomPagination
            pages={pageCount}
            page={page}
            handleChangePage={handlePageChange}
            items={allActivities?.length}
          />
        </TableContainer>
      </div>
      <AlertDialog
        open={Boolean(deleteId)}
        close={() => deleteIcon("")}
        title="Delete Activity?"
        content="Deleting this activity will also remove all associated data and relationships. Proceed with deletion?"
        className="-224 "
        actionButton={
          dataUpdatingLoadding ? (
            <LoadingButton />
          ) : (
            <DangerButton onClick={deleteConfromation} name="Delete Activity" />
          )
        }
        cancelButton={
          <SecondaryButtonOutlined
            className="px-24"
            onClick={() => deleteIcon("")}
            name="Cancel"
          />
        }
      />
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={oopen}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            editIcon("view", "addNew");
          }}
        >
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            editIcon("edit", "addNew");
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            deleteIcon(openMenuDialog);
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={open || dialogType == "addNew"}
        onClose={handleClose}
        sx={{
          ".MuiDialog-paper": {
            borderRadius: "4px",
            width: "100%",
          },
        }}
      >
        <DialogContent>
          <AddNewDialogContent
            cpdData={cpdData}
            edit={edit}
            setActivityData={setActivityData}
            activityData={activityData}
            dataUpdatingLoadding={dataUpdatingLoadding}
            handleChange={handleChange}
            handleChangeYear={handleChangeYear}
          />
        </DialogContent>

        <Box className="flex items-center justify-end m-12 mt-24">
          <DialogActions>
            {dataUpdatingLoadding ? (
              <LoadingButton />
            ) : (
              <>
                {edit === "view" ? (
                  <SecondaryButtonOutlined
                    name="Cancel"
                    className=" w-1/12"
                    onClick={handleClose}
                  />
                ) : (
                  <SecondaryButtonOutlined
                    name="Cancel"
                    className=" w-1/12"
                    onClick={handleClose}
                  />
                )}
                {edit !== "view" && (
                  <SecondaryButton
                    name={edit === "edit" ? "Update" : "Save"}
                    className=" w-1/12 ml-10"
                    onClick={handleSubmit}
                    disable={!isFormValid}
                  />
                )}
              </>
            )}
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
};

export default Activity;
