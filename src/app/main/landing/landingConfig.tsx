import { lazy } from "react";
const Landing = lazy(() => import("./landing"));
import authRoles from 'src/app/auth/authRoles';

const LandingConfig = {
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
      path: "/",
      element: <Landing />
    },
  ],
};

export default LandingConfig;
