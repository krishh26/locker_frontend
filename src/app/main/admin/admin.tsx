import { Tooltip, Paper } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { AdminPageData } from "src/app/contanst";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";
import Style from "./style.module.css";
const Admin = () => {
  return (
    <div className="w-full h-full flex flex-wrap justify-center items-center">
      {AdminPageData.map((item) => {
        return (
          <div className="p-10" key={item.path}>
            <Tooltip title={item.info} placement="bottom" arrow>
              <Link to={item.path} style={{ textDecoration: "none" }}>
                <Paper
                  elevation={3}
                  className={`rounded-sm p-56 w-full md:w-4/5 lg:w-3/5 h-96 mx-auto my-0 flex flex-col items-center justify-center ${Style.paper}`}
                >
                  <img
                    src={item.svg}
                    alt="Img"
                    className={`w-full h-auto md:w-2/3 lg:w-1/2 max-w-xl mx-auto mb-4 ${Style.item_img}`}
                  />
                  <span className="text-center px-4 md:px-20">{item.name}</span>
                </Paper>
              </Link>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
};

export default Admin;
