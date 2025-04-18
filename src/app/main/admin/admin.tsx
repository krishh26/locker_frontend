import { Tooltip, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import { AdminPageData } from "src/app/contanst";
import Style from "./style.module.css";
import CellTowerIcon from '@mui/icons-material/CellTower';

const Admin = () => {
  return (
    <div className="w-full h-full flex flex-wrap justify-center sm:justify-start">
      {AdminPageData.map((item) => {
        return (
          <div className="p-10" key={item.path}>
            <Tooltip title={item.info} placement="bottom" arrow>
              <Link to={item.path} style={{ textDecoration: "none" }}>
                <Paper
                  elevation={3}
                  className={`rounded-sm w-[18rem] p-52 h-[13rem] mt-20 mx-20 my-0 flex flex-col items-center justify-center ${Style.paper}`}
                >
                  <img
                    src={item.svg}
                    alt="Img"
                    className={`w-68 h-28 max-w-xl mx-auto mb-4 ${Style.item_img}`}
                  />
                  <span className="text-center px-4 md:px-20">{item.name}</span>
                </Paper>
              </Link>
            </Tooltip>
          </div>
        );
      })}
      <div className="p-10 cursor-pointer">
        <Tooltip title="Broad cast messages" placement="bottom" arrow>
          <Link to="/broadcast" style={{ textDecoration: "none" }}>
            <Paper
              elevation={3}
              className={`rounded-sm w-[18rem] p-52 h-[13rem] mt-20 mx-20 my-0 flex flex-col items-center justify-center ${Style.paper}`}
            >
              <CellTowerIcon
                sx={{
                  fontSize: 50
                }}
                className={` mx-auto mb-4 text-[#5b718f] ${Style.item_img}`}
              />
              <span className="text-center px-4 md:px-20">Broad cast</span>
            </Paper>
          </Link>
        </Tooltip>
      </div>
    </div>
  );
};

export default Admin;
