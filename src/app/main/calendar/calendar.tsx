import FuseLoading from "@fuse/core/FuseLoading";
import {
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  DangerButton,
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "src/app/component/Buttons";
import AlertDialog from "src/app/component/Dialogs/AlertDialog";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import NewSession from "../portfolio/newsession";
import {
  deleteSessionHandler,
  getSessionAPI,
  selectSession,
  slice,
  updateSessionAPI,
} from "app/store/session";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import { selectUser } from "app/store/userSlice";
import { selectGlobalUser } from "app/store/globalUser";
import CustomPagination from "src/app/component/Pagination/CustomPagination";
import { getRoleAPI, selectLearnerManagement } from "app/store/learnerManagement";

const Calendar = () => {
  const dispatch: any = useDispatch();

  const session = useSelector(selectSession);
  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;
  const { trainer } = useSelector(selectLearnerManagement);
  const { pagination } = useSelector(selectGlobalUser);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [dialogType, setDialogType] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [filter, setfilter] = useState({
    Attended: "",
    trainer_id: "",
  })

  const fetchSessionData = (page = 1) => {
    dispatch(getSessionAPI({ page, page_size: pagination?.page_size }, filter));
  };

  const handleClick = (event, row) => {
    dispatch(slice.setSingledata(row));
    setSelectedRow(row);
    console.log(row);
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDialog = () => {
    setDialogType(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleEdit = () => {
    handleClickOpen();
  };

  const handleClickOpen = () => {
    setDialogType(true);
  };

  const deleteIcon = (id) => {
    setDeleteId(selectedRow?.session_id);
  };

  const deleteConfromation = async () => {
    await dispatch(deleteSessionHandler(deleteId));
    fetchSessionData();
    setDeleteId("");
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    fetchSessionData(newPage);
  };
  const handleFilterChange = (event: string, value: string) => {
    setfilter({ ...filter, [event]: value })
  }

  useEffect(() => {
    fetchSessionData();
  }, [dispatch, pagination, filter]);

  useEffect(() => {
    dispatch(getRoleAPI("Trainer"));
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    const formattedDate = date.substr(0, 10);
    return formattedDate;
  };
  return (
    <>
      {user?.role !== "Learner" &&
        <div className="m-10 mb-0 flex justify-between">
          <div className="w-1/3 flex gap-14">
            <Autocomplete
              fullWidth
              size="small"
              options={trainer}
              getOptionLabel={(option: any) => option.user_name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search by Trainer"
                  name="role"
                  value={filter?.trainer_id}
                />
              )}
              onChange={(e, value: any) =>
                handleFilterChange("trainer_id", value?.user_id)
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
            <Autocomplete
              fullWidth
              size="small"
              value={filter.Attended}
              options={[
                "Not Set",
                "Attended",
                "Cancelled",
                "Cancelled by Assessor",
                "Cancelled by Learner",
                "Cancelled by Employer",
                "Learner Late",
                "Assessor Late",
                "Learner not Attended",
              ].map((option) => option)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search by Attended"
                  name="Attended"
                />
              )}
              onChange={(e, value) => { handleFilterChange("Attended", value) }}
              sx={{
                ".MuiAutocomplete-clearIndicator": {
                  color: "#5B718F",
                },
              }}
              PaperComponent={({ children }) => (
                <Paper style={{ borderRadius: "4px" }}>
                  {children}
                </Paper>
              )}
            />
          </div>
          <div className="items-end">
            <Link to="/newsession" >
              <SecondaryButton name="New Session" />
            </Link>
          </div>
        </div >}

      <Grid className="m-10">
        <div>
          <TableContainer
            sx={{
              minHeight: 575,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {session?.dataFetchLoading ? (
              <FuseLoading />
            ) : session?.data?.length ? (
              <Table
                sx={{ minWidth: 650, height: "100%" }}
                size="small"
                aria-label="simple table"
              >
                <TableHead className="bg-[#F8F8F8]">
                  <TableRow>
                    <TableCell
                      align="left"
                      sx={{
                        width: "15rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Title
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        width: "15rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Learners
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        width: "15rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Trainer
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        width: "15rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Location
                    </TableCell>
                    <TableCell align="left" sx={{ width: "15rem" }}>
                      Visit Date
                    </TableCell>
                    <TableCell align="left" sx={{ width: "10rem" }}>
                      Duration
                    </TableCell>
                    <TableCell align="center" sx={{ width: "20rem" }}>
                      Attended
                    </TableCell>
                    {/* <TableCell align="left" sx={{ width: "15rem" }}>
                      Type
                    </TableCell> */}
                    <TableCell align="left" sx={{ width: "15rem" }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {session?.data?.map((row) => (
                    <TableRow
                      key={row.title}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{
                          borderBottom: "2px solid #F8F8F8",
                          width: "15rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row?.title}
                      </TableCell>
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{
                          borderBottom: "2px solid #F8F8F8",
                          width: "15rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row?.learners.map(learner => learner.user_name).join(", ")}
                      </TableCell>
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{
                          borderBottom: "2px solid #F8F8F8",
                          width: "15rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row?.trainer_id?.user_name}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          borderBottom: "2px solid #F8F8F8",
                          width: "15rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row?.location}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          borderBottom: "2px solid #F8F8F8",
                          width: "15rem",
                        }}
                      >
                        {formatDate(row?.startDate)}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          borderBottom: "2px solid #F8F8F8",
                          width: "10rem",
                        }}
                      >
                        {row?.Duration}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          borderBottom: "2px solid #F8F8F8",
                          width: "20rem",
                        }}
                      >
                        <Autocomplete
                          disableClearable
                          fullWidth
                          size="small"
                          value={row?.Attended}
                          options={[
                            "Not Set",
                            "Attended",
                            "Cancelled",
                            "Cancelled by Assessor",
                            "Cancelled by Learner",
                            "Cancelled by Employer",
                            "Learner Late",
                            "Assessor Late",
                            "Learner not Attended",
                          ].map((option) => option)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Select funding body"
                              name="funding_body"
                            // error={true || userDataError?.funding_body}
                            />
                          )}
                          onChange={async (e, value) => {
                            await dispatch(
                              updateSessionAPI(row?.session_id, {
                                Attended: value,
                              })
                            );
                            fetchSessionData();
                          }}
                          sx={{
                            ".MuiAutocomplete-clearIndicator": {
                              color: "#5B718F",
                            },
                          }}
                          PaperComponent={({ children }) => (
                            <Paper style={{ borderRadius: "4px" }}>
                              {children}
                            </Paper>
                          )}
                        />
                      </TableCell>
                      {/* <TableCell
                        align="left"
                        sx={{
                          borderBottom: "2px solid #F8F8F8",
                          width: "15rem",
                        }}
                      >
                        {row?.type}
                      </TableCell> */}
                      <TableCell
                        align="left"
                        sx={{
                          borderBottom: "2px solid #F8F8F8",
                          width: "15rem",
                        }}
                      >
                        <IconButton
                          size="small"
                          sx={{ color: "#5B718F", marginRight: "4px" }}
                          onClick={(e) => handleClick(e, row)}
                        >
                          <MoreHorizIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              </div>
            )}
            <CustomPagination
              pages={session?.meta_data?.pages}
              page={session?.meta_data?.page}
              handleChangePage={handleChangePage}
              items={session?.meta_data?.items}
            />
          </TableContainer>
        </div>
        <AlertDialog
          open={Boolean(deleteId)}
          close={() => deleteIcon("")}
          title="Delete Session?"
          content="Deleting this ession will also remove all associated data and relationships. Proceed with deletion?"
          className="-224 "
          actionButton={
            session?.dataUpdatingLoadding ? (
              <LoadingButton />
            ) : (
              <DangerButton
                onClick={deleteConfromation}
                name="Delete Session"
              />
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
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem
            onClick={() => {
              handleEdit();
              handleClose();
            }}
          // disabled={data.role !== "Admin" && session?.singleData.status === "Closed"}
          >
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              deleteIcon(selectedRow);
            }}
          >
            Delete
          </MenuItem>
        </Menu>

        <Dialog
          open={dialogType}
          onClose={handleCloseDialog}
          fullScreen
          fullWidth
          sx={{
            ".MuiDialog-paper": {
              borderRadius: "4px",
              width: "100%",
            },
          }}
        >
          <DialogContent className="p-0">
            <NewSession edit={true} handleCloseDialog={handleCloseDialog} />
          </DialogContent>
          {/* <DialogActions>
          {session?.dataUpdatingLoadding ? (
            <LoadingButton />
          ) : (
            <>
              <SecondaryButtonOutlined
                onClick={handleCloseDialog}
                name="Cancel"
              />
              <SecondaryButton
                name={Object.keys(session?.singleData)?.length !== 0 ? "Edit" : "Save"}
              // onClick={
              //   Object.keys(session?.singleData)?.length !== 0
              //     ? handleUpdate
              //     : handleSubmit
              // }
              // disable={!isSupport}
              />
            </>
          )}
        </DialogActions> */}
        </Dialog>
      </Grid>
    </>
  );
};

export default Calendar;
