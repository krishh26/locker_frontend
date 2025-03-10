import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {
  Autocomplete,
  Avatar,
  Box,
  Dialog,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
// import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Style from "./style.module.css";
import { useDispatch } from "react-redux";
// import { userTableMetaData } from 'src/app/contanst/metaData';
import AlertDialog from "../Dialogs/AlertDialog";
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import {
  DangerButton,
  LoadingButton,
  SecondaryButtonOutlined,
} from "../Buttons";
import CourseBuilderComponent from "src/app/component/Courses";
import {
  deleteResourceHandler,
  selectResourceManagement,
} from "app/store/resourcesManagement";
import { useSelector } from "react-redux";
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
import { slice } from "app/store/courseManagement";
import { Link } from "react-router-dom";

export default function ResouresTable(props) {
  const { columns, rows, search_keyword = "", search_role = "" } = props;

  const [deleteId, setDeleteId] = useState("");
  const [openMenuDialog, setOpenMenuDialog] = useState("");

  const { dataUpdatingLoadding, meta_data } = useSelector(
    selectResourceManagement
  );

  const [open, setOpen] = useState(false);

  const dispatch: any = useDispatch();

  // const handleChangePage = (event: unknown, newPage: number) => {
  //     dispatch(fetchCourseAPI({ page: newPage, page_size: userTableMetaData.page_size }))
  // };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const oopen = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const deleteIcon = (id) => {
    setDeleteId(id);
  };

  const openMenu = (e, id) => {
    handleClick(e);
    setOpenMenuDialog(id);
  };

  const deleteConfromation = async () => {
    // await dispatch(deleteResourceHandler(deleteId, meta_data, search_keyword, search_role));
    await dispatch(deleteResourceHandler(deleteId));
    setDeleteId("");
  };

  const handleClose = () => {
    dispatch(slice.updatePreFillData({}));
    setOpen(false);
    setAnchorEl(null)
  };

  const downlaodFile = async (fileUrl, name) => {

    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <>
      <div style={{ width: "100%", overflow: "hidden", marginTop: "0.5rem" }}>
        <TableContainer sx={{ maxHeight: 480, minHeight: 480 }}>
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
                  <TableRow role="checkbox" tabIndex={-1} key={row.resource_id}>
                    {columns?.map((column) => {
                      const value = row[column.id];
                      if (column.id === "actions") {
                        return (
                          <TableCell key={column.id} align={column.align} className="flex justify-center">
                            <IconButton
                              size="small"
                              sx={{ color: "#5B718F" }}
                              onClick={(e) => openMenu(e, row)}
                            >
                              <Link to={row.url.url} target="_blank" rel="noopener" style={{ border: '0px', backgroundColor: 'unset' }}>
                                <VisibilityIcon className="text-24 " />
                              </Link>
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: "#5B718F" }}
                            // onClick={(e) => openMenu(e, row.resource_id)}
                            >
                              <EditIcon className="text-24 " />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: "#5B718F" }}
                              onClick={() =>
                                downlaodFile(row?.url?.url, row?.url.key)
                              }
                            >
                              <DownloadIcon className="text-24 " />
                            </IconButton>
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell key={column.id} align={column.align}>
                          <div className={Style.avatar}>
                            {column.id === "glh"
                              ? `${row?.hours} Hours ${row?.minute} minutes`
                              : value || "Active"}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <div className="flex justify-center p-8">
                    <Pagination
                        page={meta_data?.page}
                        count={Math.ceil(meta_data?.items / userTableMetaData?.page_size)}
                        showFirstButton
                        showLastButton
                        onChange={handleChangePage}
                    />
                </div> */}
      </div>
      <AlertDialog
        open={Boolean(deleteId)}
        close={() => deleteIcon("")}
        title="Delete resource?"
        content="Deleting this resource will also remove all associated data and relationships. Proceed with deletion?"
        actionButton={
          dataUpdatingLoadding ? (
            <LoadingButton />
          ) : (
            <DangerButton onClick={deleteConfromation} name="Delete resource" />
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
        <CourseBuilderComponent edit={true} handleClose={handleClose} />
      </Dialog>
    </>
  );
}
