import FuseLoading from "@fuse/core/FuseLoading";
import Close from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Card,
  Dialog,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { selectGlobalUser } from "app/store/globalUser";
import { getRoleAPI } from "app/store/learnerManagement";
import {
  fetchUserAPI,
  selectUserManagement
} from "app/store/userManagement";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumb from "src/app/component/Breadcrumbs";
import { SecondaryButton } from "src/app/component/Buttons";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import UserManagementTable from "src/app/component/Table/UserManagementTable";
import { AdminRedirect, roles, userManagementTableColumn } from "src/app/contanst";
import Style from "../style.module.css";
import UserDetails from "./usetDetails";

const Index = () => {
  const { data, dataFetchLoading, dataUpdatingLoadding, meta_data } =
    useSelector(selectUserManagement);
  const dispatch: any = useDispatch();

  const [open, setOpen] = useState(false);
  const [updateData, setUpdateData] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const { pagination } = useSelector(selectGlobalUser)

  useEffect(() => {
    dispatch(fetchUserAPI());
    dispatch(getRoleAPI('Line Manager'));
  }, [dispatch]);

  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    user_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    roles: [],
    time_zone: "",
    line_manager: "",
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    resetValue();
    setUpdateData("");
    setOpen(false);
  };

  const resetValue = () => {
    setUserData({
      first_name: "",
      last_name: "",
      user_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      mobile: "",
      roles: [],
      time_zone: "",
      line_manager: "",
    });
  };

  const searchByKeywordUser = (e) => {
    if (e.key === "Enter") {
      searchAPIHandler();
    }
  };

  const searchHandler = (e) => {
    setSearchKeyword(e.target.value);
  };

  const filterHandler = (e, value) => {
    setFilterValue(value);
  };

  const searchAPIHandler = () => {
    refetchUser()
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    refetchUser(searchKeyword, newPage)

  };

  const refetchUser = (search = searchKeyword, page = 1) => {
    dispatch(fetchUserAPI({ page, page_size: pagination?.page_size }, search, filterValue))
  }

  useEffect(() => {
    refetchUser();
  }, [pagination, filterValue])

  return (
    <div className="overflow-y-scroll">
      <Card className="m-12 rounded-6 relative" style={{ minHeight: "87.9vh" }}>
        <div className="w-full h-full">
          <Breadcrumb linkData={[AdminRedirect]} currPage="User" />
          <div className={Style.create_user}>
            <div className={Style.search_filed}>
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
                              fetchUserAPI(
                                { page: meta_data?.page, page_size: 10 },
                                "",
                                filterValue
                              )
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
              <Autocomplete
                fullWidth
                size="small"
                value={filterValue}
                options={roles.filter(item => item.label !== "Employer")?.map((option) => option.label)}
                renderInput={(params) => (
                  <TextField {...params} label="Search by role" />
                )}
                onChange={filterHandler}
                sx={{
                  ".MuiAutocomplete-clearIndicator": {
                    color: "#5B718F",
                  },
                }}
                PaperComponent={({ children }) => (
                  <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
                )}
              />
            </div>
            <SecondaryButton
              name="Create user"
              startIcon={
                <img
                  src="assets/images/svgimage/createcourseicon.svg"
                  alt="Create user"
                  className="w-6 h-6 mr-2 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
                />
              }
              onClick={handleOpen}
            />
          </div>
          {dataFetchLoading ? (
            <FuseLoading />
          ) : data?.length ? (
            <UserManagementTable
              columns={userManagementTableColumn}
              rows={data}
              handleOpen={handleOpen}
              setUserData={setUserData}
              setUpdateData={setUpdateData}
              meta_data={meta_data}
              dataUpdatingLoadding={dataUpdatingLoadding}
              search_keyword={searchKeyword}
              search_role={filterValue}
              handleChangePage={handleChangePage}
            />
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
          <Dialog
            open={open}
            sx={{
              ".MuiDialog-paper": {
                borderRadius: "4px",
                padding: "1rem",
              },
            }}
          >
            <UserDetails
              handleClose={handleClose}
              updateData={updateData}
              userData={userData}
            />
          </Dialog>
        </div>
      </Card>
    </div>
  );
};

export default Index;
