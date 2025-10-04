import { lazy } from "react";
const AcknowledgeMessage = lazy(() => import("./index"));
import authRoles from 'src/app/auth/authRoles';

const AcknowledgeMessageConfig = {
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
      path: "/admin/acknowledge-message",
      element: <AcknowledgeMessage />
    },
  ],
};

export default AcknowledgeMessageConfig;

