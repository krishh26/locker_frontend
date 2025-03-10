import React, { useEffect, useState } from "react";
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
  Box,
  Dialog,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Style from "./style.module.css";
import { useDispatch } from "react-redux";
import { deleteUserHandler, fetchUserAPI } from "app/store/userManagement";
import { userTableMetaData } from "src/app/contanst/metaData";
import AlertDialog from "../Dialogs/AlertDialog";
import {
  DangerButton,
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "../Buttons";
import {
  deleteLearnerHandler,
  getRoleAPI,
  selectLearnerManagement,
  slice,
} from "app/store/learnerManagement";
import {slice as globalSlice} from "app/store/globalUser"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useSelector } from "react-redux";
import {
  courseAllocationAPI,
  selectCourseManagement,
} from "app/store/courseManagement";
import { Stack } from "@mui/system";
import { Link } from "react-router-dom";
import { color } from "framer-motion";
import { getRandomColor } from "src/utils/randomColor";

export default function LearnerTable(props) {
  const {
    columns,
    rows,
    handleOpen = () => { },
    setUserData = () => { },
    setUpdateData = () => { },
    meta_data,
    dataUpdatingLoadding,
    search_keyword = "",
    search_role = "",
  } = props;

  const [deleteId, setDeleteId] = useState("");
  const [openMenuDialog, setOpenMenuDialog] = useState("");
  const [couseId, setCourseId] = useState("");
  const [courseDialog, setCourseDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch: any = useDispatch();
  const [courseAllocationData, setCourseAllocationData] = useState({
    course_id: "",
    trainer_id: "",
    IQA_id: "",
    learner_id: "",
    EQA_id: "",
    employer_id: "",
  });

  const handleUpdateData = (name, value) => {
    setCourseAllocationData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const { data } = useSelector(selectCourseManagement);
  const learner = useSelector(selectLearnerManagement)?.data;
  const trainer = useSelector(selectLearnerManagement)?.trainer;
  const IQA = useSelector(selectLearnerManagement)?.IQA;
  const EQA = useSelector(selectLearnerManagement)?.EQA;
  const employer = useSelector(selectLearnerManagement)?.employer;

  const handleChangePage = (event: unknown, newPage: number) => {
    dispatch(
      fetchUserAPI({ page: newPage, page_size: userTableMetaData.page_size })
    );
  };

  const editIcon = () => {
    setUpdateData(openMenuDialog);
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
    } = rows.filter((item) => item.learner_id === openMenuDialog)[0];
    setUserData({
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
    });
    handleOpen();
  };

  const deleteIcon = (id) => {
    setDeleteId(id);
  };

  const deleteConfromation = async () => {
    await dispatch(
      deleteLearnerHandler(deleteId, meta_data, search_keyword, search_role)
    );
    setDeleteId("");
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const openMenu = (e, id) => {
    handleClick(e);
    setOpenMenuDialog(id);
  };

  const clsoeCourseDialog = () => {
    setCourseDialog(false);
  };

  const courseAllocation = async () => {
    // setLoading(true);
    // const response = await dispatch(
    // courseAllocationAPI({ course_id: couseId, learner_id: openMenuDialog })
    // );
    // if (response) {
    //   clsoeCourseDialog();
    //   setOpenMenuDialog("");
    //   setCourseId("");
    // }
    // setLoading(false);
    console.log(courseAllocationData);
  };

  const handleClickData = (event, row) => {
    console.log(row, "++++_+_+++++++++++++++++++++")
    dispatch(globalSlice.setSelectedUser(row))
    dispatch(slice.setSingleData(row));
  };

  return (
    <>
      <div style={{ width: "100%", overflow: "hidden", marginTop: "0.5rem" }}>
        <TableContainer sx={{ maxHeight: 530, minHeight: 530 }}>
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
                                  src={row?.avatar?.url}
                                  sx={{
                                    marginRight: "8px",
                                    width: "24px",
                                    height: "24px",
                                    backgroundColor: getRandomColor(row?.user_name?.toLowerCase().charAt(0))
                                  }}
                                />
                                <Link
                                  to="/portfolio"
                                  style={{
                                    color: "inherit",
                                    textDecoration: "none",
                                  }}
                                  onClick={(e) => handleClickData(e, row)}
                                >
                                  {value} {row["last_name"]}
                                </Link>
                              </>
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
        <Stack
          spacing={2}
          className="flex justify-center items-center w-full mt-14"
        >
          <Pagination
            count={meta_data?.pages}
            page={meta_data?.page}
            variant="outlined"
            onChange={handleChangePage}
            shape="rounded"
            siblingCount={1}
            boundaryCount={1}
          />
        </Stack>
      </div>
      <AlertDialog
        open={Boolean(deleteId)}
        close={() => deleteIcon("")}
        title="Delete learner?"
        content="Deleting this learner will also remove all associated data and relationships. Proceed with deletion?"
        actionButton={
          dataUpdatingLoadding ? (
            <LoadingButton />
          ) : (
            <DangerButton onClick={deleteConfromation} name="Delete learner" />
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
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            editIcon();
            handleClose();
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
        <MenuItem
          onClick={() => {
            handleClose();
            setCourseDialog(true);
          }}
        >
          Course Allocation
        </MenuItem>
      </Menu>

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
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Select Courseee
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
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
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
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
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
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              LIQA
            </Typography>
            <Autocomplete
              disableClearable
              fullWidth
              size="small"
              options={learner}
              getOptionLabel={(option: any) => option.user_name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select Learner"
                  name="role"
                  value={courseAllocationData?.learner_id}
                />
              )}
              onChange={(e, value: any) =>
                handleUpdateData("learner_id", value.learner_id)
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
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
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
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
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
