import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectUser } from "app/store/userSlice";
import {
  createEvaluationAPI,
  deleteEvaluationHandler,
  getCpdPlanningAPI,
  selectCpdPlanning,
  slice,
  updateEvaluationAPI,
  uploadImages,
} from "app/store/cpdPlanning";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Cpd from "./cpd";
import AlertDialog from "src/app/component/Dialogs/AlertDialog";
import {
  DangerButton,
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "src/app/component/Buttons";
import { Link } from "react-router-dom";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { FileUploader } from "react-drag-drop-files";
import { showMessage } from "app/store/fuse/messageSlice";
import FuseLoading from "@fuse/core/FuseLoading";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import Style from "./style.module.css";

interface Column {
  id:
  | "learning_objective"
  | "completed"
  | "example_of_learning"
  | "support_you"
  | "feedback"
  | "files"
  | "added_by"
  | "action";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: "learning_objective", label: "Learning Objective", minWidth: 10 },
  { id: "completed", label: "Has it been met", minWidth: 10 },
  {
    id: "example_of_learning",
    label: "Describe an example of how you have applied what you have learnt",
    minWidth: 10,
  },
  { id: "support_you", label: "Who supported you", minWidth: 10 },
  {
    id: "feedback",
    label:
      "Describe any feedback you have had from someone who your learning has had an impact on ir those who have been able to observe your performance",
    minWidth: 10,
  },
  { id: "files", label: "Files", minWidth: 10 },
  { id: "added_by", label: "Added by", minWidth: 10 },
  { id: "action", label: "Action", minWidth: 10 },
];

