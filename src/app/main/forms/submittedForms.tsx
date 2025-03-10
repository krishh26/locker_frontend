import {
    Autocomplete,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    IconButton,
    InputAdornment,
    ListItemText,
    Menu,
    MenuItem,
    Pagination,
    Paper,
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
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { Stack } from "@mui/system";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import NorthEastIcon from '@mui/icons-material/NorthEast';
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
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectUser } from "app/store/userSlice";
import AlertDialog from "src/app/component/Dialogs/AlertDialog";
import FuseLoading from "@fuse/core/FuseLoading";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import { FormBuilder as FormBuilderIo } from "react-formio";
import "formiojs/dist/formio.full.css";
import './style.css'
import { useNavigate } from "react-router-dom";
import { AddUsersToForm, deleteFormHandler, fetchUserAllAPI, getFormDataAPI, getUserAllFormAPI, getUserFormDataAPI, selectFormData, slice } from "app/store/formData";
import { userTableMetaData } from "src/app/contanst/metaData";
import { UserRole } from "src/enum";
import { fetchUserAPI } from "app/store/userManagement";
import Close from "@mui/icons-material/Close";

const SubmittedForms = (props) => {
    const { data } = useSelector(selectUser);
    const { singleData, users, meta_data, dataUpdatingLoadding, dataFetchLoading } = useSelector(selectFormData);
    console.log(users.data);

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [searchKeyword, setSearchKeyword] = useState("");

    const dispatch: any = useDispatch();

    const navigate = useNavigate();

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };

    const handleEdit = (edit) => {
        dispatch(slice.setMode(edit));
        navigate("/forms/create");
        // setSupportData(singleData);
        // handleClickOpen();
    };

    const handleApply = (e, row, edit) => {
        dispatch(slice.setSingleData(row.form));
        dispatch(slice.setFormDataDetails(row.form_data));
        setSelectedRow(row);
        dispatch(slice.setMode(edit));
        navigate("/forms/create");
    }

    const formdata = useSelector(selectFormData);

    useEffect(() => {
        dispatch(getUserAllFormAPI({ page: 1, page_size: 10 }, ""));
    }, [dispatch]);

    const handleChangePage = (event: unknown, newPage: number) => {
        dispatch(
            getFormDataAPI({ page: newPage, page_size: userTableMetaData.page_size })
        );
    };

    const formatDate = (date) => {
        if (!date) return '';
        const formattedDate = date.substr(0, 10);
        return formattedDate;
    };

    const searchByKeywordUser = (e) => {
        if (e.key === "Enter") {
            searchAPIHandler();
        }
    };

    const searchHandler = (e) => {
        setSearchKeyword(e.target.value);
    };

    const searchAPIHandler = () => {
        dispatch(
            getUserAllFormAPI({ page: 1, page_size: 10 }, searchKeyword)
        );
    };

    return (
        <>
            <Grid className="m-10" sx={{ minHeight: 600 }}>
                {data.role === "Admin" &&
                    <Box className="flex justify-between pb-10"
                        sx={{
                            borderBottom: 1,
                            borderColor: "divider",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}>
                        <Grid className="search_filed">
                            <TextField
                                label="Search by keyword"
                                fullWidth
                                size="small"
                                onKeyDown={searchByKeywordUser}
                                onChange={searchHandler}
                                value={searchKeyword}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {searchKeyword ? (
                                                <Close
                                                    onClick={() => {
                                                        setSearchKeyword("");
                                                        dispatch(
                                                            getUserAllFormAPI(
                                                                { page: 1, page_size: 10 },
                                                                "")
                                                        );
                                                    }}
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
                                                    onClick={() => searchAPIHandler()}
                                                    size="small"
                                                >
                                                    <SearchIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Box>}
                <div>
                    <TableContainer sx={{ maxHeight: 530 }} >
                        {dataFetchLoading ? (
                            <FuseLoading />
                        ) : formdata.data.length ? (
                            <Table
                                sx={{ minWidth: 650, heighFaddt: "100%" }}
                                size="small"
                                aria-label="simple table"
                            >
                                <TableHead className="bg-[#F8F8F8]">
                                    <TableRow>
                                        <TableCell>Form Name</TableCell>
                                        <TableCell align="left">Type</TableCell>
                                        <TableCell align="left">User Name</TableCell>
                                        <TableCell align="left">Email</TableCell>
                                        <TableCell align="left">Submit Date</TableCell>
                                        <TableCell align="left">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {formdata.data?.map((row) => (
                                        <TableRow
                                            key={row.form_name}
                                            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                        >
                                            <TableCell
                                                component="th"
                                                scope="row"
                                                sx={{ borderBottom: "2px solid #F8F8F8" }}
                                            >
                                                {row?.form?.form_name}
                                            </TableCell>
                                            <TableCell
                                                align="left"
                                                sx={{ borderBottom: "2px solid #F8F8F8" }}
                                            >
                                                {row?.form?.type}
                                            </TableCell>
                                            <TableCell
                                                align="left"
                                                sx={{ borderBottom: "2px solid #F8F8F8" }}
                                            >
                                                {row?.user?.user_name}
                                            </TableCell>
                                            <TableCell
                                                align="left"
                                                sx={{ borderBottom: "2px solid #F8F8F8" }}
                                            >
                                                {row?.user?.email}
                                            </TableCell>
                                            <TableCell
                                                align="left"
                                                sx={{ borderBottom: "2px solid #F8F8F8" }}
                                            >
                                                {formatDate(row?.created_at)}
                                            </TableCell>
                                            <TableCell
                                                align="left"
                                                sx={{ borderBottom: "2px solid #F8F8F8" }}
                                            ><IconButton
                                                size="small"
                                                sx={{ color: "#5B718F", marginRight: "4px" }}
                                                onClick={(e) => handleApply(e, row, "view")}
                                            >
                                                    <NorthEastIcon fontSize="small" />
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
                    </TableContainer>
                    <div className="fixed bottom-0 left-0 w-full flex justify-center py-4">
                        <Stack
                            spacing={2}
                            className="flex justify-center items-center w-full my-12"
                        >
                            <Pagination
                                count={meta_data?.pages}
                                page={meta_data?.page}
                                variant="outlined"
                                onChange={handleChangePage}
                                shape="rounded"
                                siblingCount={1}
                                boundaryCount={1}
                            />
                        </Stack>
                    </div>
                </div>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem
                        onClick={() => {
                            handleEdit("view");
                            handleClose();
                        }}>
                        View
                    </MenuItem>
                </Menu>
            </Grid>
        </>
    );
};

export default SubmittedForms;
