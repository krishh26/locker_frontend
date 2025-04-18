import React, { useEffect, useState } from "react";
import { DangerButton, LoadingButton, SecondaryButton, SecondaryButtonOutlined } from "src/app/component/Buttons";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import Style from "./style.module.css";
import { useSelector } from "react-redux";
import {
  Avatar,
  AvatarGroup,
  Card,
  Dialog,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import FuseLoading from "@fuse/core/FuseLoading";
import { Link, useNavigate } from "react-router-dom";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FileCopyIcon from '@mui/icons-material/FileCopy';
import AlertDialog from "src/app/component/Dialogs/AlertDialog";
import UploadedEvidenceFile from "src/app/component/Cards/uploadedEvidenceFile";
import { deleteAssignmentHandler, getAssignmentAPI, selectAssignment, slice } from "app/store/assignment";
import { selectUser } from "app/store/userSlice";
import Uploading from "src/app/component/Cards/uploading";
import UploadWorkDialog from "src/app/component/Cards/uploadWorkDialog";
import { UserRole } from "src/enum";
import { selectGlobalUser } from "app/store/globalUser";


interface Column {
  id:
  | "title"
  | "description"
  | "trainer_feedback"
  | "learner_comments"
  | "file"
  | "action"
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: "title", label: "Title", minWidth: 10 },
  { id: "description", label: "Description", minWidth: 10 },
  { id: "trainer_feedback", label: "Trainer Feedback", minWidth: 10 },
  { id: "learner_comments", label: "Learner Comments", minWidth: 10 },
  { id: "file", label: "Files", minWidth: 10 },
  { id: "action", label: "Action", minWidth: 10 },
];