const AddNewEvaluationDialogContent = (props) => {
  const {
    edit = "Save",
    formData,
    setEvaluationData,
    evaluationData = {},
    handleChangeYear,
  } = props;

  const currentYear = new Date().getFullYear();

  const years = [
    `${currentYear - 1}-${currentYear.toString().slice(-2)}`,
    `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
    `${currentYear + 1}-${(currentYear + 2).toString().slice(-2)}`,
  ];

  const handleEvaluationChange = (e) => {
    const { name, value } = e.target;
    setEvaluationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fileTypes = ["PDF"];
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileChange = (newFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const dispatch: any = useDispatch();

  const handleUploadButtonClick = async () => {
    setUploadedFiles(files);
    if (files.length > 5) {
      dispatch(
        showMessage({
          message: "You can only upload up to 5 files.",
          variant: "error",
        })
      );
      return;
    }
    const data = await dispatch(uploadImages(files));

    console.log(data);

    setEvaluationData((prevData) => ({
      ...prevData,
      files: [...prevData.files, ...data.data],
    }));
    setFiles([]);
  };

  const handleDelete = (fileToDelete) => () => {
    setEvaluationData((prevData) => ({
      ...prevData,
      files: prevData.files.filter((file) => file !== fileToDelete),
    }));
  };

  return (
    <>
      <div>
        <Box className="flex flex-col justify-between gap-12">
          <div className="flex flex-row justify-between gap-12 w-full">
            <div className="w-full">
              <Typography
                sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
                className={Style.name}
              >
                Year
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  labelId="year-select-label"
                  id="year-select"
                  name="year"
                  value={evaluationData?.year}
                  onChange={handleChangeYear}
                  disabled={edit === "view" || edit === "edit"}
                >
                  {years?.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="w-full">
              <Typography
                sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
                className={Style.name}
              >
                Learning Objective
              </Typography>
              <TextField
                name="learning_objective"
                size="small"
                placeholder="lorent's learning"
                fullWidth
                value={evaluationData.learning_objective}
                onChange={handleEvaluationChange}
                disabled={edit === "view"}
              />
            </div>
          </div>
          <div className="w-full">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Completed
            </Typography>
            <Select
              name="completed"
              value={evaluationData.completed}
              onChange={handleEvaluationChange}
              fullWidth
              size="small"
              displayEmpty
              placeholder="Select"
              disabled={edit === "view"}
            >
              <MenuItem value={"Fully"}>Fully</MenuItem>
              <MenuItem value={"Partially"}>Partially</MenuItem>
              <MenuItem value={"Not at all"}>Not at all</MenuItem>
            </Select>
          </div>
          <div className="w-full">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Describe an example of how you have applied what you have learnt
            </Typography>
            <TextField
              name="example_of_learning"
              size="small"
              placeholder="Lorem ipsum is just dummy context....."
              fullWidth
              multiline
              rows={3}
              value={evaluationData.example_of_learning}
              onChange={handleEvaluationChange}
              disabled={edit === "view"}
            />
          </div>
          <div className="w-full">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Who support you
            </Typography>
            <TextField
              name="support_you"
              size="small"
              placeholder="Lorem ipsum dolor sit..."
              fullWidth
              value={evaluationData.support_you}
              onChange={handleEvaluationChange}
              disabled={edit === "view"}
            />
          </div>
          <div className="w-full">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Describe and feedback you have had from someone who your learning
              has had an impact..
            </Typography>
            <TextField
              name="feedback"
              size="small"
              placeholder="Lorem ipsum is just dummy context....."
              fullWidth
              multiline
              rows={3}
              value={evaluationData.feedback}
              onChange={handleEvaluationChange}
              disabled={edit === "view"}
            />
          </div>
          <Box className="flex justify-between gap-12 sm:flex-row">
            <div className="w-full">
              <Typography
                sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
                className={Style.name}
              >
                Choose resource for evaluation
              </Typography>

              <FileUploader
                multiple={true}
                children={
                  <div
                    style={{
                      border: "1px dotted lightgray",
                      padding: "1rem",
                      cursor: "pointer",
                    }}
                  >
                    <div className="flex justify-center mt-8">
                      <img
                        src="assets/images/svgImage/uploadimage.svg"
                        alt="Upload"
                        className="w-64 pb-8"
                      />
                    </div>
                    {files.length > 0 ? (
                      files.map((file, index) => (
                        <p className="text-center mb-4" key={index}>
                          {file.name}
                        </p>
                      ))
                    ) : (
                      <>
                        <p className="text-center mb-4">
                          Drag and drop your files here or{" "}
                          <a className="text-blue-500 font-500 ">Browse</a>
                        </p>
                        <p className="text-center mb-4">
                          Max 10MB files are allowed
                        </p>
                      </>
                    )}
                  </div>
                }
                handleChange={handleFileChange}
                name="file"
                types={fileTypes}
                disabled={edit === "view"}
              />
            </div>
          </Box>
          <div style={{ marginTop: "16px" }}>
            {evaluationData.files.map((file, index) => (
              <Chip
                key={index}
                icon={
                  <Link
                    to={file.url}
                    target="_blank"
                    rel="noopener"
                    style={{ border: "0px", backgroundColor: "unset" }}
                  >
                    <FileCopyIcon />
                  </Link>
                }
                label={
                  <Link
                    to={file.url}
                    target="_blank"
                    rel="noopener"
                    style={{ border: "0px", backgroundColor: "unset" }}
                  >
                    {file.key}
                  </Link>
                }
                onDelete={edit !== "view" ? handleDelete(file) : undefined}
                style={{ margin: "4px" }}
              />
            ))}
          </div>
          <div className="w-full mt-4">
            <Button
              variant="contained"
              color="primary"
              onClick={handleUploadButtonClick}
              disabled={files.length === 0}
            >
              Upload
            </Button>
          </div>
        </Box>
      </div>
    </>
  );
};

const Evaluation = (props) => {
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;

  const {
    setUpdateData = () => { },
    dataUpdatingLoadding,
    dataFetchLoading,
    dialogType,
    setDialogType,
    setFormData = () => { },
    learnerId
  } = props;

  const { singleData } = useSelector(selectCpdPlanning);

  const [evaluationData, setEvaluationData] = useState({
    learning_objective: singleData?.learning_objective || "",
    completed: singleData?.completed || "",
    example_of_learning: singleData?.example_of_learning || "",
    support_you: singleData?.support_you || "",
    feedback: singleData?.feedback || "",
    files: singleData?.files || [],
  });

  const [deleteId, setDeleteId] = useState("");
  const [openMenuDialog, setOpenMenuDialog] = useState<any>({});
  const [edit, setEdit] = useState("save");

  const [open, setOpen] = useState(false);

  const dispatch: any = useDispatch();
  const { data } = useSelector(selectUser);
  const cpdPlanningData = useSelector(selectCpdPlanning);

  const handleChange = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      evaluations: [...prevFormData.evaluations, evaluationData],
    }));
  };

  const isFormValid =
    Object.values(evaluationData).find((data) => data === "") === undefined;

  console.log(isFormValid);

  useEffect(() => {
    dispatch(getCpdPlanningAPI(learnerId || data.user_id, "evaluations"));
  }, [dispatch]);

  // console.log(cpdPlanningData.data.map(item => item.activities));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const oopen = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const editIcon = (edit, value) => {
    setEdit(edit);
    setUpdateData(openMenuDialog);
    setOpen(true);

    const singleData = {
      id: openMenuDialog?.id || "",
      year: openMenuDialog.year || "",
      learning_objective: openMenuDialog?.learning_objective || "",
      completed: openMenuDialog?.completed || "",
      example_of_learning: openMenuDialog?.example_of_learning || "",
      support_you: openMenuDialog?.support_you || "",
      feedback: openMenuDialog?.feedback || "",
      files: openMenuDialog?.files || [],
    };
    setEvaluationData(singleData);
    dispatch(slice.setCpdSingledata(singleData));
    dispatch(slice.setDialogType(value));
    console.log(singleData);
  };

  const [cpdId, setcpdId] = useState("");

  const handleChangeYear = (event) => {
    const { name, value } = event.target;
    setEvaluationData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    if (name == "year") {
      setcpdId(cpdPlanningData.data?.find((item) => item.year === value).id);
    }
  };

  const handleSubmit = async () => {
    try {
      let response;
      let id = singleData.id;
      if (dialogType === "addNewEvaluation")
        response = await dispatch(
          createEvaluationAPI({ ...evaluationData, cpd_id: cpdId })
        );
      else if (edit == "edit")
        response = await dispatch(updateEvaluationAPI(id, evaluationData));
    } catch (error) {
      console.error("Error during submission:", error);
    } finally {
      handleClose();
    }
  };

  const deleteIcon = (id) => {
    setDeleteId(id.id);
  };

  const openMenu = (e, id) => {
    handleClick(e);
    setOpenMenuDialog(id);
  };

  const deleteConfromation = async () => {
    await dispatch(deleteEvaluationHandler(deleteId));
    setDeleteId("");
  };

  const handleClose = () => {
    dispatch(slice.setCpdSingledata({}));
    setOpen(false);
    setAnchorEl(null);
    setDialogType("");
    setEdit("");

    setEvaluationData({
      learning_objective: "",
      completed: "",
      example_of_learning: "",
      support_you: "",
      feedback: "",
      files: [],
    });
  };
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  let allEvaluations = cpdPlanningData.data?.flatMap((item) =>
    item?.evaluations ? item.evaluations : []
  );
  const paginatedData = allEvaluations.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const pageCount = Math.ceil(allEvaluations.length / rowsPerPage);

  return (
    <>
      <div>
        <TableContainer sx={{ maxHeight: 500 }} className="-m-12">
          {dataFetchLoading ? (
            <FuseLoading />
          ) : paginatedData.length ? (
            <Table stickyHeader aria-label="sticky table" size="small">
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
                {paginatedData.map((row) => {
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                    //   key={row.whosupportyou}
                    >
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === "number" ? (
                              column.format(value)
                            ) : column.id === "action" ? (
                              <IconButton
                                size="small"
                                sx={{ color: "#5B718F", marginRight: "4px" }}
                                onClick={(e) => openMenu(e, row)}
                              >
                                <MoreHorizIcon fontSize="small" />
                              </IconButton>
                            ) : column.id === "files" ? (
                              <div style={{ display: "flex" }}>
                                <AvatarGroup
                                  max={4}
                                  className="items-center"
                                  sx={{
                                    ".MuiAvatar-root": {
                                      backgroundColor: "#6d81a3",
                                      width: "3.4rem",
                                      height: "3.4rem",
                                      fontSize: "medium",
                                      border: "1px solid #FFFFFF",
                                    },
                                  }}
                                >
                                  {" "}
                                  {value.map((file, index) => (
                                    <Link
                                      to={file.url}
                                      target="_blank"
                                      rel="noopener"
                                      style={{
                                        border: "0px",
                                        backgroundColor: "unset",
                                      }}
                                    >
                                      <Avatar>
                                        <FileCopyIcon className="text-white text-xl" />
                                      </Avatar>
                                    </Link>
                                  ))}
                                </AvatarGroup>
                              </div>
                            ) : (
                              value
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
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
        </TableContainer>
        <div className="fixed bottom-0 left-0 w-full flex justify-center py-4 mb-14">
          <Stack spacing={2}>
            <Pagination
              count={pageCount}
              variant="outlined"
              shape="rounded"
              page={page}
              onChange={handlePageChange}
              siblingCount={1}
              boundaryCount={1}
            />
          </Stack>
        </div>
      </div>
      <AlertDialog
        open={Boolean(deleteId)}
        close={() => deleteIcon("")}
        title="Delete Evaluation?"
        content="Deleting this evaluation will also remove all associated data and relationships. Proceed with deletion?"
        className="-224 "
        actionButton={
          dataUpdatingLoadding ? (
            <LoadingButton />
          ) : (
            <DangerButton
              onClick={deleteConfromation}
              name="Delete Evaluation"
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
            editIcon("view", "addNewEvaluation");
          }}
        >
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            editIcon("edit", "addNewEvaluation");
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
        open={open || dialogType == "addNewEvaluation"}
        onClose={handleClose}
        sx={{
          ".MuiDialog-paper": {
            borderRadius: "4px",
            width: "100%",
          },
        }}
      >
        <DialogContent>
          <AddNewEvaluationDialogContent
            edit={edit}
            setEvaluationData={setEvaluationData}
            evaluationData={evaluationData}
            dataUpdatingLoadding={dataUpdatingLoadding}
            handleChange={handleChange}
            handleChangeYear={handleChangeYear}
          />
        </DialogContent>

        <Box className="flex items-center justify-end m-12 mt-24">
          <DialogActions>
            {dataUpdatingLoadding ? (
              <LoadingButton />
            ) : (
              <>
                {edit === "view" ? (
                  <SecondaryButtonOutlined
                    name="Cancel"
                    className=" w-1/12"
                    onClick={handleClose}
                  />
                ) : (
                  <SecondaryButtonOutlined
                    name="Cancel"
                    className=" w-1/12"
                    onClick={handleClose}
                  />
                )}
                {edit !== "view" && (
                  <SecondaryButton
                    name={edit === "edit" ? "Update" : "Save"}
                    className=" w-1/12 ml-10"
                    onClick={handleSubmit}
                    disable={!isFormValid}
                  />
                )}
              </>
            )}
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
};

export default Evaluation;
