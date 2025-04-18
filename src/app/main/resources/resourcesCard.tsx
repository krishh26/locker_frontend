import { Dialog, Typography } from "@mui/material";
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

const ResourcesCard = () => {

  const { data, dataFetchLoading } = useSelector(selectResourceManagement)
  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;

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
      {data?.length ?
        <div className="m-4 flex items-center justify-between">
          <div className="w-2/4 flex gap-12">
          </div>
        </div>
        : null}

      {dataFetchLoading ? <FuseLoading /> :
        data?.length ?
          <ResouresTable
            columns={resourceManagementTableColumn}
            rows={data}
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
