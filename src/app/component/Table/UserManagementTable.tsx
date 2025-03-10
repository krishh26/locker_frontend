import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Avatar, IconButton, Pagination } from "@mui/material";
import Style from "./style.module.css";
import { useDispatch } from "react-redux";
import { deleteUserHandler, fetchUserAPI } from "app/store/userManagement";
import { userTableMetaData } from "src/app/contanst/metaData";
import AlertDialog from "../Dialogs/AlertDialog";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useSelector } from "react-redux";
import {
  Menu,
  MenuItem,
  Dialog,
  Typography,
  TextField,
  Autocomplete,
  Box,
} from "@mui/material";
import {
  DangerButton,
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "../Buttons";
import {
  courseAllocationAPI,
  selectCourseManagement,
} from "app/store/courseManagement";
import { Stack } from "@mui/system";
import { getRandomColor } from "src/utils/randomColor";

export default function UserManagementTable(props) {
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
  const [courseDialog, setCourseDialog] = useState(false);
  const [couseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch: any = useDispatch();

  const { data } = useSelector(selectCourseManagement);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  const handleChangePage = (event: unknown, newPage: number) => {
    dispatch(
      fetchUserAPI({ page: newPage, page_size: userTableMetaData.page_size })
    )
  };

  const openMenu = (e, id) => {
    handleClick(e);
    setOpenMenuDialog(id);
  };

  const editIcon = () => {
    setUpdateData(openMenuDialog);
    const {
      first_name,
      last_name,
      user_name,
      email,
      sso_id,
      mobile,
      phone,
      roles,
      time_zone,
    } = rows.filter((item) => item.user_id === openMenuDialog)[0];
    setUserData({
      first_name,
      last_name,
      user_name,
      email,
      sso_id,
      mobile,
      phone,
      role: roles,
      time_zone,
    });
    handleOpen();
  };

  const deleteIcon = (id) => {
    setDeleteId(id);
  };

  const clsoeCourseDialog = () => {
    setCourseDialog(false);
  };

  const deleteConfromation = async () => {
    await dispatch(
      deleteUserHandler(deleteId, meta_data, search_keyword, search_role)
    );
    setDeleteId("");
  };

  const courseAllocation = async () => {
    setLoading(true);
    const response = await dispatch(
      courseAllocationAPI({ course_id: couseId, user_id: openMenuDialog })
    );
    if (response) {
      clsoeCourseDialog();
      setOpenMenuDialog("");
      setCourseId("");
    }
    setLoading(false);
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
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.user_id}
                  >
                    {columns?.map((column) => {
                      const value = row[column.id];
                      if (column.id === "actions") {
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={{ borderBottom: "2px solid #F8F8F8" }}
                          >
                            {/* <IconButton
                              size="small"
                              sx={{ color: "#5B718F", marginRight: "4px" }}
                              onClick={() => editIcon(row.user_id)}
                            >
                              <ModeEditOutlineOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: "maroon", marginLeft: "4px" }}
                              onClick={() => deleteIcon(row.user_id)}
                            >
                              <DeleteOutlineOutlinedIcon fontSize="small" />
                            </IconButton> */}
                            <IconButton
                              size="small"
                              sx={{ color: "#5B718F", marginRight: "4px" }}
                              onClick={(e) => openMenu(e, row.user_id)}
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
                                  src={row?.avatar?.url}
                                  sx={{
                                    marginRight: "8px",
                                    width: "24px",
                                    height: "24px",
                                    backgroundColor: getRandomColor(row?.user_name?.toLowerCase().charAt(0))
                                  }}
                                />
                                {value} {row["last_name"]}
                              </>
                            ) : column.id === "roles" ? (
                              row?.roles?.join(", ")
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
          <div className="absolute bottom-0 left-0 w-full flex justify-center py-4 mb-14">
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
        </TableContainer>
      </div>
      <AlertDialog
        open={Boolean(deleteId)}
        close={() => deleteIcon("")}
        title="Delete user?"
        content="Deleting this user will also remove all associated data and relationships. Proceed with deletion?"
        actionButton={
          dataUpdatingLoadding ? (
            <LoadingButton />
          ) : (
            <DangerButton onClick={deleteConfromation} name="Delete user" />
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
        <Typography variant="h6">Course Allocation</Typography>
        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
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
                />
              )}
              onChange={(e, value: any) => setCourseId(value.course_id)}
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
