import { lazy } from 'react';
import authRoles from 'src/app/auth/authRoles';
const GatewayReport = lazy(() => import("./index"));
/**
 * Gateway Report Route Config
 */
const GatewayReportConfig = {
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
          display: false,
        },
        rightSidePanel: {
          display: false,
        },
      },
    },
  },
  auth: [authRoles.Admin],
  routes: [
    {
      path: '/gateway-report',
      element: <GatewayReport />,
    },
  ],
};

export default GatewayReportConfig;
