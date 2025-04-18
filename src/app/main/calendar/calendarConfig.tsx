import { lazy } from "react";
const CalendarView = lazy(() => import("./calendar"));
import authRoles from 'src/app/auth/authRoles';

const CalendarConfig = {
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
  auth: [authRoles.Admin, authRoles.Employer, authRoles.Trainer, authRoles.IQA, authRoles.LIQA],
  routes: [
    {
      path: "/calendar",
      element: <CalendarView />
    },
  ],
};

export default CalendarConfig;
