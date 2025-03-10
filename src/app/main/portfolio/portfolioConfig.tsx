import { lazy } from "react";
const PortfolioView = lazy(() => import("./portfolio"));
import authRoles from "src/app/auth/authRoles";
import UploadedEvidenceFile from "src/app/component/Cards/uploadedEvidenceFile";
import NewSession from "./newsession";
import NewAssignment from "src/app/component/Cards/newAssignment";
import LearnerToData from "./learnerData/learnertodata";
import ProgressMap from "../createAssignment/progressMap";

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
      element: <PortfolioView />,
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
      path: "/portfolio/newsession",
      element: <NewSession />,
    },
    {
      path: "/portfolio/learnertodata",
      element: <LearnerToData />,
    },
    {
      path: "/portfolio/progress",
      element: <ProgressMap />,
    }
  ],
};

export default PortfolioConfig;
