import { Autocomplete, Dialog, IconButton, InputAdornment, Paper, TextField, Typography, FormControlLabel, Switch } from "@mui/material";
import { useEffect, useState } from "react";
import { SecondaryButton } from "src/app/component/Buttons";
import { useSelector } from "react-redux";
import SearchIcon from "@mui/icons-material/Search";
import Close from "@mui/icons-material/Close";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import { useNavigate } from "react-router-dom";
import ResourceUploadDialog from "src/app/component/Dialogs/resourceUploadDialog";
import { useDispatch } from "react-redux";
import { fetchResourceAPI, selectResourceManagement } from "app/store/resourcesManagement";
import FuseLoading from "@fuse/core/FuseLoading";
import ResouresManagementTable from "src/app/component/Table/ResourseManagementTable";
import { resourceManagementTableColumn } from "src/app/contanst";
import { selectUser } from "app/store/userSlice";

const Resources = () => {

  const { data, dataFetchLoading } = useSelector(selectResourceManagement)
  const [open, setOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [jobType, setJobType] = useState(false); // false = off, true = on
  const dispatch: any = useDispatch();

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const searchByKeywordUser = (e) => {
    if (e.key === "Enter") {
      searchAPIHandler();
    }
  };

  const searchHandler = (e) => {
    setSearchKeyword(e.target.value);
  };

  const handleJobTypeChange = (e) => {
    setJobType(e.target.checked);
    dispatch(fetchResourceAPI({ page: 1, page_size: 25 }, searchKeyword, e.target.checked ? "On" : "Off"));
  };

  const searchAPIHandler = () => {
    dispatch(fetchResourceAPI({ page: 1, page_size: 25 }, searchKeyword, jobType ? "On" : "Off"));
  };

  const clearSearch = () => {
    setSearchKeyword("");
    dispatch(fetchResourceAPI({ page: 1, page_size: 25 }, "", jobType ? "On" : "Off"));
  };

  useEffect(() => {
    dispatch(fetchResourceAPI())
  }, []);

  return (
    <>
      <div className="m-24 flex items-center justify-between">
        <div className="w-2/3 flex gap-12 items-center">
          <TextField
            label="Search by name and description"
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
                      onClick={clearSearch}
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
                      onClick={searchAPIHandler}
                      size="small"
                    >
                      <SearchIcon fontSize="small" />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={jobType}
                onChange={handleJobTypeChange}
                color="primary"
              />
            }
            label={`Job Type: ${jobType ? 'On' : 'Off'}`}
          />
        </div>

        {data?.length ? (
          <SecondaryButton
            name="Create Resource"
            startIcon={
              <img
                src="assets/images/svgimage/createcourseicon.svg"
                alt="Create File"
                className="w-6 h-6 mr-2 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
              />
            }
            onClick={handleOpen}
          />
        ) : null}
      </div>

      {dataFetchLoading ? <FuseLoading /> :
        data?.length ?
          <ResouresManagementTable
            columns={resourceManagementTableColumn}
            rows={data}
            search_keyword={searchKeyword}
            search_role={jobType ? "On" : "Off"}
          />
          :

          <div className="flex flex-col justify-center items-center gap-10 " style={{ height: "94%" }}>
            <DataNotFound width="25%" />
            <Typography variant="h5">No data found</Typography>
            <Typography variant="body2" className="text-center">It is a long established fact that a reader will be <br />distracted by the readable content.</Typography>
            <div className="flex items-center space-x-4">
              {<SecondaryButton
                name="Create Resource"
                startIcon={
                  <img
                    src="assets/images/svgimage/createcourseicon.svg"
                    alt="Create File"
                    className="w-6 h-6 mr-2 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
                  />
                }
                onClick={handleOpen}
              />}
            </div>
          </div>
      }
      <Dialog
        open={open}
        onClose={handleClose}
        sx={{
          ".MuiDialog-paper": {
            borderRadius: "4px",
            padding: "1rem",
          },
        }}
      >
        <ResourceUploadDialog dialogFn={{ handleClose }} />
      </Dialog>
    </>
  );
};

export default Resources;
