import { lazy } from "react";
import authRoles from 'src/app/auth/authRoles';

const SafeguardingView = lazy(() => import("./safegurd"));

const SafeguardingConfig = {
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
      path: "/safeguarding",
      element: <SafeguardingView />,
    },
  ],
};

export default SafeguardingConfig;
