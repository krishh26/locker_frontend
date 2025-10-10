import Close from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import {
  Dialog,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import FuseLoading from "@fuse/core/FuseLoading";
import { useDebounce } from "@fuse/hooks";
import { fetchResourceAPI, selectResourceManagement } from "app/store/resourcesManagement";
import { SecondaryButton } from "src/app/component/Buttons";
import ResourceUploadDialog from "src/app/component/Dialogs/resourceUploadDialog";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import ResouresTable from "src/app/component/Table/ResourseTable";
import { resourceManagementTableColumn } from "src/app/contanst";
import { useCurrentUser } from "src/app/utils/userHelpers";
import { UserRole } from "src/enum";

const ResourcesCard = () => {
  const dispatch: any = useDispatch();
  const { data, dataFetchLoading } = useSelector(selectResourceManagement);
  const user = useCurrentUser();

  const [open, setOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [jobType, setJobType] = useState<"On" | "Off">(null);

  const jobTypeRef = useRef(jobType);
  useEffect(() => {
    jobTypeRef.current = jobType;
  }, [jobType]);

  const debouncedSearch = useDebounce((value: string) => {
    fetchResources(value, jobTypeRef.current);
  }, 500);

  const fetchResources = (keyword = searchKeyword, job = jobType) => {
    dispatch(fetchResourceAPI({ page: 1, page_size: 25 }, keyword, job));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKeyword(value);
    debouncedSearch(value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") fetchResources(searchKeyword, jobType);
  };

  const handleJobTypeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newJobType = e.target.checked ? "On" : "Off";
    setJobType(newJobType);
    fetchResources(searchKeyword, newJobType);
  };

  const clearSearch = () => {
    setSearchKeyword("");
    fetchResources("", jobType);
  };

  useEffect(() => {
    fetchResources("", jobType);
  }, [dispatch]);

  const renderCreateButton = () =>
    user?.role !== UserRole.Learner && (
      <SecondaryButton
        name="Create Resource"
        startIcon={
          <img
            src="assets/images/svgimage/createcourseicon.svg"
            alt="Create File"
            className="w-6 h-6 mr-2 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
          />
        }
        onClick={() => setOpen(true)}
      />
    );

  return (
    <>
      <div className="m-24 flex items-center justify-between">
        <div className="w-2/3 flex gap-12 items-center">
          <TextField
            label="Search by name and description"
            fullWidth
            size="small"
            className="w-1/2"
            value={searchKeyword}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {searchKeyword ? (
                    <Close
                      onClick={clearSearch}
                      sx={{ color: "#5B718F", fontSize: 18, cursor: "pointer" }}
                    />
                  ) : (
                    <IconButton
                      disableRipple
                      sx={{ color: "#5B718F" }}
                      onClick={() => fetchResources()}
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
                checked={jobType === "On"}
                onChange={handleJobTypeToggle}
                color="primary"
              />
            }
            label={`Job Type: ${jobType ? jobType : "On/Off"}`}
          />
        </div>
        {data?.length > 0 && renderCreateButton()}
      </div>

      {dataFetchLoading ? (
        <FuseLoading />
      ) : data?.length > 0 ? (
        <ResouresTable
          columns={resourceManagementTableColumn}
          rows={data}
          search_keyword={searchKeyword}
          search_role={jobType}
        />
      ) : (
        <div className="flex flex-col justify-center items-center gap-10" style={{ height: "94%" }}>
          <DataNotFound width="25%" />
          <Typography variant="h5">No data found</Typography>
          <Typography variant="body2" className="text-center">
            It is a long established fact that a reader will be <br />distracted by the readable content.
          </Typography>
          {renderCreateButton()}
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          ".MuiDialog-paper": {
            borderRadius: "4px",
            padding: "1rem",
          },
        }}
      >
        <ResourceUploadDialog dialogFn={{ handleClose: () => setOpen(false) }} />
      </Dialog>
    </>
  );
};

export default ResourcesCard;
