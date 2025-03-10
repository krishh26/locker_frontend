import { lazy } from "react";
const TimeLogView = lazy(() => import("./timeLog"));
import authRoles from 'src/app/auth/authRoles';
import TimeLog from "./timeLog";

const TimeLogConfig = {
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
  auth: [authRoles.Learner ,authRoles.Trainer, authRoles.Employer, authRoles.IQA, authRoles.LIQA, authRoles.Admin, authRoles.EQA],
  routes: [
    {
      path: "/timeLog",
      element: <TimeLog />
    },
  ],
};

export default TimeLogConfig;
