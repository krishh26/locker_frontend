import { lazy } from "react";
const TimelogDataExportView = lazy(() => import("./timelogDataExport"));
import authRoles from 'src/app/auth/authRoles';

const TimelogDataExportConfig = {
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
      path: "/timelog-data-export",
      element: <TimelogDataExportView />
    },
  ],
};

export default TimelogDataExportConfig;
