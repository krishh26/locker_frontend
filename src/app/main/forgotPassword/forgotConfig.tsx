import { lazy } from "react";
const ForgotView = lazy(() => import("./forgot"));
import authRoles from 'src/app/auth/authRoles';
import Reset from "./resetPassword/reset";

const ForgotConfig = {
  settings: {
    layout: {
      config: {
        navbar: {
          display: false,
        },
        toolbar: {
          display: false,
        },
        footer: {
          display: false,
        },
        leftSidePanel: {
          display: false,
        },
        rightSidePanel: {
          display: false,
        },
      },
    },
  },
  auth: authRoles.onlyGuest, 
  routes: [
    {
      path: "/forgot",
      element: <ForgotView />
    },
    {
      path: "/reset",
      element: <Reset />
    },
  ],
};

export default ForgotConfig;
