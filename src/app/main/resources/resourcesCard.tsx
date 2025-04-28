import { Dialog, Typography, TextField, InputAdornment, IconButton, FormControlLabel, Switch } from "@mui/material";
import { useEffect, useState } from "react";
import { SecondaryButton } from "src/app/component/Buttons";
import { useSelector } from "react-redux";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import ResourceUploadDialog from "src/app/component/Dialogs/resourceUploadDialog";
import { useDispatch } from "react-redux";
import { fetchResourceAPI, selectResourceManagement } from "app/store/resourcesManagement";
import FuseLoading from "@fuse/core/FuseLoading";
import { resourceManagementTableColumn } from "src/app/contanst";
import ResouresTable from "src/app/component/Table/ResourseTable";
import { selectUser } from "app/store/userSlice";
import { UserRole } from "src/enum";
import SearchIcon from "@mui/icons-material/Search";
import Close from "@mui/icons-material/Close";

const ResourcesCard = () => {

  const { data, dataFetchLoading } = useSelector(selectResourceManagement)
  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;

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
      <div className="m-4 flex items-center justify-between">
        <div className="w-full flex gap-12 items-center">
          <TextField
            label="Search by keyword"
            fullWidth
            size="small"
            className="w-1/3"
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
      </div>

      {dataFetchLoading ? <FuseLoading /> :
        data?.length ?
          <ResouresTable
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
            {user?.role !== UserRole.Learner && <div className="flex items-center space-x-4">
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
            </div>}
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

export default ResourcesCard;
