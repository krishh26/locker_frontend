import {
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Stack } from "@mui/system";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import React, { useEffect, useState } from "react";
import {
  DangerButton,
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "src/app/component/Buttons";
import { TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { tr } from "date-fns/locale";
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
import { log } from "console";
import FuseLoading from "@fuse/core/FuseLoading";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import Style from "./style.module.css";

// function createData(title: string, description: string, status: string) {
//   return {
//     title,
//     description,
//     status,
//   };
// }

const AddRequest = (props) => {
  const { supportData = {}, handleChange = () => { } } = props;
  const { data } = useSelector(selectUser);

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
        {data.role === "Admin" &&
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
  const { data } = useSelector(selectUser);
  const { singleData, dataUpdatingLoadding, dataFetchLoading, meta_data } = useSelector(selectSupportData);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [dialogType, setDialogType] = useState(false);

  const [deleteId, setDeleteId] = useState("");

  const [supportData, setSupportData] = useState({
    request_id: data.user_id,
    title: "",
    description: "",
  });

  const deleteIcon = (id) => {
    setDeleteId(selectedRow?.support_id);
  };

  const deleteConfromation = async () => {
    await dispatch(deleteSupportHandler(deleteId));
    dispatch(getSupportDataAPI({ page: 1, page_size: 10 }, data.user_id));
    setDeleteId("");
  };

  const dispatch: any = useDispatch();

  const clearSingleData = () => {
    dispatch(slice.setSingleData({}));
    setSupportData({
      request_id: data.user_id,
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
    dispatch(getSupportDataAPI({ page: 1, page_size: 10 }, data.user_id));
  }, [dispatch]);

  const handleSubmit = async () => {
    try {
      let response;
      response = await dispatch(createSupportDataAPI(supportData));
      dispatch(getSupportDataAPI({ page: 1, page_size: 10 }, data.user_id));
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
      dispatch(getSupportDataAPI({ page: 1, page_size: 10 }, data.user_id));
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
    dispatch(
      getSupportDataAPI({ page: newPage, page_size: 10 }, data.user_id)
    );
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
        {data.role !== "Admin" && <Box
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
          <TableContainer sx={{ maxHeight: 500 }}>
            {dataFetchLoading ? (
              <FuseLoading />
            ) : support.data.length ? (
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
                    {data.role === "Admin" &&
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
                    {data.role === "Admin" &&
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
                      {data.role === "Admin" &&
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
                      {data.role === "Admin" &&
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
          </TableContainer>
          <div className="fixed bottom-0 left-0 w-full flex justify-center py-4 mb-14">
            <Stack
              spacing={2}
              className="flex justify-center items-center w-full my-12"
            >
              <Pagination
                count={meta_data?.pages}
                page={meta_data?.page}
                variant="outlined" shape="rounded"
                siblingCount={1}
                boundaryCount={1}
                onChange={handleChangePage}
              />
            </Stack>
          </div>
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
            disabled={data.role !== "Admin" && singleData.status === "Closed"}
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
                  name={Object.keys(singleData).length !== 0 ? "Edit" : "Save"}
                  onClick={
                    Object.keys(singleData).length !== 0
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
