import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
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
  fetchCourseById
} from "app/store/courseManagement";
import { showMessage } from "app/store/fuse/messageSlice";

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
  const [editLoading, setEditLoading] = useState(false);

  const dispatch: any = useDispatch();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const oopen = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const navigate = useNavigate();

  const editIcon = async (mode: 'view' | 'edit') => {
    if (mode === "view") {
      // For view mode, navigate to the dedicated view route
      setEditLoading(true);

      try {
        // Pre-fetch the course data before navigation to ensure it's loaded with all units
        await dispatch(slice.setLoader(true));
        await dispatch(fetchCourseById(openMenuDialog));

        setEditLoading(false);
        navigate(`/courseBuilder/view/${openMenuDialog}`);
      } catch (error) {
        setEditLoading(false);
        dispatch(showMessage({ message: "Error loading course data", variant: "error" }));
      }
    } else {
      // For edit mode, show loader and navigate to the dedicated edit route
      setEditLoading(true);

      try {
        // Pre-fetch the course data before navigation to ensure it's loaded with all units
        await dispatch(slice.setLoader(true));
        const response = await dispatch(fetchCourseById(openMenuDialog));

        // If we have course data with units, mark the course as ready for unit editing
        if (response && response.units && response.units.length > 0) {
          // Store a flag in sessionStorage to indicate we're coming from the edit button
          // This will be used to automatically navigate to the units tab
          sessionStorage.setItem('directEditMode', 'true');
          sessionStorage.setItem('editCourseId', openMenuDialog);
        }

        setEditLoading(false);
        navigate(`/courseBuilder/course/${openMenuDialog}`);
      } catch (error) {
        setEditLoading(false);
        dispatch(showMessage({ message: "Error loading course data", variant: "error" }));
      }
    }
  };

  const deleteIcon = (id: string) => {
    setDeleteId(id);
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, id: string) => {
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
                      if (column.id === "course_core_type") {
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={{ borderBottom: "2px solid #F8F8F8" }}
                          >
                            <span
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor:
                                  value === 'Qualification' ? '#e3f2fd' :
                                  value === 'Standard' ? '#e8f5e9' :
                                  value === 'Gateway' ? '#fff3e0' : '#f5f5f5',
                                color:
                                  value === 'Qualification' ? '#1976d2' :
                                  value === 'Standard' ? '#388e3c' :
                                  value === 'Gateway' ? '#f57c00' : '#757575'
                              }}
                            >
                              {value || 'Unknown'}
                            </span>
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
          disabled={editLoading}
        >
          {editLoading ? "Loading..." : "View"}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            editIcon("edit");
          }}
          disabled={editLoading}
        >
          {editLoading ? "Loading..." : "Edit"}
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


    </>
  );
}