const CreateAssignment = (props) => {

  const { data, dataFetchLoading, dataUpdatingLoadding, singleData } = useSelector(selectAssignment);

  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;
  const { currentUser } = useSelector(selectGlobalUser);

  const dispatch: any = useDispatch();

  const [deleteId, setDeleteId] = useState("");
  const [open, setOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openFile, setOpenFile] = useState(false);
  const [openMenuDialog, setOpenMenuDialog] = useState<any>({});
  const [edit, setEdit] = useState("Save");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const oopen = Boolean(anchorEl);


  const [formData, setFormData] = useState({
    title: "",
    description: "",
    trainer_feedback: "",
    // uploaded_external_feedback: "",
    learner_comments: "",
    points_of_improvement: "",
    assessment_method: [],
    session: "",
    grade: "",
    declaration: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  useEffect(() => {
    dispatch(getAssignmentAPI(user?.user_id));
  }, [dispatch]);


  const handleOpen = () => {
    setOpen(true);
  };

  const handleOpenFile = () => {
    setOpenFile(true);
  };

  const handleOpenForm = () => {
    setOpenForm(true);
  };

  const handleClose = () => {
    setEdit("save");
    setAnchorEl(null);
    setOpen(false);
    setOpenForm(false);
    setOpenFile(false);
  };

  // const searchByKeywordUser = (e) => {
  //   if (e.key === "Enter") {
  //     searchAPIHandler();
  //   }
  // };

  // const filterHandler = (e, value) => {
  //   setFilterValue(value);
  //   dispatch(fetchUserAPI({ page: 1, page_size: 25 }, searchKeyword, value));
  // };

  // const searchAPIHandler = () => {
  //   dispatch(
  //     fetchUserAPI({ page: 1, page_size: 25 }, searchKeyword, filterValue)
  //   );
  // };

  const deleteIcon = (name) => {
    setDeleteId(name.assignment_id);
  };

  const openMenu = (e, id) => {
    handleClick(e);
    dispatch(slice.setSingleData(id));
    setOpenMenuDialog(id);
  };

  const handleEdit = () => {
    setFormData(singleData);
  };

  const deleteConfromation = async () => {
    await dispatch(deleteAssignmentHandler(deleteId));
    setDeleteId("");
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  let allActivities = data?.flatMap(item => item?.activities ? item.activities : []);
  const paginatedData = allActivities.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const pageCount = Math.ceil(allActivities?.length / rowsPerPage);

  return (
    <Card className="m-12 rounded-6" style={{ height: "87.3vh" }}>
      <div className="w-full h-full py-20">
        {/* <Breadcrumb linkData={[AssignmentRedirect]} currPage="User" /> */}
        {/* {data?.length ? ( */}
        <div className={Style.create_user}>
          <div className={Style.search_filed}>
            {/* <TextField
              label="Search by keyword"
              fullWidth
              size="small"
              // onKeyDown={searchByKeywordUser}
              onChange={searchHandler}
              value={searchKeyword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {searchKeyword ? (
                      <Close
                        // onClick={() => {
                        //   setSearchKeyword("");
                        //   dispatch(
                        //     fetchUserAPI(
                        //       { page: 1, page_size: 25 },
                        //       "",
                        //       filterValue
                        //     )
                        //   );
                        // }}
                        sx={{
                          color: "#5B718F",
                          fontSize: 18,
                          cursor: "pointer",
                        }}
                      />
                    ) : (
                      <IconButton
                        id="dashboard-search-events-btn"
                        disableRipple
                        sx={{ color: "#5B718F" }}
                        // onClick={() => searchAPIHandler()}
                        size="small"
                      >
                        <SearchIcon fontSize="small" />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
            <Autocomplete
              fullWidth
              size="small"
              value={filterValue}
              options={roles.map((option) => option.label)}
              renderInput={(params) => (
                <TextField {...params} label="Search by role" />
              )}
              // onChange={filterHandler}
              sx={{
                ".MuiAutocomplete-clearIndicator": {
                  color: "#5B718F",
                },
              }}
              PaperComponent={({ children }) => (
                <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
              )}
            /> */}
          </div>
          {(currentUser.role === UserRole.Learner) && <SecondaryButton
            name="Upload Files"
            className="py-6 px-12 mb-10"
            startIcon={
              <img
                src="assets/images/svgimage/createcourseicon.svg"
                alt="Upload Files"
                className="w-6 h-6 mr-2 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
              />
            }
            onClick={handleOpen}
          />}
        </div>
        {/* ) : null} */}
        <div>
          <TableContainer sx={{ maxHeight: 550, paddingBottom: "2rem" }}>
            {dataFetchLoading ? (
              <FuseLoading />
            ) : data?.length ? (
              <Table
                stickyHeader
                sx={{ minWidth: 650, height: "100%" }}
                size="small"
                aria-label="simple table"
              >
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{
                          minWidth: column.minWidth,
                          backgroundColor: "#F8F8F8",
                        }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row) => (
                    <TableRow hover role="checkbox" tabIndex={-1}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === "number"
                              ? column.format(value)
                              : column.id === "action" ?
                                <IconButton
                                  size="small"
                                  sx={{ color: "#5B718F", marginRight: "4px" }}
                                  onClick={(e) => openMenu(e, row)}
                                >
                                  <MoreHorizIcon fontSize="small" />
                                </IconButton>
                                : column.id === "file" ? (
                                  <div style={{ display: 'flex' }}>
                                    <AvatarGroup max={4}
                                      className="items-center"
                                      sx={{ ".MuiAvatar-root": { backgroundColor: "#6d81a3", width: "3.4rem", height: "3.4rem", fontSize: "medium", border: "1px solid #FFFFFF" } }}
                                    >
                                      {/* {data?.map((file, index) => ( */}
                                      <Link to={value.url} target="_blank" rel="noopener" style={{ border: '0px', backgroundColor: 'unset' }}>
                                        <Avatar>
                                          <FileCopyIcon className="text-white text-xl" />
                                        </Avatar>
                                      </Link>
                                      {/* ))} */}
                                    </AvatarGroup>
                                  </div>
                                ) : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div>
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
              </div>
            )}
            {/* <div className="fixed bottom-0 left-0 w-full flex justify-center py-4 mb-14">
            <Stack spacing={2}>
              <Pagination
                count={meta_data?.pages}
                page={meta_data?.page}
                variant="outlined"
                shape="rounded"
                onChange={handlePageChange}
                siblingCount={1}
                boundaryCount={1}
              />
            </Stack>
          </div> */}
          </TableContainer>
        </div >
        <AlertDialog
          open={Boolean(deleteId)}
          close={() => deleteIcon("")}
          title="Delete Assignment?"
          content="Deleting this assignment will also remove all associated data and relationships. Proceed with deletion?"
          className="-224 "
          actionButton={
            dataUpdatingLoadding ? (
              <LoadingButton />
            ) : (
              <DangerButton onClick={deleteConfromation} name="Delete Assignment" />
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
          open={oopen}
          onClose={handleClose}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              handleOpenFile();
            }}
          >
            Reupload
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              handleOpenForm();
              handleEdit();
              setEdit("view")
            }}
          >
            View
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              handleOpenForm();
              handleEdit();
              setEdit("edit")
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
          open={open}
          onClose={handleClose}
          sx={{
            ".MuiDialog-paper": {
              borderRadius: "4px",
              padding: "1rem",
            },
          }}
        >
          <UploadWorkDialog dialogFn={{ handleClose }} />
        </Dialog>
        <Dialog
          open={openFile}
          onClose={handleClose}
          sx={{
            ".MuiDialog-paper": {
              borderRadius: "4px",
              padding: "1rem",
            },
          }}
        >
          <Uploading dialogFn={{ handleClose }} />
        </Dialog>
        <Dialog
          fullScreen
          open={openForm}
          onClose={handleClose}
          sx={{
            ".MuiDialog-paper": {
              borderRadius: "4px",
              padding: "1rem",
            },
          }}
        >
          <UploadedEvidenceFile
            edit={edit}
            setFormData={setFormData}
            formData={formData}
            handleChange={handleChange}
            handleCheckboxChange={handleCheckboxChange}
            dialogFn={{ handleClose }}
          />
        </Dialog>
      </div>
    </Card>
  );
}

export default CreateAssignment