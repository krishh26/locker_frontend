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
  Box,
  Dialog,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
import Style from "./style.module.css";
import { useDispatch } from "react-redux";
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
  fetchLearnerAPI,
  selectLearnerManagement,
} from "app/store/learnerManagement";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useSelector } from "react-redux";
import {
  courseAllocationAPI,
  selectCourseManagement,
} from "app/store/courseManagement";
import { Stack } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { slice } from 'app/store/reloadData'
import { getRandomColor } from "src/utils/randomColor";


export default function LearnerManagementTable(props) {
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

  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState("");
  const [openMenuDialog, setOpenMenuDialog] = useState("");
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
  });

  const handleUpdateData = (name, value) => {
    setCourseAllocationData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const { data } = useSelector(selectCourseManagement);
  const { LIQA, IQA, trainer, employer, EQA } = useSelector(selectLearnerManagement);

  const handleChangePage = (event: unknown, newPage: number) => {
    dispatch(
      fetchLearnerAPI({ page: newPage, page_size: userTableMetaData.page_size })
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
    setCourseAllocationData((prevState) => ({
      ...prevState,
      "learner_id": id,
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
      });
    }
    setLoading(false);
  };

  const redirection = (id, user_id) => {
    dispatch(slice.setLeanerId({ id, user_id }))
    navigate('/portfolio')
  }
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
                              onClick={(e) => openMenu(e, row.learner_id)}
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
                                <div onClick={() => redirection(row.learner_id, row.user_id)}>
                                  {value} {row["last_name"]}
                                </div>
                                {/* <Link to="/portfolio" style={{ color: "inherit", textDecoration: "none" }}> */}
                                {/* </Link> */}
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
