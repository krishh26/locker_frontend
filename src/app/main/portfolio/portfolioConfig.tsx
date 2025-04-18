import { lazy } from "react";
import authRoles from "src/app/auth/authRoles";
import ProgressMap from "../createAssignment/progressMap";
const PortfolioView = lazy(() => import("./portfolio"));
import UploadedEvidenceFile from "src/app/component/Cards/uploadedEvidenceFile";
import NewSession from "./newsession";
import NewAssignment from "src/app/component/Cards/newAssignment";
import LearnerToData from "./learnerData/learnertodata";
import LearnerDetails from "./learnerDeatils";
import ResourceData from "./learnerData/resourse";
import ProgressWidget from "./learnerData/progressWidget";
import AssignmentData from "./learnerData/assignmentData";
import CourseProgressMap from "./learnerData/courseProgressMap";
const NewPortfolio = lazy(() => import("./newPortfolio"));


const PortfolioConfig = {
  settings: {
    layout: {
      config: {
        navbar: {
          display: true,
        },
        toolbar: {
          display: true,
        },
        footer: {
          display: false,
        },
        leftSidePanel: {
          display: true,
        },
        rightSidePanel: {
          display: true,
        },
      },
    },
  },
  auth: [authRoles.Admin, authRoles.Learner, authRoles.Trainer, authRoles.Employer, authRoles.LIQA, authRoles.IQA, authRoles.EQA],
  routes: [
    {
      path: "/portfolio",
      element: <NewPortfolio />,
    },
    {
      path: "/portfolio/assingment",
      element: <UploadedEvidenceFile />,
    },
    {
      path: "/portfolio/newassignment",
      element: <NewAssignment />,
    },
    {
      path: "/newsession",
      element: <NewSession />,
    },
    {
      path: "/portfolio/resourceData",
      element: <ResourceData />,
    },
    {
      path: "/portfolio/assignmentData",
      element: <AssignmentData />,
    },
    {
      path: "/portfolio/progressWidget",
      element: <ProgressWidget />,
    },
    {
      path: "/portfolio/courseProgressMap",
      element: <CourseProgressMap />,
    },
    {
      path: "/portfolio/learnertodata",
      element: <LearnerToData />,
    },
    {
      path: "/portfolio/progress",
      element: <ProgressMap />,
    },
    {
      path: "/portfolio/learner-details",
      element: <LearnerDetails />,
    },
  ],
};

export default PortfolioConfig;
