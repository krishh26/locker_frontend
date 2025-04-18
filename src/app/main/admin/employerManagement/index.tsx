import { useEffect, useState } from "react";
import Breadcrumb from "src/app/component/Breadcrumbs";
import { SecondaryButton } from "src/app/component/Buttons";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import {
  AdminRedirect,
  employerManagementTableColumn,
} from "src/app/contanst";
import Style from "../style.module.css";
import { useSelector } from "react-redux";
import {
  Card,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import FuseLoading from "@fuse/core/FuseLoading";
import Close from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { Link } from "react-router-dom";
import { getEmployerAPI, selectEmployer } from "app/store/employer";
import EmployerManagementTable from "src/app/component/Table/EmployerManagementTable";
import { selectGlobalUser } from "app/store/globalUser";

const Index = () => {
  const { data, dataFetchLoading, dataUpdatingLoadding, meta_data } =
    useSelector(selectEmployer);
  const dispatch: any = useDispatch();
  const { pagination } = useSelector(selectGlobalUser)

  const [searchKeyword, setSearchKeyword] = useState("");

  const searchByKeywordUser = (e) => {
    if (e.key === "Enter") {
      searchAPIHandler();
    }
  };

  const searchHandler = (e) => {
    setSearchKeyword(e.target.value);
  };

  const searchAPIHandler = () => {
    refetchEmployer();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    refetchEmployer(searchKeyword, newPage)

  };

  const refetchEmployer = (search = searchKeyword, page = 1) => {
    dispatch(getEmployerAPI({ page, page_size: pagination?.page_size }, search))
  }

  useEffect(() => {
    refetchEmployer();
  }, [dispatch, pagination])

  return (
    <div className="overflow-y-scroll">
      <Card className="m-12 rounded-6 relative" style={{ minHeight: "87.9vh" }}>
        <div className="w-full h-full">
          <Breadcrumb linkData={[AdminRedirect]} currPage="Employer" />

          <div className={Style.create_user}>
            <div className={Style.search_filed}>
              <TextField
                label="Search by keyword"
                fullWidth
                size="small"
                className="w-1/2"
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
                            refetchEmployer()
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

            </div>
            <Link to="/admin/employer/create-employer">
              <SecondaryButton
                name="Create employer"
                className="h-full"
                startIcon={
                  <img
                    src="assets/images/svgimage/createcourseicon.svg"
                    alt="Create user"
                    className="w-6 h-6 mr-2 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
                  />
                }
              />
            </Link>
          </div>
          {dataFetchLoading ? (
            <FuseLoading />
          ) : data?.length ? (
            <EmployerManagementTable
              columns={employerManagementTableColumn}
              rows={data}
              meta_data={meta_data}
              dataUpdatingLoadding={dataUpdatingLoadding}
              search_keyword={searchKeyword}
              handleChangePage={handleChangePage}
              refetchEmployer={refetchEmployer}
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

        </div>
      </Card>
    </div>
  );
};

export default Index;
