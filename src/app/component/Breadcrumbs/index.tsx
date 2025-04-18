import { Breadcrumbs, Link, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const Breadcrumb = (props) => {
  const { linkData, currPage } = props;
  const navigate = useNavigate();
  const redirect = (link) => {
    navigate(link);
  };

  return (
    <Breadcrumbs className="p-10">
      {linkData.map((item) => {
        return (
          <Link
            underline="hover"
            color="inherit"
            onClick={() => redirect(item.link)}
            key={item.link}
            style={{cursor: 'pointer'}}
          >
            {item.name}
          </Link>
        );
      })}
      <Typography color="text.primary">{currPage}</Typography>
    </Breadcrumbs>
  );
};

export default Breadcrumb;
