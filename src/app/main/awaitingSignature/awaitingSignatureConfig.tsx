import { lazy } from "react";
const AwaitingSignatureView = lazy(() => import("./index"));
import authRoles from 'src/app/auth/authRoles';

const AwaitingSignatureConfig = {
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
      path: "/awaiting-signature",
      element: <AwaitingSignatureView />
    },
  ],
};

export default AwaitingSignatureConfig;
