import React from "react";
import { Typography } from "@mui/material";
function Header({ data }) {
  return (
    <Typography
      sx={{
        fontSize: "30px",
        fontWeight: "600",
        display: "flex",
        justifyContent: "center",
        mt: "25px",
      }}
    >
      {data}
    </Typography>
  );
}
export default Header;
