import {
    Grid,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NorthEastIcon from '@mui/icons-material/NorthEast';
import { useEffect, useState } from "react";
import { TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { selectUser } from "app/store/userSlice";
import FuseLoading from "@fuse/core/FuseLoading";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import "formiojs/dist/formio.full.css";
import './style.css'
import { useNavigate } from "react-router-dom";
import { getUserAllFormAPI, selectFormData, slice } from "app/store/formData";
import Close from "@mui/icons-material/Close";
import { selectGlobalUser } from "app/store/globalUser";
import CustomPagination from "src/app/component/Pagination/CustomPagination";

const SubmittedForms = (props) => {

    const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;

    const { singleData, users, meta_data, dataUpdatingLoadding, dataFetchLoading } = useSelector(selectFormData);
    console.log(users.data);

    const [anchorEl, setAnchorEl] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const { pagination } = useSelector(selectGlobalUser)

    const dispatch: any = useDispatch();

    const navigate = useNavigate();

    const fetchFormData = (a = searchKeyword, page = 1) => {
        dispatch(getUserAllFormAPI({ page, page_size: pagination?.page_size }, a));
    }

    const handleClose = () => {
        setAnchorEl(null);
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
        dispatch(slice.setMode(edit));
        navigate("/forms/create");
    }

    const formdata = useSelector(selectFormData);

    useEffect(() => {
        fetchFormData()
    }, [dispatch, pagination]);

    const handleChangePage = (event: unknown, newPage: number) => {
        fetchFormData(searchKeyword, newPage)
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
            getUserAllFormAPI({ page: 1, page_size: pagination?.page_size }, searchKeyword)
        );
    };

    return (
        <>
            <Grid className="m-10" sx={{ minHeight: 600 }}>
                {user?.role === "Admin" &&
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
                                                        fetchFormData("")
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
                    <TableContainer sx={{ minHeight: 580, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        {dataFetchLoading ? (
                            <FuseLoading />
                        ) : formdata.data?.length ? (
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
                        <CustomPagination
                            pages={meta_data?.pages}
                            page={meta_data?.page}
                            handleChangePage={handleChangePage}
                            items={meta_data?.items}
                        />
                    </TableContainer>
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
