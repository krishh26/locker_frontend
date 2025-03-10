import FuseLoading from '@fuse/core/FuseLoading';
import { Autocomplete, Dialog, DialogActions, DialogContent, Grid, IconButton, Menu, MenuItem, Pagination, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { DangerButton, LoadingButton, SecondaryButton, SecondaryButtonOutlined } from 'src/app/component/Buttons';
import AlertDialog from 'src/app/component/Dialogs/AlertDialog';
import DataNotFound from 'src/app/component/Pages/dataNotFound';
import NewSession from '../portfolio/newsession';
import { deleteSessionHandler, getSessionAPI, selectSession, slice, updateSessionAPI } from 'app/store/session';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const Calendar = () => {

  const dispatch: any = useDispatch();

  const session = useSelector(selectSession);

  useEffect(() => {
    dispatch(getSessionAPI({ page: 1, page_size: 10 }));
  }, [dispatch]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [dialogType, setDialogType] = useState(false);
  const [deleteId, setDeleteId] = useState("");

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
    dispatch(getSessionAPI({ page: 1, page_size: 10 }));
    setDeleteId("");
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    dispatch(getSessionAPI({ page: newPage, page_size: 10 }));
  };

  const formatDate = (date) => {
    if (!date) return "";
    const formattedDate = date.substr(0, 10);
    return formattedDate;
  };
  return (
    <Grid className="m-10">
      <div>
        <TableContainer sx={{ maxHeight: 575 }}>
          {session?.dataFetchLoading ? (
            <FuseLoading />
          ) : session?.data.length ? (
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
                    }}>
                    Title
                  </TableCell>
                  <TableCell align="left"
                    sx={{
                      width: "15rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    Location
                  </TableCell>
                  <TableCell align="left" sx={{ width: "15rem" }}>Start Date</TableCell>
                  <TableCell align="left" sx={{ width: "10rem" }}>Duration</TableCell>
                  <TableCell align="center" sx={{ width: "20rem" }}>Attended</TableCell>
                  <TableCell align="left" sx={{ width: "15rem" }}>Type</TableCell>
                  <TableCell align="left" sx={{ width: "15rem" }}>Action</TableCell>
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
                      sx={{ borderBottom: "2px solid #F8F8F8", width: "15rem" }}
                    >
                      {formatDate(row?.startDate)}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ borderBottom: "2px solid #F8F8F8", width: "10rem" }}
                    >
                      {row?.Duration}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ borderBottom: "2px solid #F8F8F8", width: "20rem" }}
                    >
                      <Autocomplete
                        disableClearable
                        fullWidth
                        size="small"
                        value={row?.Attended}
                        options={[
                          'Not Set',
                          'Attended',
                          'Cancelled',
                          'Cancelled by Assessor',
                          'Cancelled by Learner',
                          'Cancelled by Employer',
                          'Learner Late',
                          'Assessor Late',
                          'Learner not Attended'
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
                          await dispatch(updateSessionAPI(row?.session_id, { Attended: value }))
                          dispatch(getSessionAPI())
                        }}
                        sx={{
                          ".MuiAutocomplete-clearIndicator": {
                            color: "#5B718F",
                          },
                        }}
                        PaperComponent={({ children }) => (
                          <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
                        )}
                      />
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ borderBottom: "2px solid #F8F8F8", width: "15rem" }}
                    >
                      {row?.type}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ borderBottom: "2px solid #F8F8F8", width: "15rem" }}
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
          <div className="fixed bottom-0 left-0 w-full flex justify-center ">
            <Stack
              spacing={2}
              className="flex justify-center items-center w-full my-12"
            >
              <Pagination
                count={session?.meta_data?.pages}
                page={session?.meta_data?.page}
                variant="outlined" shape="rounded"
                siblingCount={1}
                boundaryCount={1}
                onChange={handleChangePage}
              />
            </Stack>
          </div>
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
        <DialogContent className='p-0'>
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
                name={Object.keys(session?.singleData).length !== 0 ? "Edit" : "Save"}
              // onClick={
              //   Object.keys(session?.singleData).length !== 0
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
    // <div>Calendar</div>
  )
}

export default Calendar