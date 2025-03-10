import { lazy } from "react";
const MyProfile = lazy(() => import("./myProfile"));
import authRoles from 'src/app/auth/authRoles';

const MyProfileConfig = {
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
  auth: [authRoles.Admin, authRoles.Learner, authRoles.Trainer, authRoles.Employer, authRoles.EQA, authRoles.IQA, authRoles.LIQA],
  routes: [
    {
      path: "/profile",
      element: <MyProfile />
    },
  ],
};

export default MyProfileConfig;