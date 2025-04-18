import React, { useState } from "react";
import Style from "./style.module.css";
import { useNavigate } from "react-router-dom";
import Logo from "app/theme-layouts/shared-components/Logo";
import { Divider, Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import instance from "src/app/auth/services/jwtService/jwtService";
import { SecondaryButton } from "../Buttons";
import { useSelector } from "react-redux";
import { selectUser } from "app/store/userSlice";

const Index = () => {
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;

  const [open, setOpen] = useState(false);

  const navigateLogin = () => {
    if (instance.getAccessToken()) {
      if (user?.role === "Learner")
        navigate("/portfolio");
      else
        navigate("/home");
    } else {
      navigate("/sign-in");
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <div className={Style.navbar_container}>
        <div className={Style.navbar}>
          <div className={`mx-24 ${Style.logo}`}>
            <Logo />
          </div>
          <div className="flex items-center">
            <ul className={Style.menu}>
              <a href="#about-us">
                <li className={Style.navbar_link}>About Us</li>
              </a>
              <a href="#products">
                <li className={Style.navbar_link}>Products</li>
              </a>
              <a href="#features-section">
                <li className={Style.navbar_link}>Features</li>
              </a>
              <a href="#why-locker">
                <li className={Style.navbar_link}>Why Locker?</li>
              </a>
            </ul>
            <SecondaryButton
              onClick={navigateLogin}
              className={`${Style.navbar_link} ${Style.login_button}`}
              name={instance.getAccessToken() ? "Dashboard" : "Log in"}
            >
            </SecondaryButton>
          </div>
          <div className={`${Style.navbar_link} ${Style.menu_open_icon}`}>
            <IconButton onClick={handleOpen}>
              <MenuIcon className="text-[#5B718F] " />
            </IconButton>
          </div>
        </div>
      </div>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        sx={{
          "& .MuiDrawer-paper": {
            backgroundColor: "#5B718F",
            width: "60vw",
          },
        }}
      >
        <ul className="text-white">
          <IconButton onClick={handleClose} sx={{ textAlign: "left" }}>
            <CloseIcon />
          </IconButton>
          <Divider light />
          <a href="#about-us">
            <li className={`${Style.navbar_link_mobile}`} onClick={handleClose}>
              About Us
            </li>
          </a>
          <a href="#products">
            <li className={`${Style.navbar_link_mobile}`} onClick={handleClose}>
              Products
            </li>
          </a>
          <a href="#features-section">
            <li className={`${Style.navbar_link_mobile}`} onClick={handleClose}>
              Features
            </li>
          </a>
          <a href="#why-locker">
            <li className={`${Style.navbar_link_mobile}`} onClick={handleClose}>
              Why Locker?
            </li>
          </a>
          <li onClick={navigateLogin} className={`${Style.navbar_link_mobile}`}>
            {instance.getAccessToken() ? "Dashboard" : "Log in"}
          </li>
        </ul>
      </Drawer>
    </>
  );
};

export default Index;
