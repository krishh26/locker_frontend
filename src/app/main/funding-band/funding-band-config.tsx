import { lazy } from "react";
const FundingBandList = lazy(() => import("./funding-band-list"));
import authRoles from 'src/app/auth/authRoles';

const FundingBandConfig = {
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
  auth: [authRoles.Admin,],
  routes: [
    {
      path: "/funding-band",
      element: <FundingBandList />
    },
  ],
};

export default FundingBandConfig;
