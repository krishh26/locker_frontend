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
import { AddUsersToForm, deleteFormHandler, fetchUserAllAPI, getFormDataAPI, getUserFormDataAPI, selectFormData, slice } from "app/store/formData";
import { userTableMetaData } from "src/app/contanst/metaData";
import { UserRole } from "src/enum";
import { fetchUserAPI } from "app/store/userManagement";
import Close from "@mui/icons-material/Close";

const FormBuilder = (props) => {
    const { data } = useSelector(selectUser);
    const { singleData, users, meta_data, dataUpdatingLoadding, dataFetchLoading } = useSelector(selectFormData);
    console.log(users.data);

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [deleteId, setDeleteId] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");

    const deleteIcon = (id) => {
        setDeleteId(selectedRow?.id);
    };

    const deleteConfromation = async () => {
        await dispatch(deleteFormHandler(deleteId));
        dispatch(getFormDataAPI({ page: 1, page_size: 10 }, ""));
        setDeleteId("");
    };

    const dispatch: any = useDispatch();

    const navigate = useNavigate();

    const handleClickOpen = () => {
        navigate("/forms/create");
    };

    const handleClick = (event, row) => {
        dispatch(slice.setSingleData(row));
        setSelectedRow(row);
        setAnchorEl(event.currentTarget);
    };

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
        dispatch(slice.setSingleData(row));
        setSelectedRow(row);
        dispatch(slice.setMode(edit));
        navigate("/forms/create");
    }

    const formdata = useSelector(selectFormData);

    useEffect(() => {
        dispatch(getFormDataAPI({ page: 1, page_size: 10 }, ""));
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

    const handleOpen = () => {
        setOpen(true);
        dispatch(fetchUserAllAPI())
    };

    const handleCloseDialog = () => {
        setOpen(false);
        setSelectedValue("");
        setuserData({ user_ids: [] });
    };

    const [selectedValue, setSelectedValue] = useState("");
    const [userData, setuserData] = useState({ user_ids: [] });

    const handleRadioChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const handleDataUpdate = (event) => {
        setuserData({
            ...userData,
            user_ids: event.target.value,
        });
    };

    const handleSubmit = async () => {
        // Capture the form values here
        if (selectedValue === 'Individual') {
            await dispatch(AddUsersToForm(singleData.id, { user_ids: userData.user_ids }));
        } else {
            await dispatch(AddUsersToForm(singleData.id, { assign: selectedValue }));
        }
        setOpen(false);
        console.log(selectedValue);
        console.log({ user_ids: [userData.user_ids] });
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
            getFormDataAPI({ page: 1, page_size: 10 }, searchKeyword)
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
                                                            getFormDataAPI({ page: 1, page_size: 10 })
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
                        <Grid>
                            <SecondaryButton
                                name="Add Forms"
                                className="p-12"
                                startIcon={<AddIcon sx={{ mx: -0.5 }} />}
                                onClick={() => handleClickOpen()}
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
                                        <TableCell align="left">Description</TableCell>
                                        <TableCell align="left">Type</TableCell>
                                        <TableCell align="left">Created At</TableCell>
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
                                                {row.form_name}
                                            </TableCell>
                                            <TableCell
                                                align="left"
                                                sx={{ borderBottom: "2px solid #F8F8F8" }}
                                            >
                                                {row.description}
                                            </TableCell>
                                            <TableCell
                                                align="left"
                                                sx={{ borderBottom: "2px solid #F8F8F8" }}
                                            >
                                                {row.type}
                                            </TableCell>
                                            <TableCell
                                                align="left"
                                                sx={{ borderBottom: "2px solid #F8F8F8" }}
                                            >
                                                {formatDate(row.created_at)}
                                            </TableCell>
                                            <TableCell
                                                align="left"
                                                sx={{ borderBottom: "2px solid #F8F8F8" }}
                                            >
                                                {data.role === UserRole.Admin ?
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: "#5B718F", marginRight: "4px" }}
                                                        onClick={(e) => handleClick(e, row)}
                                                    >
                                                        <MoreHorizIcon fontSize="small" />
                                                    </IconButton>
                                                    :
                                                    <IconButton
                                                        size="small"
                                                        sx={{ color: "#5B718F", marginRight: "4px" }}
                                                        onClick={(e) => handleApply(e, row, "edit")}
                                                    >
                                                        <NorthEastIcon fontSize="small" />
                                                    </IconButton>
                                                }
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

                <AlertDialog
                    open={Boolean(deleteId)}
                    close={() => deleteIcon("")}
                    title="Delete Form?"
                    content="Deleting this form will also remove all associated data and relationships. Proceed with deletion?"
                    className="-224 "
                    actionButton={
                        dataUpdatingLoadding ? (
                            <LoadingButton />
                        ) : (
                            <DangerButton
                                onClick={deleteConfromation}
                                name="Delete Form"
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
                            // handleUser("user");
                            handleOpen();
                            handleClose();
                        }}>
                        Asign Users
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleEdit("view");
                            handleClose();
                        }}>
                        View
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleEdit("edit");
                            handleClose();
                        }}>
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
                    open={open}
                    onClose={handleCloseDialog}
                    sx={{
                        ".MuiDialog-paper": {
                            borderRadius: "4px",
                            width: "100%",
                        },
                    }}
                >
                    <DialogContent >
                        <Grid /* className="flex flex-col items-start" */>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Select Asign Users</FormLabel>
                                <RadioGroup
                                    aria-label="options"
                                    defaultValue="outlined"
                                    name="radio-buttons-group"
                                // orientation="vertical"
                                >
                                    <FormControlLabel
                                        value="All"
                                        control={<Radio />}
                                        label="All"
                                        onChange={handleRadioChange}
                                    />
                                    <FormControlLabel
                                        value="All Learner"
                                        control={<Radio />}
                                        label="All Learner"
                                        onChange={handleRadioChange}
                                    />
                                    <FormControlLabel
                                        value="All EQA"
                                        control={<Radio />}
                                        label="All EQA"
                                        onChange={handleRadioChange}
                                    />
                                    <FormControlLabel
                                        value="All Trainer"
                                        control={<Radio />}
                                        label="All Trainer"
                                        onChange={handleRadioChange}
                                    />
                                    <FormControlLabel
                                        value="All Employer"
                                        control={<Radio />}
                                        label="All Employer"
                                        onChange={handleRadioChange}
                                    />
                                    <FormControlLabel
                                        value="All IQA"
                                        control={<Radio />}
                                        label="All IQA"
                                        onChange={handleRadioChange}
                                    />
                                    <FormControlLabel
                                        value="All LIQA"
                                        control={<Radio />}
                                        label="All LIQA"
                                        onChange={handleRadioChange}
                                    />
                                    <FormControlLabel
                                        value="Individual"
                                        control={<Radio checked={selectedValue === 'Individual'} onChange={handleRadioChange} />}
                                        label="Individual"
                                        onChange={handleRadioChange}
                                    />
                                    {selectedValue === 'Individual' && (
                                        <Grid className="w-full">
                                            <Typography sx={{ fontSize: '0.9vw', marginBottom: '0.5rem', fontWeight: '500' }}>
                                                Select Users
                                            </Typography>
                                            <Select
                                                name="users"
                                                value={userData.user_ids}
                                                size="small"
                                                placeholder="Select users"
                                                required
                                                fullWidth
                                                multiple
                                                onChange={handleDataUpdate}
                                                renderValue={(selected) =>
                                                    selected.map((id) => {
                                                        const allusers = users.data.find((user) => user.user_id === id);
                                                        return allusers ? allusers.user_name : '';
                                                    }).join(', ')
                                                }
                                            >
                                                {users.data.map((data) => (
                                                    <MenuItem key={data.user_id} value={data.user_id}>
                                                        <Checkbox checked={userData.user_ids.includes(data.user_id)} />
                                                        <ListItemText primary={data.user_name} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </Grid>
                                    )}
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                    </DialogContent>

                    <Box className="flex items-center justify-end m-12 mt-24">
                        <DialogActions>
                            {dataUpdatingLoadding ?
                                <LoadingButton />
                                :
                                <>
                                    <SecondaryButtonOutlined name="Cancel" className=" w-1/12" onClick={handleCloseDialog} />
                                    <SecondaryButton name="Asign Users" className=" ml-10" onClick={handleSubmit} disable={!userData || !selectedValue} />
                                </>
                            }
                        </DialogActions>
                    </Box>
                </Dialog>
            </Grid>
        </>
    );
};

export default FormBuilder;
