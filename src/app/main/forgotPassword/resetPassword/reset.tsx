import { IconButton, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import { resetPasswordHandler } from "app/store/userManagement";
import Logo from "app/theme-layouts/shared-components/Logo";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoadingButton, SecondaryButton } from "src/app/component/Buttons";
import { passwordReg } from "src/app/contanst/regValidation";
import SideView from "../../../component/Sideview";
import Style from "../Style.module.css";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Reset = () => {
  const [newPassword, setNewPassword] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const dispatch: any = useDispatch();
  const navigate = useNavigate();

  const resetHandler = async () => {
    if (
      newPassword.password === newPassword.confirmPassword &&
      passwordReg.test(newPassword.password)
    ) {
      setLoading(true);
      const response = await dispatch(
        resetPasswordHandler({ email: "", password: newPassword.password })
      );
      if (response) {
        navigate(response);
      }
      setLoading(false);
    }
  };

  const passwordHandler = (e) => {
    setNewPassword((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <div className="flex h-full">
      <div
        className={`w-full md:w-1/2 h-screen relative ${Style.hide_on_small}`}
      >
        <img
          src="/assets/images/svgImage/resetPassword.svg"
          alt="Description"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full p-4 flex flex-col justify-start items-start">
          <h1 className="text-white text-2xl md:text-4xl mb-4 m-56">
            Lorem ipsum is just dummy text
          </h1>
          <p className="text-white md:text-lg mt-2 m-56 text-justify">
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout. The point
            of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters, as opposed to using 'Content here,'
          </p>
        </div>
      </div>
      <SideView />
      {/* <Paper className="h-full flex items-center sm:h-auto md:flex md:items-center md:justify-center w-full sm:w-auto md:h-full md:w-1/2 py-8 px-16 sm:p-48 md:p-64 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none"> */}
      {/* <div className="w-full min-w-300 sm:w-320 mx-auto sm:mx-0 shadow-md rounded-md">
          <Logo />
          <Typography className="my-20 mx-20 text-2xl font-extrabold tracking-tight leading-tight">
            Reset password
          </Typography>
          <Typography className="my-20 mx-20">
            Please enter a secure password. It must be at least 6 characters
            long, containing at least one lowercase letter, one uppercase
            letter, and one digit.
          </Typography>
          <div className="flex flex-col justify-center w-auto my-20 mx-20">
            <TextField
              className="mb-8"
              name="password"
              label="New password"
              value={newPassword.password}
              autoFocus
              type="text"
              variant="outlined"
              size="small"
              required
              fullWidth
              onChange={passwordHandler}
            />

            <TextField
              className="mb-8"
              label="Confirm password"
              name="confirmPassword"
              value={newPassword.confirmPassword}
              type="password"
              variant="outlined"
              size="small"
              required
              fullWidth
              onChange={passwordHandler}
            />
            {loading ? (
              <LoadingButton />
            ) : (
              <SecondaryButton
                name="Reset"
                onClick={resetHandler}
                disable={
                  newPassword.password !== newPassword.confirmPassword ||
                  !passwordReg.test(newPassword.password)
                }
              />
            )}
          </div>
        </div> */}
      <div className="w-full md:w-1/2 h-full flex items-center justify-center py-8 px-16 sm:py-48 sm:px-48 md:py-64 md:px-64 relative">
        <img
          src="/assets/images/svgImage/signin1.svg"
          alt="Top Right Image"
          className={`absolute top-0 right-0 w-100 h-100 object-cover ${Style.top_right_image}`}
        />
        <img
          src="/assets/images/svgImage/signin2.svg"
          className={`absolute top-0 mt-24 left-0 ml-48 w-100 h-100 object-cover ${Style.top_left_image}`}
        />
        <img
          src="/assets/images/svgImage/signin3.svg"
          alt="Bottom Center Image"
          className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4 w-100 h-100 object-cover ${Style.bottom_center_image}`}
        />
        <div className="w-full min-w-300 sm:w-320 shadow-md rounded-md">
          <Logo />
          <Typography className="my-20 mx-20 text-2xl font-extrabold tracking-tight leading-tight">
            Reset password
          </Typography>
          <Typography className="my-20 mx-20">
            Please enter a secure password. It must be at least 6 characters
            long, containing at least one lowercase letter, one uppercase
            letter, and one digit.
          </Typography>
          <div className="flex flex-col justify-center w-auto my-20 mx-20">
            <TextField
              className="mb-8"
              name="password"
              label="New password"
              value={newPassword.password}
              autoFocus
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              size="small"
              required
              fullWidth
              onChange={passwordHandler}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" className="ml-0">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ?
                        <VisibilityOff
                          sx={{
                            fontSize: "2rem",
                            color: "gray",
                            marginLeft: "2px",
                          }}
                        /> :
                        <Visibility
                          sx={{
                            fontSize: "2rem",
                            color: "gray",
                            marginLeft: "2px",
                          }}
                        />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              className="mb-8"
              label="Confirm password"
              name="confirmPassword"
              value={newPassword.confirmPassword}
              type={showConfirmPassword ? 'text' : 'password'}
              variant="outlined"
              size="small"
              required
              fullWidth
              onChange={passwordHandler}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" className="ml-0">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowConfirmPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ?
                        <VisibilityOff
                          sx={{
                            fontSize: "2rem",
                            color: "gray",
                            marginLeft: "2px",
                          }}
                        /> :
                        <Visibility
                          sx={{
                            fontSize: "2rem",
                            color: "gray",
                            marginLeft: "2px",
                          }}
                        />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {loading ? (
              <LoadingButton />
            ) : (
              <SecondaryButton
                name="Reset"
                onClick={resetHandler}
                disable={
                  newPassword.password !== newPassword.confirmPassword ||
                  !passwordReg.test(newPassword.password)
                }
              />
            )}
          </div>
        </div>
      </div>
      {/* </Paper> */}
    </div>
  );
};

export default Reset;
