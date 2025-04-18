import {
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Drawer,
  Tooltip,
  Select,
  Grid,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import React, { useEffect, useRef, useState } from "react";
import {
  DangerButton,
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "src/app/component/Buttons";
import { TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import {
  createInnovationCommentAPI,
  createYourInnovationAPI,
  deleteInnovationHandler,
  getInnovationCommentAPI,
  getYourInnovationAPI,
  selectYourInnovation,
  slice,
  updateYourInnovationAPI,
} from "app/store/yourInnovation";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectUser } from "app/store/userSlice";
import AlertDialog from "src/app/component/Dialogs/AlertDialog";
import FuseLoading from "@fuse/core/FuseLoading";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import Style from "./style.module.css"
import { getRandomColor } from "src/utils/randomColor";
import CustomPagination from "src/app/component/Pagination/CustomPagination";
import { selectGlobalUser } from "app/store/globalUser";


const timeAgo = (timestamp) => {
  if (!timestamp) return '';

  const now: any = new Date();
  const past: any = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(diffInSeconds / 3600);
  const days = Math.floor(diffInSeconds / 86400);
  const weeks = Math.floor(diffInSeconds / 604800);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec${diffInSeconds !== 1 ? 's' : ''} ago`;
  } else if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (days < 7) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }
};


const AddInnocations = (props) => {
  const { yourInnovation = {}, handleChange = () => { } } = props;
  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;

  return (
    <>
      <Box className="flex flex-col justify-between gap-12 p-0">
        <div>
          <Typography
            sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
            className={Style.name}
          >
            Topic
          </Typography>
          <TextField
            name="topic"
            size="small"
            placeholder="Add your topic"
            fullWidth
            multiline
            value={yourInnovation.topic}
            onChange={handleChange}
            disabled={user?.role === "Admin"}
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
            value={yourInnovation.description}
            onChange={handleChange}
            disabled={user?.role === "Admin"}
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
              value={yourInnovation?.status}
              size="small"
              placeholder="Select Type"
              required
              fullWidth
              onChange={handleChange}
              // disabled={mode === "view"}
              className="input"
            >
              <MenuItem value={"Open"}>Open</MenuItem>
              <MenuItem value={"Closed"}>Closed</MenuItem>
            </Select>
          </div>}
      </Box>
    </>
  );
};

const ProposeYourInnovations = (props) => {
  const chatEndRef = useRef(null);
  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;

  const { singleData, dataUpdatingLoadding, dataFetchLoading, meta_data } = useSelector(selectYourInnovation);

  const { pagination } = useSelector(selectGlobalUser)

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [dialogType, setDialogType] = useState(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [deleteId, setDeleteId] = useState("");

  const [yourInnovation, setYourInnovation] = useState({
    innovation_propose_by_id: user?.user_id,
    topic: "",
    description: "",
    status: "",
  });

  const fetchInnovationsData = (page = 1) => {
    dispatch(getYourInnovationAPI({ page, page_size: pagination?.page_size }, user?.user_id));
  }

  const deleteIcon = (id) => {
    setDeleteId(selectedRow?.id);
  };

  const deleteConfromation = async () => {
    await dispatch(deleteInnovationHandler(deleteId));
    fetchInnovationsData()
    setDeleteId("");
  };

  const dispatch: any = useDispatch();

  const clearSingleData = () => {
    dispatch(slice.setSingleData({}));
    setYourInnovation({
      innovation_propose_by_id: user?.user_id,
      topic: "",
      description: "",
      status: ""
    });
  };
  const handleClickOpen = (type) => {
    setDialogType(type);
  };

  const handleCloseDialog = () => {
    setDialogType(null);
    clearSingleData();
    setDeleteId("");
  };

  const handleClick = (event, row) => {
    dispatch(slice.setSingleData(row));
    setSelectedRow(row);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setDialogType(null);
    setDeleteId("");
  };

  const handleEdit = () => {
    setYourInnovation(singleData);
    handleClickOpen("edit");
  };

  const handleView = async () => {
    try {
      const response = await dispatch(
        getInnovationCommentAPI({ page: 1, page_size: 10 }, selectedRow?.id)
      );
    } catch (error) {
      console.error(error);
    }

    setYourInnovation(singleData);
    setChatDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setChatDrawerOpen(false);
    clearSingleData();
  };

  const innovation = useSelector(selectYourInnovation);

  useEffect(() => {
    fetchInnovationsData();
  }, [dispatch, pagination]);

  const handleSubmit = async () => {
    try {
      let response;
      response = await dispatch(createYourInnovationAPI(yourInnovation));
      fetchInnovationsData()
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
      response = await dispatch(updateYourInnovationAPI(yourInnovation));
      fetchInnovationsData()
    } catch (err) {
      console.log(err);
    } finally {
      handleCloseDialog();
      handleClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setYourInnovation((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSendChatMessage = async () => {
    if (newMessage.trim() !== "") {
      const isAdmin = user?.roles.includes("Admin");
      const messageType = isAdmin ? "Response" : "Reply";

      const newChatMessage = {
        innovation_id: selectedRow.id,
        type: messageType,
        description: newMessage,
        date: new Date(),
      };
      console.log(chatMessages);

      try {
        let response;
        response = await dispatch(createInnovationCommentAPI(newChatMessage));
        // dispatch(
        //   getInnovationCommentAPI({ page: 1, page_size: 10 }, selectedRow?.id)
        // );
      } catch (err) {
        console.log(err);
      } finally {
        // handleCloseDialog();
        handleClose();
      }

      setChatMessages(singleData);
      setNewMessage("");
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    fetchInnovationsData(newPage)
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendChatMessage();
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    scrollToBottom();
  }, [singleData.comment]);

  const isAdmin = user?.roles.includes('Admin');

  const isInnovations =
    Object.values(yourInnovation).find((data) => data === "") === undefined;

  const formatDate = (date) => {
    if (!date) return "";
    const formattedDate = date.substr(0, 10);
    return formattedDate;
  };

  return (
    <>
      <div className="m-10">
        {user?.role !== "Admin" &&
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
              name="Submit An Idea"
              className="py-6 px-12 mb-10"
              startIcon={<AddIcon sx={{ mx: -0.5 }} />}
              onClick={() => handleClickOpen("add")}
            />
          </Box>}
        <TableContainer sx={{ minHeight: 550, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {dataFetchLoading ? (
            <FuseLoading />
          ) : innovation.data?.length ? (
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
                    }}
                  >
                    Topic
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{
                      maxWidth: "9rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
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
                  <TableCell align="left" sx={{ width: "15rem" }}>
                    Status
                  </TableCell>
                  <TableCell align="left" sx={{ width: "15rem" }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {innovation?.data?.map((row) => (
                  <TableRow
                    key={row.topic}
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
                      {row.topic}
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
                      {row?.description}
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
                          {row?.innovation_propose_by_id?.email}
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{ borderBottom: "2px solid #F8F8F8", width: "15rem" }}
                        >
                          {row?.innovation_propose_by_id?.user_name}
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
          <CustomPagination
            pages={meta_data?.pages}
            page={meta_data?.page}
            handleChangePage={handleChangePage}
            items={meta_data?.items}
          />
        </TableContainer>

        <AlertDialog
          open={Boolean(deleteId)}
          close={() => {
            deleteIcon("");
            handleClose();
          }}
          topic="Delete Your Innovation?"
          content="Deleting this your innovation will also remove all associated data and relationships. Proceed with deletion?"
          className="-224 "
          actionButton={
            dataUpdatingLoadding ? (
              <LoadingButton />
            ) : (
              <DangerButton
                onClick={deleteConfromation}
                name="Delete Your Innovation"
              />
            )
          }
          cancelButton={
            <SecondaryButtonOutlined
              className="px-24"
              onClick={() => {
                handleClose();
              }}
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
              handleClose();
              handleView();
            }}
          >
            View & Chat
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              handleEdit();
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
          open={dialogType === "add" || dialogType === "edit"}
          onClose={handleCloseDialog}
          sx={{
            ".MuiDialog-paper": {
              borderRadius: "4px",
              width: "100%",
            },
          }}
        >
          <DialogContent>
            <AddInnocations
              yourInnovation={yourInnovation}
              handleChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            {dataUpdatingLoadding ? (
              <LoadingButton />
            ) : (
              <>
                <SecondaryButtonOutlined onClick={handleCloseDialog} name="Cancel" />
                <SecondaryButton
                  name={Object.keys(singleData)?.length !== 0 ? "Edit" : "Save"}
                  onClick={
                    Object.keys(singleData)?.length !== 0
                      ? handleUpdate
                      : handleSubmit
                  }
                  disable={!yourInnovation?.topic || !yourInnovation?.description}
                />
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Chat Drawer */}
        <Drawer
          anchor="right"
          open={chatDrawerOpen}
          onClose={handleDrawerClose}
          sx={{ width: "100%", "& .MuiDrawer-paper": { width: "50%" } }}
        >
          <Box
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <Box p={2}>
              <Tooltip title={yourInnovation.topic}>
                <Typography
                  variant="subtitle1"
                  className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {yourInnovation.topic}
                </Typography>
              </Tooltip>
              <Tooltip title={yourInnovation.description}>
                <Typography
                  variant="subtitle1"
                  className="text-sm overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {yourInnovation.description}
                </Typography>
              </Tooltip>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
              {singleData.comment?.map((message) => (
                <Box key={message.id} mb={2} >
                  {singleData.innovation_propose_by_id?.user_id === user?.user_id ? (
                    message.type == "Response" ? (

                      <Grid className="w-[80%] flex text-justify justify-start pr-10">
                        <div className="flex items-start justify-start bg-[#F4F6F8] rounded-md m-10 gap-10 w-full p-10">
                          <Avatar className="mr-4" alt={"Admin"} src="../" sx={{ bgcolor: getRandomColor("a") }} />
                          <div style={{ overflowWrap: "anywhere" }} className="flex flex-col w-full">
                            <div className="flex justify-between flex-row m-5 pr-10">
                              <div className="font-semibold text-base">
                                {singleData.innovation_propose_by_id?.user_id === user?.user_id ? "Admin" : singleData.innovation_propose_by_id?.user_name}
                              </div>
                              <div className="text-xs text-gray-500">{timeAgo(message?.date)}</div>
                            </div>
                            <div className="text-justify text-base pr-10">{message.description}</div>
                          </div>
                        </div>
                      </Grid>
                    ) : (
                      <Grid className="w-[80%] flex ml-auto text-justify justify-end pr-10">
                        <Typography
                          sx={{ overflowWrap: "anywhere" }}
                          className="bg-[#5B718F] p-10 rounded-md text-base text-white"
                        >
                          {message?.description}
                          <div className="flex justify-end text-xs text-gray-500">{timeAgo(message?.date)}</div>
                        </Typography>
                      </Grid>
                    )
                  ) : (
                    // Other users' messages
                    message.type == "Reply" ? (
                      <Grid className="w-[80%] flex text-justify justify-start pr-10">
                        <div className="flex items-start justify-start bg-[#F4F6F8] rounded-md m-10 gap-10 w-full p-10">
                          <Avatar
                            className="mr-4"
                            alt={singleData.innovation_propose_by_id?.user_name?.toUpperCase().charAt(0)}
                            src={singleData.innovation_propose_by_id?.avatar?.url}
                          />
                          <div style={{ overflowWrap: "anywhere" }} className="flex flex-col w-full">
                            <div className="flex justify-between flex-row m-5 pr-10">
                              <div className="font-semibold text-base">
                                {singleData.innovation_propose_by_id?.user_name}
                              </div>
                              <div className="text-xs text-gray-500">{timeAgo(message?.date)}</div>
                            </div>
                            <div className="text-justify text-base pr-10">{message.description}</div>
                          </div>
                        </div>
                      </Grid>
                    ) : (
                      <Grid className="w-[80%] flex ml-auto text-justify justify-end pr-10">
                        <Typography
                          sx={{ overflowWrap: "anywhere" }}
                          className="bg-[#5B718F] p-10 rounded-md text-base text-white"
                        >
                          {message?.description}
                          <div className="flex justify-end text-xs text-gray-500">{timeAgo(message?.date)}</div>
                        </Typography>
                      </Grid>
                    )
                  )}
                </Box>
              ))}
              <div ref={chatEndRef} />
            </Box>

            <Box p={2} mt="auto">
              <Box sx={{ display: "flex" }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Start your chat..."
                  value={newMessage}
                  onKeyDown={handleKeyDown}
                  disabled={singleData.status === "Closed"}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <SecondaryButton
                  sx={{ ml: 2 }}
                  className="ml-10"
                  disable={!newMessage.trim()}
                  onClick={handleSendChatMessage}
                  name="Send"
                />
              </Box>
            </Box>
          </Box>
        </Drawer>
      </div>
    </>
  );
};

export default ProposeYourInnovations;
