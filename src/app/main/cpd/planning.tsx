import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { Stack } from "@mui/system";
import {
  Box,
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
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {
  createCpdPlanningAPI,
  deletePlanningHandler,
  getCpdPlanningAPI,
  selectCpdPlanning,
  slice,
  updateCpdPlanningAPI,
} from "app/store/cpdPlanning";
import { selectUser } from "app/store/userSlice";
import { data } from "src/app/component/Chart/doughnut";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  DangerButton,
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "src/app/component/Buttons";
import AlertDialog from "src/app/component/Dialogs/AlertDialog";
import FuseLoading from "@fuse/core/FuseLoading";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import Style from "./style.module.css";

interface Column {
  id:
  | "year"
  | "start_date"
  | "end_date"
  | "cpd_plan"
  | "impact_on_you"
  | "impact_on_colleagues"
  | "impact_on_managers"
  | "impact_on_organisation"
  | "action";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: "year", label: "Year", minWidth: 10 },
  { id: "start_date", label: "Start Date", minWidth: 10 },
  { id: "end_date", label: "End Date", minWidth: 10 },
  {
    id: "cpd_plan",
    label: "CPD Plan",
    minWidth: 20,
    align: "right",
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "impact_on_you",
    label: "On You",
    minWidth: 20,
    align: "right",
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "impact_on_colleagues",
    label: "Colleagues",
    minWidth: 20,
    align: "right",
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "impact_on_managers",
    label: "Managers",
    minWidth: 70,
    align: "right",
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "impact_on_organisation",
    label: "Organization",
    minWidth: 70,
    align: "right",
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "action",
    label: "Action",
    minWidth: 70,
    align: "right",
    format: (value: number) => value.toLocaleString("en-US"),
  },
];

