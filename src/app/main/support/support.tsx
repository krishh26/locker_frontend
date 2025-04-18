import {
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
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
import {
  createSupportDataAPI,
  deleteSupportHandler,
  getSupportDataAPI,
  selectSupportData,
  slice,
  updateSupportDataAPI,
} from "app/store/supportData";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectUser } from "app/store/userSlice";
import AlertDialog from "src/app/component/Dialogs/AlertDialog";
import FuseLoading from "@fuse/core/FuseLoading";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import Style from "./style.module.css";
import { selectGlobalUser } from "app/store/globalUser";
import CustomPagination from "src/app/component/Pagination/CustomPagination";
import { UserRole } from "src/enum";

const AddRequest = (props) => {
  const { supportData = {}, handleChange = () => { } } = props;
  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;

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
            value={supportData.title}
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
            value={supportData.description}
            onChange={handleChange}
          />
        </div>
        {user?.role === "Admin" &&
          <div>
            <Typography
              sx={{
                fontSize: "0.9vw",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
              className="name"
            >
              Select Status
            </Typography>
            <Select
              name="status"
              value={supportData?.status}
              size="small"
              placeholder="Select Type"
              required
              fullWidth
              onChange={handleChange}
              // disabled={mode === "view"}
              className="input"
            >
              <MenuItem value={"Pending"}>Pending</MenuItem>
              <MenuItem value={"InProgress"}>InProgress</MenuItem>
              <MenuItem value={"Reject"}>Reject</MenuItem>
              <MenuItem value={"Resolve"}>Resolve</MenuItem>
            </Select>
          </div>}
      </Box>
    </>
  );
};

const Support = (props) => {
  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;

  const { singleData, dataUpdatingLoadding, dataFetchLoading, meta_data } = useSelector(selectSupportData);

  const { pagination } = useSelector(selectGlobalUser)

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [dialogType, setDialogType] = useState(false);

  const [deleteId, setDeleteId] = useState("");

  const [supportData, setSupportData] = useState({
    request_id: user?.user_id,
    title: "",
    description: "",
  });

  const deleteIcon = (id) => {
    setDeleteId(selectedRow?.support_id);
  };

  const deleteConfromation = async () => {
    await dispatch(deleteSupportHandler(deleteId));
    fetchSupportData()
    setDeleteId("");
  };

  const dispatch: any = useDispatch();

  const fetchSupportData = (page = 1) => {
    dispatch(getSupportDataAPI({ page, page_size: pagination.page_size }, user?.role !== UserRole.Admin && user?.user_id));
  }

  const clearSingleData = () => {
    dispatch(slice.setSingleData({}));
    setSupportData({
      request_id: user?.user_id,
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
    console.log(row);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleEdit = () => {
    setSupportData(singleData);
    handleClickOpen();
  };

  const support = useSelector(selectSupportData);

  useEffect(() => {
    fetchSupportData()
  }, [dispatch, pagination]);

  const handleSubmit = async () => {
    try {
      let response;
      response = await dispatch(createSupportDataAPI(supportData));
      fetchSupportData()
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
      response = await dispatch(updateSupportDataAPI(supportData));
      fetchSupportData()
    } catch (err) {
      console.log(err);
    } finally {
      handleCloseDialog();
      handleClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupportData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    fetchSupportData(newPage)
  };

  const isSupport = Object.values(supportData).find(data => data === "") === undefined;

  const formatDate = (date) => {
    if (!date) return "";
    const formattedDate = date.substr(0, 10);
    return formattedDate;
  };

  return (
    <>
      <div className="m-10">
        {user?.role !== "Admin" && <Box
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
            name="Add Request"
            className="py-6 px-12 mb-10"
            startIcon={<AddIcon sx={{ mx: -0.5 }} />}
            onClick={() => handleClickOpen()}
          />
        </Box>}
        <div>
          <TableContainer sx={{ minHeight: 550, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {dataFetchLoading ? (
              <FuseLoading />
            ) : support.data?.length ? (
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
                    {user?.role === "Admin" &&
                      <>
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
                      </>
                    }
                    <TableCell align="left" sx={{ width: "15rem" }}>
                      Date
                    </TableCell>
                    <TableCell align="left" sx={{ width: "15rem" }}>Status</TableCell>
                    {user?.role === "Admin" &&
                      <TableCell align="left" sx={{ width: "15rem" }}>Action</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {support.data?.map((row) => (
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
                      {user?.role === "Admin" &&
                        <>
                          <TableCell
                            align="left"
                            sx={{
                              width: "15rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>
                            {row.request_id.email}
                          </TableCell>
                          <TableCell
                            align="left"
                            sx={{ borderBottom: "2px solid #F8F8F8", width: "15rem" }}
                          >
                            {row?.request_id?.user_name}
                          </TableCell>
                        </>
                      }
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
                        {row.status}
                      </TableCell>
                      {user?.role === "Admin" &&
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
                        </TableCell>}
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
              pages={meta_data?.pages}
              page={meta_data?.page}
              handleChangePage={handleChangePage}
              items={meta_data?.items}
            />
          </TableContainer>
        </div>

        <AlertDialog
          open={Boolean(deleteId)}
          close={() => deleteIcon("")}
          title="Delete Support?"
          content="Deleting this support will also remove all associated data and relationships. Proceed with deletion?"
          className="-224 "
          actionButton={
            dataUpdatingLoadding ? (
              <LoadingButton />
            ) : (
              <DangerButton
                onClick={deleteConfromation}
                name="Delete Support"
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
            disabled={user?.role !== "Admin" && singleData.status === "Closed"}
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
            <AddRequest supportData={supportData} handleChange={handleChange} />
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
                  disable={!isSupport}
                />
              </>
            )}
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default Support;
