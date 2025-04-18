import { lazy } from "react";
const BroadcastView = lazy(() => import("./broadcast"));
import authRoles from 'src/app/auth/authRoles';

const BroadcastConfig = {
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
      path: "/broadcast",
      element: <BroadcastView />
    },
  ],
};

export default BroadcastConfig;
