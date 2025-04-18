import { lazy } from "react";
const ProposeYourInnovationsView = lazy(() => import("./proposeYourInnovations"));
import authRoles from 'src/app/auth/authRoles';

const ProposeYourInnovationsConfig = {
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
  auth: [authRoles.Admin, authRoles.Trainer, authRoles.Learner, authRoles.Employer, authRoles.EQA, authRoles.IQA, authRoles.LIQA], 
  routes: [
    {
      path: "/proposeYourInnovations",
      element: <ProposeYourInnovationsView />
    },
  ],
};

export default ProposeYourInnovationsConfig;