const AddPlanDialogContent = (props) => {
  const {
    edit = "Save",
    formData = {},
    handleChange = () => { },
    minEndDate,
  } = props;

  const Year = new Date().getFullYear();

  const startYear = `${Year - 1}-${String(Year).slice(-2)}`;
  const currentYear = `${Year}-${String(Year + 1).slice(-2)}`;
  const endYear = `${Year + 1}-${String(Year + 2).slice(-2)}`;

  const years = [startYear, currentYear, endYear];

  const formatDate = (date) => {
    if (!date) return "";
    const formattedDate = date.substr(0, 10);
    return formattedDate;
  };

  return (
    <>
      <div>
        <Box className="flex flex-col gap-12 sm:flex-row">
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
                value={formData?.year}
                onChange={handleChange}
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
              Start Date
            </Typography>
            <TextField
              name="start_date"
              size="small"
              type="date"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={formatDate(formData?.start_date)}
              onChange={handleChange}
              disabled={edit === "view"}
            />
          </div>
          <div className="w-full">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              End Date
            </Typography>
            <TextField
              name="end_date"
              size="small"
              type="date"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                inputProps: { min: minEndDate },
              }}
              value={formatDate(formData?.end_date)}
              onChange={handleChange}
              disabled={edit === "view"}
            />
          </div>
        </Box>
        <Box className="mt-12 flex flex-col justify-between gap-12">
          <div className="w-full">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              What is your CPD plan?
            </Typography>
            <TextField
              name="cpd_plan"
              size="small"
              placeholder="Enter your CPD Plan..."
              fullWidth
              multiline
              rows={5}
              value={formData?.cpd_plan}
              onChange={handleChange}
              disabled={edit === "view"}
            />
          </div>
          <div className="w-full flex flex-col space-y-4">
            <Typography
              sx={{ fontSize: "0.9vw", marginRight: "0.5rem" }}
              className={Style.name}
            >
              Impact
            </Typography>
            <div
              className="border-2"
              style={{
                padding: "1rem",
                border: "1px solid #E4E3E3",
                borderRadius: "4px",
              }}
            >
              {[
                {
                  label: "On you:-",
                  name: "impact_on_you",
                  value: formData.impact_on_you,
                },
                {
                  label: "Colleagues:-",
                  name: "impact_on_colleagues",
                  value: formData?.impact_on_colleagues,
                },
                {
                  label: "Managers:-",
                  name: "impact_on_managers",
                  value: formData.impact_on_managers,
                },
                {
                  label: "Organization:-",
                  name: "impact_on_organisation",
                  value: formData.impact_on_organisation,
                },
              ]?.map((group) => (
                <div key={group.name} className={`flex items-center ${Style.impact_value}`}>
                  <Typography
                    sx={{
                      fontSize: "0.9vw",
                      marginRight: "0.1rem",
                      minWidth: "10rem",
                    }}
                  >
                    <div className={Style.name}>{group.label}</div>
                  </Typography>
                  <div className="flex space-x-16 m-2" >
                    {[1, 2, 3, 4, 5]?.map((value) => (
                      <label
                        key={`${group.name}-${value}`}
                        className="flex items-center"
                      >
                        <input
                          type="radio"
                          name={group.name}
                          value={value}
                          checked={group.value == String(value)}
                          onChange={handleChange}
                          className="mr-1"
                          disabled={edit === "view"}
                        />
                        {value}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Box>
      </div>
    </>
  );
};

const Planning = (props) => {
  const { dialogType, setDialogType, dataUpdatingLoadding, dataFetchLoading, learnerId } =
    props;

  const { singleData } = useSelector(selectCpdPlanning);

  const [formData, setFormData] = useState({
    year: singleData?.year || "",
    start_date: singleData?.start_date || "",
    end_date: singleData?.end_date || "",
    cpd_plan: singleData?.cpd_plan || "",
    impact_on_you: singleData?.impact_on_you || "",
    impact_on_colleagues: singleData?.impact_on_colleagues || "",
    impact_on_managers: singleData?.impact_on_managers || "",
    impact_on_organisation: singleData?.impact_on_organisation || "",
    activities: [],
    evaluations: [],
    reflections: [],
  });

  const [deleteId, setDeleteId] = useState("");
  const [openMenuDialog, setOpenMenuDialog] = useState<any>({});
  const [edit, setEdit] = useState("save");

  const [open, setOpen] = useState(false);

  const dispatch: any = useDispatch();
  const { data } = useSelector(selectUser);
  const cpdPlanningData = useSelector(selectCpdPlanning);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const isFormValid =
    Object.values(formData).find((data) => data === "") === undefined;

  const fetchPlanningData = () => {
    dispatch(getCpdPlanningAPI(learnerId || data.user_id, ""));
  }

  useEffect(() => {
    fetchPlanningData()
  }, [dispatch]);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const oopen = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const editIcon = (edit, value) => {
    setEdit(edit);
    // setUpdateData(openMenuDialog);
    setOpen(true);
    const singleData = {
      id: openMenuDialog?.id || "",
      year: openMenuDialog?.year || "",
      start_date: openMenuDialog?.start_date || "",
      end_date: openMenuDialog?.end_date || "",
      cpd_plan: openMenuDialog?.cpd_plan || "",
      impact_on_you: openMenuDialog?.impact_on_you || "",
      impact_on_colleagues: openMenuDialog?.impact_on_colleagues || "",
      impact_on_managers: openMenuDialog?.impact_on_managers || "",
      impact_on_organisation: openMenuDialog?.impact_on_organisation || "",
      activities: openMenuDialog?.activities || [],
      evaluations: openMenuDialog?.evaluations || [],
      reflections: openMenuDialog?.reflections || [],
    };
    setFormData(singleData);
    dispatch(slice.setCpdSingledata(singleData));
    dispatch(slice.setDialogType(value));
  };

  const handleSubmit = async () => {
    try {
      let response;
      if (dialogType === "addPlan")
        response = await dispatch(createCpdPlanningAPI({ ...formData }));
      else if (edit == "edit")
        response = await dispatch(updateCpdPlanningAPI({ ...formData }));
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

  const formatDate = (date) => {
    if (!date) return "";
    const formattedDate = date.substr(0, 10);
    return formattedDate;
  };

  const deleteConfromation = async () => {
    await dispatch(deletePlanningHandler(deleteId));
    setDeleteId("");
  };

  const handleClose = () => {
    dispatch(slice.setCpdSingledata({}));
    setOpen(false);
    setDialogType("");
    setAnchorEl(null);
    setEdit("");

    setFormData({
      year: "",
      start_date: "",
      end_date: "",
      cpd_plan: "",
      impact_on_you: "",
      impact_on_colleagues: "",
      impact_on_managers: "",
      impact_on_organisation: "",
      activities: [],
      evaluations: [],
      reflections: [],
    });
  };

  return (
    <>
      <TableContainer sx={{ maxHeight: 440 }} className="-m-12">
        {dataFetchLoading ? (
          <FuseLoading />
        ) : cpdPlanningData.data.length ? (
          <Table stickyHeader aria-label="sticky table" size="small">
            <TableHead>
              <TableRow>
                {columns?.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{
                      minWidth: column.minWidth,
                      backgroundColor: "#F8F8F8",
                    }}
                    className="text-left "
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {cpdPlanningData?.data?.map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns?.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          className="text-left"
                          style={{
                            minWidth: column.minWidth,
                          }}
                        >
                          {column.format && typeof value === "number" ? (
                            column.format(value)
                          ) : column.id === "start_date" ? (
                            formatDate(value)
                          ) : column.id === "end_date" ? (
                            formatDate(value)
                          ) : column.id === "action" ? (
                            <IconButton
                              size="small"
                              sx={{ color: "#5B718F", marginRight: "4px" }}
                              onClick={(e) => openMenu(e, row)}
                            >
                              <MoreHorizIcon fontSize="small" />
                            </IconButton>
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
      {/* <div className="fixed bottom-0 left-0 w-full flex justify-center py-4 mb-14">
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div> */}
      {/* <div className="fixed bottom-0 left-0 w-full flex justify-center py-4 mb-14">
        <Stack spacing={2}>
          <Pagination count={3} variant="outlined" shape="rounded" />
        </Stack>
      </div> */}
      <AlertDialog
        open={Boolean(deleteId)}
        close={() => deleteIcon("")}
        title="Delete Cpd Planning?"
        content="Deleting this cpd planning will also remove all associated data and relationships. Proceed with deletion?"
        className="-224 "
        actionButton={
          dataUpdatingLoadding ? (
            <LoadingButton />
          ) : (
            <DangerButton
              onClick={deleteConfromation}
              name="Delete Cpd Planning"
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
            editIcon("view", "addPlan");
          }}
        >
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            editIcon("edit", "addPlan");
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
        open={open || dialogType == "addPlan"}
        onClose={handleClose}
        sx={{
          ".MuiDialog-paper": {
            borderRadius: "4px",
            width: "100%",
          },
        }}
      >
        <DialogContent>
          <AddPlanDialogContent
            edit={edit}
            setFormData={setFormData}
            formData={formData}
            handleChange={handleChange}
            dataUpdatingLoadding={dataUpdatingLoadding}
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

export default Planning;
