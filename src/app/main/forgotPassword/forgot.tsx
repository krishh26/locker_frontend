import { Paper, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { LoadingButton, SecondaryButton } from "src/app/component/Buttons";
import OtpValidation from "./otpValidation";
import Logo from "app/theme-layouts/shared-components/Logo";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  sendOTPMailHandler,
  verifyOTPMailHandler,
} from "app/store/userManagement";
import { emailReg } from "src/app/contanst/regValidation";
import SideView from "../../component/Sideview";
import Style from "./Style.module.css";

const forgot = () => {
  const [email, setEmail] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [loading, setLoading] = useState({
    otp: false,
    mail: false,
  });
  const [timer, setTimer] = useState(0);
  const [otp, setOtp] = useState({
    otpValue: "",
    otp: false,
  });
  const dispatch: any = useDispatch();

  const navigate = useNavigate();
  const emailHandler = (e) => {
    setEmail(e.target.value);
  };

  useEffect(() => {
    if (timer <= 0) {
      return;
    }
    const interval = setInterval(() => {
      if (timer === 1) {
        setTimer(0);
        clearInterval(interval);
      }
      setTimer(timer - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const sendOTPHandler = async () => {
    setLoading((prev) => ({ ...prev, mail: true }));
    const response = await dispatch(sendOTPMailHandler(email));
    if (response) {
      setTimer(59);
      setOtp((prev) => ({ ...prev, otp: true }));
    }
    setLoading((prev) => ({ ...prev, mail: false }));
  };

  const verifyOTPHandler = async () => {
    setLoading((prev) => ({ ...prev, otp: true }));
    await dispatch(verifyOTPMailHandler(otp.otpValue, navigate));
    setLoading((prev) => ({ ...prev, otp: false }));
  };

  return (
    <>
      <div className="flex h-full">
        <div
          className={`w-full md:w-1/2 h-screen relative ${Style.hide_on_small}`}
        >
          <img
            src="/assets/images/svgImage/forgotPassword.svg"
            alt="Description"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 w-full h-full p-4 flex flex-col justify-start items-start">
            <h1 className="text-white text-2xl md:text-4xl mb-4 m-56">
              Lorem ipsum is just dummy text
            </h1>
            <p className="text-white md:text-lg mt-2 m-56 text-justify">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout. The
              point of using Lorem Ipsum is that it has a more-or-less normal
              distribution of letters, as opposed to using 'Content here,'
            </p>
          </div>
        </div>
        <SideView />
        {/* <Paper className="h-full flex items-center sm:h-auto md:flex md:items-center md:justify-center w-full sm:w-auto md:h-full md:w-1/2 py-8 px-16 sm:p-48 md:p-64 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none">
          <div className="w-full min-w-300 sm:w-320 mx-auto sm:mx-0 shadow-md rounded-md">
            <Logo />

            <Typography className="my-20 mx-20 text-2xl font-extrabold tracking-tight leading-tight">
              Forgot password
            </Typography>
            <Typography className="my-20 mx-20">
              Please enter your registered email address to reset your password.
            </Typography>

            <div className="flex flex-col justify-center w-auto my-20 mx-20">
              <TextField
                className="mb-8"
                label="Email"
                value={email}
                autoFocus
                type="email"
                variant="outlined"
                size="small"
                required
                fullWidth
                onChange={emailHandler}
              />
              {otp.otp ? (
                <Typography variant="caption" className="flex justify-end">
                  {timer === 0 ? (
                    <span
                      className="cursor-pointer text-blue underline"
                      onClick={sendOTPHandler}
                    >
                      Resend OTP
                    </span>
                  ) : timer < 10 ? (
                    `00:0${timer}`
                  ) : (
                    `00:${timer}`
                  )}
                </Typography>
              ) : loading.mail ? (
                <LoadingButton />
              ) : (
                <SecondaryButton
                  name="Sent OTP"
                  disable={email.match(emailReg) ? false : true}
                  onClick={sendOTPHandler}
                />
              )}
              {otp.otp && (
                <>
                  <OtpValidation
                    numberOfDigits={6}
                    setOtpError={setOtpError}
                    setOtp={setOtp}
                  />
                  {loading.otp ? (
                    <LoadingButton />
                  ) : (
                    <SecondaryButton
                      name="Verify"
                      disable={otp.otpValue.length === 6 ? false : true}
                      onClick={verifyOTPHandler}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </Paper> */}
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
              Forgot password
            </Typography>
            <Typography className="my-20 mx-20">
              Please enter your registered email address to reset your password.
            </Typography>
            <div className="flex flex-col justify-center w-auto my-20 mx-20">
              <TextField
                className="mb-8"
                label="Email"
                value={email}
                autoFocus
                type="email"
                variant="outlined"
                size="small"
                required
                fullWidth
                onChange={emailHandler}
              />
              {otp.otp ? (
                <Typography variant="caption" className="flex justify-end">
                  {timer === 0 ? (
                    <span
                      className="cursor-pointer text-blue underline"
                      onClick={sendOTPHandler}
                    >
                      Resend OTP
                    </span>
                  ) : timer < 10 ? (
                    `00:0${timer}`
                  ) : (
                    `00:${timer}`
                  )}
                </Typography>
              ) : loading.mail ? (
                <LoadingButton />
              ) : (
                <SecondaryButton
                  name="Sent OTP"
                  disable={email.match(emailReg) ? false : true}
                  onClick={sendOTPHandler}
                />
              )}
              {otp.otp && (
                <>
                  <OtpValidation
                    numberOfDigits={6}
                    setOtpError={setOtpError}
                    setOtp={setOtp}
                  />
                  {loading.otp ? (
                    <LoadingButton />
                  ) : (
                    <SecondaryButton
                      name="Verify"
                      disable={otp.otpValue.length === 6 ? false : true}
                      onClick={verifyOTPHandler}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default forgot;
