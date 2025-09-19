import { lazy } from "react";
const Wellbeing = lazy(() => import("."));
const WellbeingAdd = lazy(() => import("./add"));
const WellbeingEdit = lazy(() => import("./edit"));
import authRoles from 'src/app/auth/authRoles';

const WellbeingConfig = {
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
      path: "/wellbeing/resources",
      element: <Wellbeing />,
    },
    {
      path: "/wellbeing/resources/add",
      element: <WellbeingAdd />,
    },
    {
      path: "/wellbeing/resources/edit/:id",
      element: <WellbeingEdit />,
    },
  ],
};

export default WellbeingConfig;
