import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useEffect, useState } from "react";
import {
  DangerButton,
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "src/app/component/Buttons";
import { TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import AlertDialog from "src/app/component/Dialogs/AlertDialog";
import FuseLoading from "@fuse/core/FuseLoading";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import Style from "./style.module.css";
import { selectGlobalUser } from "app/store/globalUser";
import CustomPagination from "src/app/component/Pagination/CustomPagination";
import { createBroadcastAPI, deleteBroadcastHandler, getBroadcastDataAPI, selectBroadcast, updateBroadcastAPI, slice, BroadcastMessage } from "app/store/broadcast";
import { fetchUserAllAPI, selectFormData } from "app/store/formData";
import { selectCourseManagement } from "app/store/courseManagement";

const AddRequest = (props) => {
  const { broadcastData = {}, handleChange = () => { } } = props;

  return (
    <>
      <Box className="flex flex-col justify-between gap-12 p-0">
        <div>
          <Typography
            sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
            className={Style.name}
          >
            Title
          </Typography>
          <TextField
            name="title"
            size="small"
            placeholder="Add your title"
            fullWidth
            multiline
            value={broadcastData.title}
            onChange={handleChange}
          />
        </div>
        <div>
          <Typography
            sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
            className={Style.name}
          >
            Description
          </Typography>
          <TextField
            name="description"
            size="small"
            placeholder="Add your description"
            fullWidth
            multiline
            rows={6}
            value={broadcastData.description}
            onChange={handleChange}
          />
        </div>
      </Box>
    </>
  );
};

const Broadcast = (props) => {
  const { singleData, dataUpdatingLoadding, dataFetchLoading, meta_data } = useSelector(selectBroadcast);
  const { users } = useSelector(selectFormData);
  const { data: courseData } = useSelector(selectCourseManagement);

  const { pagination } = useSelector(selectGlobalUser)

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [dialogType, setDialogType] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [broadcastData, setBroadcastData] = useState({
    title: "",
    description: "",
  });

  const deleteIcon = (id) => {
    setDeleteId(selectedRow?.id);
  };

  const deleteConfromation = async () => {
    await dispatch(deleteBroadcastHandler(deleteId));
    clearSingleData();
    fetchBroadcastData()
    setDeleteId("");
  };

  const dispatch: any = useDispatch();

  const fetchBroadcastData = (page = 1) => {
    dispatch(getBroadcastDataAPI({ page, page_size: pagination.page_size }));
  }

  const clearSingleData = () => {
    dispatch(slice.setSingleData({}));
    setBroadcastData({
      title: "",
      description: "",
    });
  };
  const handleClickOpen = () => {
    setDialogType(true);
  };

  const handleCloseDialog = () => {
    setDialogType(null);
    clearSingleData();
  };

  const handleClick = (event, row) => {
    dispatch(slice.setSingleData(row));
    setSelectedRow(row);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleEdit = () => {
    setBroadcastData(singleData);
    handleClickOpen();
  };

  const broadcast = useSelector(selectBroadcast);
  useEffect(() => {
    fetchBroadcastData()
  }, [dispatch, pagination]);

  const handleSubmit = async () => {
    try {
      await dispatch(createBroadcastAPI(broadcastData));
      fetchBroadcastData()
    } catch (err) {
      console.log(err);
    } finally {
      handleCloseDialog();
      handleClose();
    }
  };

  const handleUpdate = async () => {
    try {
      let response;
      response = await dispatch(updateBroadcastAPI(broadcastData));
      fetchBroadcastData()
    } catch (err) {
      console.log(err);
    } finally {
      handleCloseDialog();
      handleClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBroadcastData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    fetchBroadcastData(newPage)
  };

  const isBroadcast = Object.values(broadcastData).find(data => data === "") === undefined;

  const formatDate = (date) => {
    if (!date) return "";
    const formattedDate = date.substr(0, 10);
    return formattedDate;
  };

  const [selectedValue, setSelectedValue] = useState("");
  const [openBroadcast, setOpenBroadcast] = useState(false);
  const [userData, setuserData] = useState({ user_ids: [] });
  const [courseSelectedData, setCourseSelectedData] = useState({ course_ids: [] });

  const handleRadioChange = (event) => {
    setSelectedValue(event.target.value);
  };
  const handleDataUpdate = (event) => {
    setuserData({
      ...userData,
      user_ids: event.target.value,
    });
  };
  const handleCourseDataUpdate = (event) => {
    setCourseSelectedData({
      ...courseSelectedData,
      course_ids: event.target.value,
    });
  };

  const handleCloseBroadDialog = () => {
    clearSingleData();
    setSelectedValue("")
    setOpenBroadcast(false)
    setuserData({ user_ids: [] });
  };

  const handleBroadcastSubmit = async () => {
    if (selectedValue === 'Individual') {
      await dispatch(BroadcastMessage({ user_ids: userData.user_ids, title: selectedRow.title, description: selectedRow.description }));
    } else if (selectedValue === 'qualification') {
      await dispatch(BroadcastMessage({ course_ids: courseSelectedData.course_ids, title: selectedRow.title, description: selectedRow.description }));
    } else {
      await dispatch(BroadcastMessage({ assign: selectedValue, title: selectedRow.title, description: selectedRow.description }));
    }
    handleCloseBroadDialog();
  };

  const handleBroadcastOpen = () => {
    setOpenBroadcast(true);
    dispatch(fetchUserAllAPI())
  };

  return (
    <>
      <div className="m-10">
        <Box
          className="flex justify-end mb-10"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <SecondaryButton
            name="Add Broadcast"
            className="py-6 px-12 mb-10"
            startIcon={<AddIcon sx={{ mx: -0.5 }} />}
            onClick={() => handleClickOpen()}
          />
        </Box>
        <div>
          <TableContainer sx={{ minHeight: 550, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {dataFetchLoading ? (
              <FuseLoading />
            ) : broadcast.data?.length ? (
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
                        maxWidth: "4rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      Title
                    </TableCell>
                    <TableCell align="left"
                      sx={{
                        maxWidth: "9rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      Description
                    </TableCell>
                    <TableCell align="left"
                      sx={{
                        width: "15rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      Email
                    </TableCell>
                    <TableCell align="left" sx={{ width: "15rem" }}>
                      User Name
                    </TableCell>
                    <TableCell align="left" sx={{ width: "15rem" }}>
                      Date
                    </TableCell>
                    <TableCell align="left" sx={{ width: "15rem" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {broadcast.data?.map((row) => (
                    <TableRow
                      key={row.title}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{
                          borderBottom: "2px solid #F8F8F8",
                          maxWidth: "4rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.title}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          borderBottom: "2px solid #F8F8F8",
                          maxWidth: "9rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.description}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          width: "15rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        {row.user_id.email}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ borderBottom: "2px solid #F8F8F8", width: "15rem" }}
                      >
                        {row?.user_id?.user_name}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{ borderBottom: "2px solid #F8F8F8", width: "15rem" }}
                      >
                        {formatDate(row.created_at)}
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
            {broadcast.data?.length ?
              <CustomPagination
                pages={meta_data?.pages}
                page={meta_data?.page}
                handleChangePage={handleChangePage}
                items={meta_data?.items}
              />
              : null}
          </TableContainer>
        </div>

        <AlertDialog
          open={Boolean(deleteId)}
          close={() => deleteIcon("")}
          title="Delete Broadcast?"
          content="Deleting this Broadcast will also remove all associated data and relationships. Proceed with deletion?"
          className="-224 "
          actionButton={
            dataUpdatingLoadding ? (
              <LoadingButton />
            ) : (
              <DangerButton
                onClick={deleteConfromation}
                name="Delete Broadcast"
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
              handleBroadcastOpen()
              setAnchorEl(null);
            }}
          >
            Broadcast
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleEdit();
              handleClose();
            }}
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
          sx={{
            ".MuiDialog-paper": {
              borderRadius: "4px",
              width: "100%",
            },
          }}
        >
          <DialogContent>
            <AddRequest broadcastData={broadcastData} handleChange={handleChange} />
          </DialogContent>
          <DialogActions>
            {dataUpdatingLoadding ? (
              <LoadingButton />
            ) : (
              <>
                <SecondaryButtonOutlined
                  onClick={handleCloseDialog}
                  name="Cancel"
                />
                <SecondaryButton
                  name={Object.keys(singleData)?.length !== 0 ? "Edit" : "Save"}
                  onClick={
                    Object.keys(singleData)?.length !== 0
                      ? handleUpdate
                      : handleSubmit
                  }
                  disable={!isBroadcast}
                />
              </>
            )}
          </DialogActions>
        </Dialog>

        <Dialog
          open={openBroadcast}
          onClose={handleCloseBroadDialog}
          sx={{
            ".MuiDialog-paper": {
              borderRadius: "4px",
              width: "100%",
            },
          }}
        >
          <DialogContent >
            <Grid>
              <FormControl component="fieldset">
                <FormLabel component="legend">Broadcast Message to users</FormLabel>
                <RadioGroup
                  aria-label="options"
                  defaultValue="outlined"
                  name="radio-buttons-group"
                >
                  <FormControlLabel
                    value="All"
                    control={<Radio />}
                    label="All"
                    onChange={handleRadioChange}
                  />
                  <FormControlLabel
                    value="All Learner"
                    control={<Radio />}
                    label="All Learner"
                    onChange={handleRadioChange}
                  />
                  <FormControlLabel
                    value="All EQA"
                    control={<Radio />}
                    label="All EQA"
                    onChange={handleRadioChange}
                  />
                  <FormControlLabel
                    value="All Trainer"
                    control={<Radio />}
                    label="All Trainer"
                    onChange={handleRadioChange}
                  />
                  <FormControlLabel
                    value="All Employer"
                    control={<Radio />}
                    label="All Employer"
                    onChange={handleRadioChange}
                  />
                  <FormControlLabel
                    value="All IQA"
                    control={<Radio />}
                    label="All IQA"
                    onChange={handleRadioChange}
                  />
                  <FormControlLabel
                    value="All LIQA"
                    control={<Radio />}
                    label="All LIQA"
                    onChange={handleRadioChange}
                  />
                  <FormControlLabel
                    value="Individual"
                    control={<Radio checked={selectedValue === 'Individual'} onChange={handleRadioChange} />}
                    label="Individual"
                    onChange={handleRadioChange}
                  />
                  {selectedValue === 'Individual' && (
                    <Grid className="w-full">
                      <Typography sx={{ fontSize: '0.9vw', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Select Users
                      </Typography>
                      <Select
                        name="users"
                        value={userData.user_ids}
                        size="small"
                        placeholder="Select users"
                        required
                        fullWidth
                        className="max-w-200 min-w-200"
                        multiple
                        onChange={handleDataUpdate}
                        renderValue={(selected) =>
                          selected.map((id) => {
                            const allusers = users?.data?.find((user) => user?.user_id === id);
                            return allusers ? allusers?.user_name : '';
                          }).join(', ')
                        }
                      >
                        {users?.data?.map((data) => (
                          <MenuItem key={data?.user_id} value={data?.user_id}>
                            <Checkbox checked={userData?.user_ids?.includes(data?.user_id)} />
                            <ListItemText primary={data?.user_name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </Grid>
                  )}

                  <FormControlLabel
                    value="qualification"
                    control={<Radio checked={selectedValue === 'qualification'} onChange={handleRadioChange} />}
                    label="Qualification"
                    onChange={handleRadioChange}
                  />
                  {selectedValue === 'qualification' && (
                    <Grid className="w-full">
                      <Typography sx={{ fontSize: '0.9vw', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Select Courses
                      </Typography>
                      <Select
                        name="courses"
                        value={courseSelectedData.course_ids}
                        size="small"
                        placeholder="Select users"
                        required
                        fullWidth
                        className="max-w-200 min-w-200"
                        multiple
                        onChange={handleCourseDataUpdate}
                        renderValue={(selected) =>
                          selected.map((id) => {
                            const allusers = courseData?.find((user) => user?.course_id === id);
                            return allusers ? allusers?.course_name : '';
                          }).join(', ')
                        }
                      >
                        {courseData?.map((data) => (
                          <MenuItem key={data?.course_id} value={data?.course_id}>
                            <Checkbox checked={courseSelectedData?.course_ids?.includes(data?.course_id)} />
                            <ListItemText primary={data?.course_name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </Grid>
                  )}
                </RadioGroup>
              </FormControl>
            </Grid>
          </DialogContent>

          <Box className="flex items-center justify-end m-12 mt-24">
            <DialogActions>
              {dataUpdatingLoadding ?
                <LoadingButton />
                :
                <>
                  <SecondaryButtonOutlined name="Cancel" className=" w-1/12" onClick={handleCloseBroadDialog} />
                  <SecondaryButton name="Broadcast" className=" ml-10" onClick={handleBroadcastSubmit} disable={!userData || !selectedValue} />
                </>
              }
            </DialogActions>
          </Box>
        </Dialog>
      </div>
    </>
  );
};

export default Broadcast;
