import React, { useEffect, useState } from "react";
import Breadcrumb from "src/app/component/Breadcrumbs";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import { AdminRedirect, learnerTableColumn, roles } from "src/app/contanst";
import Style from '../admin/style.module.css'
import { useSelector } from "react-redux";
import { Card, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import FuseLoading from '@fuse/core/FuseLoading';
import Close from "@mui/icons-material/Close";
import SearchIcon from '@mui/icons-material/Search';
import { fetchLearnerAPI, getRoleAPI, selectLearnerManagement } from "app/store/learnerManagement";
import LearnerTable from "src/app/component/Table/LearnerTable";
import { fetchCourseAPI } from "app/store/courseManagement";
import Stylee from "./style.module.css"

const AllLearners = () => {
  const { data, dataFetchLoading, dataUpdatingLoadding, meta_data } = useSelector(selectLearnerManagement)
  const dispatch: any = useDispatch();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterValue, setFilterValue] = useState("");

  useEffect(() => {
    dispatch(fetchLearnerAPI())
    // dispatch(fetchCourseAPI())
  }, [dispatch])

  const searchByKeywordUser = (e) => {
    if (e.key === "Enter") {
      searchAPIHandler();
    }
  }

  const searchHandler = (e) => {
    setSearchKeyword(e.target.value);
  }

  const filterHandler = (e, value) => {
    setFilterValue(value);
    dispatch(fetchLearnerAPI({ page: 1, page_size: 10 }, searchKeyword, value));
  }

  const searchAPIHandler = () => {
    dispatch(fetchLearnerAPI({ page: 1, page_size: 10 }, searchKeyword, filterValue));
  }

  // useEffect(() => {
  //   dispatch(getRoleAPI("Trainer"));
  //   dispatch(getRoleAPI("IQA"));
  //   dispatch(getRoleAPI("EQA"));
  //   dispatch(getRoleAPI("Employer"));
  // }, []);

  return (
    <Card className="m-12 rounded-6" style={{ height: "87.9vh" }}>
      <div className="w-full h-full">
        <Breadcrumb linkData={[AdminRedirect]} currPage="Learner" />

        {data.length ? (
          <div className={Style.create_user}>
            <div className={Style.search_filed}>
              <TextField
                label="Search by keyword"
                fullWidth
                size="small"
                className={`w-1/2 ${Stylee.search}`}
                onKeyDown={searchByKeywordUser}
                onChange={searchHandler}
                value={searchKeyword}
                InputProps={{
                  endAdornment:
                    <InputAdornment position="end" >
                      {
                        searchKeyword ? (
                          <Close
                            onClick={() => {
                              setSearchKeyword("");
                              dispatch(fetchLearnerAPI({ page: 1, page_size: 10 }, "", filterValue));
                            }}
                            sx={{
                              color: "#5B718F",
                              fontSize: 18,
                              cursor: "pointer",
                            }}
                          />
                        ) :
                          <IconButton
                            id="dashboard-search-events-btn"
                            disableRipple
                            sx={{ color: "#5B718F" }}
                            onClick={() => searchAPIHandler()}
                            size="small"
                          >
                            <SearchIcon fontSize="small" />
                          </IconButton>
                      }
                    </InputAdornment>
                }}
              />
            </div>
          </div>
        ) : null}
        {
          dataFetchLoading ? <FuseLoading /> :
            data.length ?
              <LearnerTable
                columns={learnerTableColumn}
                rows={data}
                meta_data={meta_data}
                dataUpdatingLoadding={dataUpdatingLoadding}
                search_keyword={searchKeyword}
                search_role={filterValue}
              />
              :
              <div className="flex flex-col justify-center items-center gap-10 " style={{ height: "94%" }}>
                <DataNotFound width="25%" />
                <Typography variant="h5">No data found</Typography>
                <Typography variant="body2" className="text-center">It is a long established fact that a reader will be <br />distracted by the readable content.</Typography>
              </div>
        }
      </div >
    </Card>
  );
};

export default AllLearners