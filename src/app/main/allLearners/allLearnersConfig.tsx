import { lazy } from "react";
const AllLearnersView = lazy(() => import("./allLearners"));
import authRoles from 'src/app/auth/authRoles';

const AllLearnersConfig = {
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
  auth: [authRoles.Admin, authRoles.Trainer], 
  routes: [
    {
      path: "/allLearners",
      element: <AllLearnersView />
    },
  ],
};

export default AllLearnersConfig;
