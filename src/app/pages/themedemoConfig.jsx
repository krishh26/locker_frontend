import { lazy } from "react";
const ThemeDemoPage = lazy(() => import("./ThemeDemoPage"));
import authRoles from 'src/app/auth/authRoles';

const ThemeDemoConfig = {
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
      path: "/themeDemo",
      element: <ThemeDemoPage />
    },
  ],
};

export default ThemeDemoConfig;
