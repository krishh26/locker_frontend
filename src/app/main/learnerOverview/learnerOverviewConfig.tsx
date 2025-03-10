import { lazy } from "react";
const LearnerOverviewView = lazy(() => import("./learnerOverview"));
import authRoles from 'src/app/auth/authRoles';

const LearnerOverviewConfig = {
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
  auth: [authRoles.Trainer, authRoles.Employer],
  routes: [
    {
      path: "/learnerOverview",
      element: <LearnerOverviewView />
    },
  ],
};

export default LearnerOverviewConfig;
