import { lazy } from "react";
import authRoles from 'src/app/auth/authRoles';
import CreateEmployerDetails from "./employerManagement/userDetails/createEmploye";
const AdminView = lazy(() => import("./admin"));
const UserManagement = lazy(() => import("./userManagement"));
const LearnerManagement = lazy(() => import("./learnerManagement"));
const EmployerManagement = lazy(() => import("./employerManagement"));

const AdminConfig = {
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
      path: "/admin",
      element: <AdminView />,
    },
    {
      path: "/admin/user",
      element: <UserManagement />,
    },
    {
      path: "/admin/learner",
      element: <LearnerManagement />,
    },
    {
      path: "/admin/employer",
      element: <EmployerManagement />,
    },
    {
      path: "/admin/employer/create-employer",
      element: <CreateEmployerDetails />,
    },
  ],
};

export default AdminConfig;
