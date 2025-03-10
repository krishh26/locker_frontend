import { lazy } from "react";
const SurverysView = lazy(() => import("./surverys"));
import authRoles from 'src/app/auth/authRoles';

const SurverysConfig = {
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
      path: "/surverys",
      element: <SurverysView />
    },
  ],
};

export default SurverysConfig;
