import { Autocomplete, Dialog, IconButton, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { SecondaryButton } from "src/app/component/Buttons";
import { useSelector } from "react-redux";
import SearchIcon from "@mui/icons-material/Search";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import { useNavigate } from "react-router-dom";
import ResourceUploadDialog from "src/app/component/Dialogs/resourceUploadDialog";
import { useDispatch } from "react-redux";
import { fetchResourceAPI, selectResourceManagement } from "app/store/resourcesManagement";
import FuseLoading from "@fuse/core/FuseLoading";
import { resourceManagementTableColumn } from "src/app/contanst";
import ResouresTable from "src/app/component/Table/ResourseTable";
import { selectUser } from "app/store/userSlice";
import { UserRole } from "src/enum";

const ResourcesCard = () => {

  const { data, dataFetchLoading } = useSelector(selectResourceManagement)
  const user = useSelector(selectUser);
  console.log(user, "{{{{{{")
  const [open, setOpen] = useState(false);
  const dispatch: any = useDispatch();

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    dispatch(fetchResourceAPI())
  }, []);

  return (
    <>
      {data.length ?
        <div className="m-4 flex items-center justify-between">
          <div className="w-2/4 flex gap-12">
            {/* <TextField
              label="Search by keyword"
              fullWidth
              size="small"
              onKeyDown={searchByKeywordUser}
              onChange={searchHandler}
              value={searchKeyword}
              className="w-1/2"
              InputProps={{
                endAdornment:
                  <InputAdornment position="end" >
                    {
                      searchKeyword ? (
                        <Close
                          onClick={() => {
                            setSearchKeyword("");
                            dispatch(fetchUserAPI({ page: 1, page_size: 25 }, "", filterValue));
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
              }}
            /> */}

            {/* <Autocomplete

              className="w-1/2"
              fullWidth
              size="small"
              options={["Course 1", "Course 2"].map((option) => option)}
              renderInput={(params) => (
                <TextField {...params} placeholder="Search by course name" />
              )}
              sx={{
                ".MuiAutocomplete-clearIndicator": {
                  color: "#5B718F",
                }
              }}
              PaperComponent={({ children }) => (
                <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
              )}
            /> */}
          </div>

          {/* <SecondaryButton
            name="Create Resource"
            startIcon={
              <img
                src="assets/images/svgimage/createcourseicon.svg"
                alt="Create File"
                className="w-6 h-6 mr-2 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
              />
            }
            onClick={handleOpen}
          /> */}
        </div>
        : null}

      {dataFetchLoading ? <FuseLoading /> :
        data.length ?
          <ResouresTable
            columns={resourceManagementTableColumn}
            rows={data}
          />
          :

          <div className="flex flex-col justify-center items-center gap-10 " style={{ height: "94%" }}>
            <DataNotFound width="25%" />
            <Typography variant="h5">No data found</Typography>
            <Typography variant="body2" className="text-center">It is a long established fact that a reader will be <br />distracted by the readable content.</Typography>
            {user.data.role !== UserRole.Learner && <div className="flex items-center space-x-4">
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
