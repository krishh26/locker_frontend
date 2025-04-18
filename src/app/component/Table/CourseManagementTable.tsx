import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {
  Avatar,
  Dialog,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import Style from "./style.module.css";
import { useDispatch } from "react-redux";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AlertDialog from "../Dialogs/AlertDialog";
import {
  DangerButton,
  LoadingButton,
  SecondaryButtonOutlined,
} from "../Buttons";
import {
  deleteCourseHandler,
  slice,
} from "app/store/courseManagement";
import CourseBuilderComponent from "src/app/component/Courses";
import { getRandomColor } from "src/utils/randomColor";
import CustomPagination from "../Pagination/CustomPagination";

export default function CourseManagementTable(props) {
  const {
    columns,
    rows,
    setUpdateData = () => { },
    meta_data,
    dataUpdatingLoadding,
    search_keyword = "",
    search_role = "",
    handleChangePage
  } = props;

  const [deleteId, setDeleteId] = useState("");
  const [openMenuDialog, setOpenMenuDialog] = useState("");
  const [edit, setEdit] = useState("view");

  const [open, setOpen] = useState(false);

  const dispatch: any = useDispatch();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const oopen = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const editIcon = (edit) => {
    setEdit(edit);
    setUpdateData(openMenuDialog);
    setOpen(true);
    const data = rows.find((item) => item.course_id === openMenuDialog);
    console.log(data, '+++')
    const preFillData = {
      course_id: data?.course_id,
      assessment_language: data?.assessment_language || "",
      assessment_methods: data?.assessment_methods || "",
      brand_guidelines: data?.brand_guidelines || "",
      course_code: data?.course_code || "",
      course_name: data?.course_name || "",
      guided_learning_hours: data?.guided_learning_hours || "",
      internal_external: data?.internal_external || "",
      level: data?.level || "",
      operational_start_date: data?.operational_start_date || "",
      overall_grading_type: data?.overall_grading_type || "",
      permitted_delivery_types: data?.permitted_delivery_types || "",
      qualification_status: data?.qualification_status || "",
      qualification_type: data?.qualification_type || "",
      course_type: data?.course_type || "",
      recommended_minimum_age: data?.recommended_minimum_age || "",
      sector: data?.sector || "",
      total_credits: data?.total_credits || "",
      units: data?.units,
    };
    dispatch(slice.updatePreFillData(preFillData));
  };

  const deleteIcon = (id) => {
    setDeleteId(id);
  };

  const openMenu = (e, id) => {
    handleClick(e);
    setOpenMenuDialog(id);
  };

  const deleteConfromation = async () => {
    await dispatch(
      deleteCourseHandler(deleteId, meta_data, search_keyword, search_role)
    );
    setDeleteId("");
  };

  const handleClose = () => {
    dispatch(slice.updatePreFillData({}));
    setOpen(false);
    setAnchorEl(null);
  };
  return (
    <>
      <div style={{ width: "100%", overflow: "hidden", marginTop: "0.5rem" }}>
        <TableContainer sx={{ minHeight: 550, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
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
                    key={row.course_id}
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
                            <IconButton
                              size="small"
                              sx={{ color: "#5B718F", marginRight: "4px" }}
                              onClick={(e) => openMenu(e, row.course_id)}
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
        title="Delete course?"
        content="Deleting this course will also remove all associated data and relationships. Proceed with deletion?"
        actionButton={
          dataUpdatingLoadding ? (
            <LoadingButton />
          ) : (
            <DangerButton onClick={deleteConfromation} name="Delete course" />
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
            editIcon("view");
          }}
        >
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            editIcon("edit");
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
        fullScreen
        sx={{
          ".MuiDialog-paper": {
            borderRadius: "4px",
            padding: "1rem",
          },
        }}
      >
        <CourseBuilderComponent edit={edit} handleClose={handleClose} />
      </Dialog>
    </>
  );
}
