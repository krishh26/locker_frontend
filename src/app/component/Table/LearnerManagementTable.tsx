import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {
  Autocomplete,
  Avatar,
  AvatarGroup,
  Box,
  Dialog,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Style from "./style.module.css";
import { useDispatch } from "react-redux";
import AlertDialog from "../Dialogs/AlertDialog";
import {
  DangerButton,
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "../Buttons";
import {
  deleteLearnerHandler,
  restoreLearnerHandler,
  selectLearnerManagement,
} from "app/store/learnerManagement";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useSelector } from "react-redux";
import {
  courseAllocationAPI,
  selectCourseManagement,
} from "app/store/courseManagement";
import { useNavigate } from "react-router-dom";
import { slice } from 'app/store/reloadData'
import { getRandomColor, IconsData } from "src/utils/randomColor";
import { FaFolderOpen } from "react-icons/fa";
import { slice as courseSlice } from "app/store/courseManagement";
import { slice as globalSlice } from "app/store/globalUser";
import CustomPagination from "../Pagination/CustomPagination";

export default function LearnerManagementTable(props) {
  const {
    columns,
    rows,
    handleOpen = () => { },
    setUserData = () => { },
    setUpdateData = () => { },
    meta_data,
    dataUpdatingLoadding,
    refetchLearner,
    handleChangePage
  } = props;

  const navigate = useNavigate();
  const [archiveId, setArchiveId] = useState("");
  const [unArchiveId, setUnArchiveId] = useState("");
  const [openMenuDialog, setOpenMenuDialog]: any = useState("");
  const [deletedAt, setDeletedAt] = useState("");
  const [courseDialog, setCourseDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch: any = useDispatch();
  const [courseAllocationData, setCourseAllocationData] = useState({
    course_id: "",
    trainer_id: "",
    IQA_id: "",
    learner_id: "",
    EQA_id: "",
    LIQA_id: "",
    employer_id: "",
    start_date: "",
    end_date: ""
  });

  const handleUpdateData = (name, value) => {
    setCourseAllocationData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const { data } = useSelector(selectCourseManagement);
  const { LIQA, IQA, trainer, employer, EQA } = useSelector(selectLearnerManagement);

  const editIcon = () => {
    setUpdateData(openMenuDialog.learner_id);
    const {
      first_name,
      last_name,
      user_name,
      email,
      password,
      confrimpassword,
      mobile,
      employer_id,
      funding_body,
      national_ins_no,
    } = rows.filter((item) => item.learner_id === openMenuDialog.learner_id)[0];
    setUserData({
      first_name,
      last_name,
      user_name,
      email,
      password,
      confrimpassword,
      mobile,
      employer_id: employer_id?.employer_id,
      funding_body,
      national_ins_no,
    });
    handleOpen();
  };

  const archiveItem = (id) => {
    setArchiveId(id?.learner_id);
  };

  const archiveConfromation = async () => {
    await dispatch(
      deleteLearnerHandler(archiveId)
    );
    refetchLearner()
    setArchiveId("");
  };


  const UnarchiveItem = (id) => {
    setUnArchiveId(id?.learner_id);
  };

  const UnarchiveConfromation = async () => {
    await dispatch(
      restoreLearnerHandler(unArchiveId)
    );

    refetchLearner()
    setUnArchiveId("");
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const openMenu = (e, row) => {
    handleClick(e);
    setOpenMenuDialog(row);
    setDeletedAt(row?.deleted_at)

    setCourseAllocationData((prevState) => ({
      ...prevState,
      "learner_id": row.learner_id,
    }));
  };

  const clsoeCourseDialog = () => {
    setCourseDialog(false);
  };

  const courseAllocation = async () => {
    setLoading(true);
    const response = await dispatch(
      courseAllocationAPI(courseAllocationData)
    );
    if (response) {
      refetchLearner()
      clsoeCourseDialog();
      setOpenMenuDialog("");
      setCourseAllocationData({
        course_id: "",
        trainer_id: "",
        IQA_id: "",
        learner_id: "",
        EQA_id: "",
        LIQA_id: "",
        employer_id: "",
        start_date: "",
        end_date: ""
      });
    }
    setLoading(false);
  };

  const redirection = (row) => {
    dispatch(slice.setLeanerId({ id: row.learner_id, user_id: row.user_id }))
    dispatch(globalSlice.setSelectedUser(row))
    navigate('/portfolio')
  }

  const handleLearnerCourse = (id, user_id, course) => {
    dispatch(slice.setLeanerId({ id, user_id }))
    dispatch(courseSlice.setSingleData(course));
    navigate("/portfolio/learnertodata")
  }

  return (
    <>
      <div style={{ width: "100%", overflow: "hidden", marginTop: "0.5rem" }}>
        <TableContainer sx={{ minHeight: 480, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Table stickyHeader aria-label="sticky table" size="small">
            <TableHead>
              <TableRow>
                {columns?.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sx={{ backgroundColor: "#F8F8F8" }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows?.map((row) => {
                return (
                  <TableRow role="checkbox" tabIndex={-1} key={row.learner_id}>
                    {columns?.map((column) => {
                      const value = row[column.id];
                      if (column.id === "actions") {
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={{ borderBottom: "2px solid #F8F8F8" }}
                          >
                            <IconButton
                              size="small"
                              sx={{ color: "#5B718F", marginRight: "4px" }}
                              onClick={(e) => openMenu(e, row)}
                            >
                              <MoreHorizIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          sx={{ borderBottom: "2px solid #F8F8F8" }}
                        >
                          <div className={Style.avatar}>
                            {column.id === "first_name" ? (
                              <>
                                <Avatar
                                  alt={value}
                                  src={row?.avatar}
                                  sx={{
                                    marginRight: "8px",
                                    width: "24px",
                                    height: "24px",
                                    backgroundColor: getRandomColor(row?.user_name?.toLowerCase().charAt(0))
                                  }}
                                />
                                <div className="hover:text-[#2D6498] cursor-pointer " onClick={() => redirection(row)}>
                                  {value} {row["last_name"]}
                                </div>
                              </>
                            ) : column.id === "course" ? (
                              row?.course && row.course?.length > 0 ? (
                                <AvatarGroup
                                  max={4}
                                  className="items-center gap-8"
                                  sx={{
                                    ".MuiAvatar-root": {
                                      backgroundColor: "#6d81a3",
                                      width: "3rem",
                                      height: "3rem",
                                      fontSize: "medium",
                                      border: "1px solid #FFFFFF",
                                    },
                                  }}>
                                  {row?.course.map((course) => (
                                    <>
                                      <Tooltip key={course.course.course_id} title={course.course.course_name} onClick={() => handleLearnerCourse(row.learner_id, row.user_id, course)}>
                                        {
                                          course.course_status === "Completed" // Course Completed
                                            ?
                                            <Grid className="relative cursor-pointer">
                                              <FaFolderOpen className="text-3xl -rotate-12" style={{ color: IconsData[(IconsData.findIndex((item) => item.name === course.course.course_type))]?.color || "#1d61b5" }} />
                                              <Grid>
                                                <img src="/assets/icons/guy_completed.gif" className="h-20 absolute top-2" />
                                              </Grid>
                                            </Grid> :
                                            course.course_status === "Early Leaver" ? // Early Leaver
                                              <Grid className="relative cursor-pointer">
                                                <FaFolderOpen className="text-3xl -rotate-12" style={{ color: IconsData[(IconsData.findIndex((item) => item.name === course.course.course_type))]?.color || "#1d61b5" }} />
                                                <Grid>
                                                  <img src="/assets/icons/guy_archived.gif" className="h-20 absolute top-2" />
                                                </Grid>
                                              </Grid> :
                                              course.course_status === "Training Suspended" ? // Training Suspended
                                                <Grid className="relative cursor-pointer">
                                                  <FaFolderOpen className="text-3xl -rotate-12" style={{ color: IconsData[(IconsData.findIndex((item) => item.name === course.course.course_type))]?.color || "#1d61b5" }} />
                                                  <Grid>
                                                    <img src="/assets/icons/guy_lock.gif" className="h-20 absolute top-2" />
                                                  </Grid>
                                                </Grid> :
                                                <Grid className="cursor-pointer">
                                                  <FaFolderOpen className="text-3xl -rotate-12" style={{ color: IconsData[(IconsData.findIndex((item) => item.name === course.course.course_type))]?.color || "#1d61b5" }} />
                                                </Grid>
                                        }
                                      </Tooltip>
                                    </>
                                  ))}
                                </AvatarGroup >
                              ) : (
                                <strong>-</strong>
                              )
                            ) : column.id === "status" ? (
                              row.deleted_at ? "Archived" : "Active"
                            ) : (
                              value || "Active"
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <CustomPagination
          pages={meta_data?.pages}
          page={meta_data?.page}
          handleChangePage={handleChangePage}
          items={meta_data?.items}
        />
      </div >
      <AlertDialog
        open={Boolean(archiveId)}
        close={() => archiveItem("")}
        title="Archive Learner?"
        content="Archiving this learner will make their data inactive but retain all associated data and relationships. Proceed with archiving?"
        actionButton={
          dataUpdatingLoadding ? (
            <LoadingButton />
          ) : (
            <DangerButton onClick={archiveConfromation} name="Archive learner" />
          )
        }
        cancelButton={
          <SecondaryButtonOutlined
            className="px-24"
            onClick={() => archiveItem("")}
            name="Cancel"
          />
        }
      />
      <AlertDialog
        open={Boolean(unArchiveId)}
        close={() => UnarchiveItem("")}
        title="Unarchive Learner?"
        content="Unarchiving this learner will reactivate their data and restore all associated data and relationships. Proceed with unarchiving?"
        actionButton={
          dataUpdatingLoadding ? (
            <LoadingButton />
          ) : (
            <DangerButton onClick={UnarchiveConfromation} name="Unarchive learner" />
          )
        }
        cancelButton={
          <SecondaryButtonOutlined
            className="px-24"
            onClick={() => UnarchiveItem("")}
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
        open={open}
        onClose={handleClose}
      >
        {deletedAt === null && <MenuItem
          onClick={() => {
            editIcon();
            handleClose();
          }}
        >
          Edit
        </MenuItem>}
        <MenuItem
          onClick={() => {
            handleClose();
            if (deletedAt === null) {
              archiveItem(openMenuDialog);
            } else {
              UnarchiveItem(openMenuDialog);

            }
          }}
        >
          {deletedAt === null ? "Archive" : "Unarchive"}
        </MenuItem>

        {deletedAt === null && <MenuItem
          onClick={() => {
            handleClose();
            setCourseDialog(true);
          }}
        >
          Course Allocation
        </MenuItem>}
      </Menu >

      <Dialog
        open={courseDialog}
        onClose={clsoeCourseDialog}
        sx={{
          ".MuiDialog-paper": {
            borderRadius: "4px",
            padding: "1rem",
            width: "440px",
          },
        }}
      >
        <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-full">
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }} className={Style.name}>
              Select Course
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
                  value={courseAllocationData?.course_id}
                />
              )}
              onChange={(e, value: any) =>
                handleUpdateData("course_id", value.course_id)
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
        <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-full">
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }} className={Style.name}>
              Trainer
            </Typography>
            <Autocomplete
              disableClearable
              fullWidth
              size="small"
              options={trainer}
              getOptionLabel={(option: any) => option.user_name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select Trainer"
                  name="role"
                  value={courseAllocationData?.trainer_id}
                />
              )}
              onChange={(e, value: any) =>
                handleUpdateData("trainer_id", value.user_id)
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
        <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-full">
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }} className={Style.name}>
              IQA
            </Typography>
            <Autocomplete
              disableClearable
              fullWidth
              size="small"
              options={IQA}
              getOptionLabel={(option: any) => option.user_name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select IQA"
                  name="role"
                  value={courseAllocationData?.IQA_id}
                />
              )}
              onChange={(e, value: any) =>
                handleUpdateData("IQA_id", value.user_id)
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
        <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-full">
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }} className={Style.name}>
              LIQA
            </Typography>
            <Autocomplete
              disableClearable
              fullWidth
              size="small"
              options={LIQA}
              getOptionLabel={(option: any) => option.user_name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select LIQA"
                  name="role"
                  value={courseAllocationData?.LIQA_id}
                />
              )}
              onChange={(e, value: any) =>
                handleUpdateData("LIQA_id", value.user_id)
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
        <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-full">
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }} className={Style.name}>
              EQA
            </Typography>
            <Autocomplete
              disableClearable
              fullWidth
              size="small"
              options={EQA}
              getOptionLabel={(option: any) => option.user_name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select EQA"
                  name="role"
                  value={courseAllocationData?.EQA_id}
                />
              )}
              onChange={(e, value: any) =>
                handleUpdateData("EQA_id", value.user_id)
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
        <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-full">
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }} className={Style.name}>
              Employer
            </Typography>
            <Autocomplete
              disableClearable
              fullWidth
              size="small"
              options={employer}
              getOptionLabel={(option: any) => option.employer?.employer_name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select Employer"
                  name="role"
                  value={courseAllocationData?.employer_id}
                />
              )}
              onChange={(e, value: any) =>
                handleUpdateData("employer_id", value.user_id)
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
        <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-full">
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }} className={Style.name}>
              Start Date
            </Typography>
            <TextField
              name="start_date"
              value={courseAllocationData?.start_date}
              size="small"
              type='date'
              required
              fullWidth
              onChange={(e) => setCourseAllocationData({
                ...courseAllocationData,
                start_date: e.target.value
              })}
            />

          </div>
        </Box>
        <Box className="m-4 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-full">
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }} className={Style.name}>
              End Date
            </Typography>
            <TextField
              name="end_date"
              value={courseAllocationData?.end_date}
              size="small"
              type='date'
              required
              fullWidth
              onChange={(e) => setCourseAllocationData({
                ...courseAllocationData,
                end_date: e.target.value
              })}
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
                onClick={clsoeCourseDialog}
              />
              <SecondaryButton
                name="Allocate"
                style={{ width: "10rem" }}
                onClick={courseAllocation}
              />
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}
