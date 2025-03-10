import { lazy } from "react";
const HomeView = lazy(() => import("./home"));
import authRoles from 'src/app/auth/authRoles';

const HomeConfig = {
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
      path: "/home",
      element: <HomeView />
    },
  ],
};

export default HomeConfig;
