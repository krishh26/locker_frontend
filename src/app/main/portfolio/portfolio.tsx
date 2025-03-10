import FuseLoading from "@fuse/core/FuseLoading";
import { Avatar, Dialog, Tooltip } from "@mui/material";
import {
  getLearnerDetails,
  selectLearnerManagement,
} from "app/store/learnerManagement";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  SecondaryButton,
  SecondaryButtonOutlined,
} from "src/app/component/Buttons";
import { PortfolioCard } from "src/app/component/Cards";
import DoughnutChart from "src/app/component/Chart/doughnut";
import { portfolioCard } from "src/app/contanst";
import Calendar from "./calendar";
import { Link } from "react-router-dom";
import { selectstoreDataSlice } from "app/store/reloadData";
import { selectUser } from "app/store/userSlice";
import { slice } from "app/store/courseManagement";
import { getRandomColor } from "src/utils/randomColor";
import { slice as courseSlice } from "app/store/courseManagement";

const Portfolio = () => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  }

  const { learner, dataUpdatingLoadding } = useSelector(
    selectLearnerManagement
  );

  const data = useSelector(selectstoreDataSlice);
  const user = useSelector(selectUser);
  const { singleData } = useSelector(selectLearnerManagement);

  const dispatch: any = useDispatch();

  useEffect(() => {
    if (data?.learner_id) dispatch(getLearnerDetails(data?.learner_id));
  }, [data]);

  useEffect(() => {
    if (singleData?.learner_id)
      dispatch(getLearnerDetails(singleData?.learner_id));
    else if (user.data?.learner_id) dispatch(getLearnerDetails(user.data?.learner_id));
  }, [singleData?.learner_id, user.data]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClickData = (event, row) => {
    dispatch(slice.setSingleData(row));
  };

  const handleClickSingleData = (row) => {
    dispatch(courseSlice.setSingleData(row));
  };

  return (
    <div>
      {/* {role === "Learner" && */}
      <div className="m-10 flex flex-wrap justify-evenly gap-10 cursor-pointer">
        {portfolioCard?.map((value, index) => (
          <PortfolioCard data={value} index={index} key={value.id} />
        ))}
      </div>
      {dataUpdatingLoadding ? (
        <FuseLoading />
      ) : (
        <div className="m-24 flex items-center border-1 rounded-8 py-12">
          <div className="flex flex-col w-1/6 justify-center items-center border-r-1">
            <Avatar
              sx={{ width: 100, height: 100, backgroundColor: getRandomColor(learner?.first_name?.toLowerCase().charAt(0)) }}
              src={data?.learner_id ? learner?.avatar : user.data.avatar?.url}
              alt={data?.learner_id ? learner?.first_name?.toUpperCase()?.charAt(0) : user.data.displayName}
            />
            <div className="mt-10">
              {learner?.first_name} {learner?.last_name}
            </div>
          </div>
          <div className="p-4 flex flex-col items-center w-full">
            {learner?.course?.length ? (
              <>
                <div className="text-center text-xl border-b-1 w-4/5 pb-4">
                  Courses
                </div>
                <div className="mt-12 ml-12 mr-auto flex items-center gap-12">
                  {learner?.course?.map((value) => (
                    <div className=" w-fit">
                      <Tooltip title={value?.course?.course_name}>
                        <Link
                          to="/portfolio/learnertodata"
                          style={{
                            color: "inherit",
                            textDecoration: "none",
                          }}
                          onClick={(e) => {
                            handleClickSingleData(value)
                            handleClickData(e, value)
                          }}
                        >
                          <DoughnutChart value={value}/>
                        </Link>
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center opacity-50">
                No courses assigned
              </div>
            )}
          </div>
        </div>
      )
      }
      <div className="flex justify-end mr-24">
        <SecondaryButtonOutlined name="Awaiting Signature" className="mr-12" />
        <SecondaryButton name="Calendar" className="mr-12" onClick={handleOpen} />
        <Link to="/portfolio/newsession">
          <SecondaryButton name="New Session" />
        </Link>
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        sx={{
          ".MuiDialog-paper": {
            borderRadius: "4px",
            padding: "1rem",
            width: "90%",
            maxWidth: "lg",
          },
        }}
      >
        <Calendar />
      </Dialog>
    </div >
  );
};

export default Portfolio;
