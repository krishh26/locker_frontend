import { lazy } from "react";
const CommunicationsView = lazy(() => import("./communications"));
import authRoles from 'src/app/auth/authRoles';

const CommunicationsConfig = {
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
  auth: [authRoles.Admin], 
  routes: [
    {
      path: "/communications",
      element: <CommunicationsView />
    },
  ],
};

export default CommunicationsConfig;
