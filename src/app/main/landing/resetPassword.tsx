import { Box, IconButton, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import { updatePasswordHandler } from "app/store/userManagement";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { passwordReg } from "src/app/contanst/regValidation";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import jwtDecode from "jwt-decode";
import { LoadingButton, SecondaryButton } from "src/app/component/Buttons";
import { showMessage } from "app/store/fuse/messageSlice";
import { useNavigate } from "react-router-dom";

const ResetPassword = (props) => {


    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const decoded: any = jwtDecode(token);

    const dispatch: any = useDispatch();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState({
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleClickShowConfirmPassword = () => {
        setShowConfirmPassword((prev) => !prev);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const passwordHandler = (e) => {
        setNewPassword((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleClose = () => {
        setNewPassword({
            password: "",
            confirmPassword: "",
        })
    };

    const currentTime = Math.floor(Date.now() / 1000);

    const resetHandler = async () => {
        if (
            decoded.exp && decoded.exp > currentTime &&
            newPassword.password === newPassword.confirmPassword &&
            passwordReg.test(newPassword.password)
        ) {
            setLoading(true);
            await dispatch(
                updatePasswordHandler({ email: decoded?.email, password: newPassword.password })
            );
            setLoading(false);
        } else {
            console.log('Token has expired');
        }
        navigate("/")
        handleClose();
    };

    return (
        <div className="flex h-full">
            <div className="w-full h-full flex flex-col items-center justify-center py-8 px-16 sm:py-48 sm:px-48 md:py-64 md:px-64 relative">
                <img
                    src="/assets/images/svgImage/signin1.svg"
                    alt="Top Right Image"
                    className={`absolute top-0 right-0 w-100 h-100 object-cover`}
                />
                <img
                    src="/assets/images/svgImage/signin2.svg"
                    className={`absolute top-0 mt-24 left-0 ml-48 w-100 h-100 object-cover`}
                />
                <img
                    src="/assets/images/svgImage/signin3.svg"
                    alt="Bottom Center Image"
                    className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4 w-100 h-100 object-cover`}
                />
                <div className="w-full min-w-1/4 sm:w-1/4 shadow-md rounded-md bg-white absolute z-20">
                    <Typography className="text-2xl font-extrabold tracking-tight leading-tight m-20">
                        Reset Password
                    </Typography>
                    <hr />
                    <div className="flex flex-col justify-center w-auto m-20 gap-12">
                        <div>
                            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", fontWeight: "500", }}>
                                New password
                            </Typography>
                            <TextField
                                className="mb-8"
                                name="password"
                                placeholder="New password"
                                value={newPassword?.password}
                                autoFocus
                                type={showPassword ? 'text' : 'password'}
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
                        </div>
                        <div>
                            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem", fontWeight: "500", }}>
                                Confirm password
                            </Typography>
                            <TextField
                                className="mb-8"
                                placeholder="Confirm password"
                                name="confirmPassword"
                                value={newPassword?.confirmPassword}
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
                                                {showConfirmPassword ?
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
                        </div>
                        <div className='mb-4 mr-6'>
                            {loading ? (
                                <LoadingButton />
                            ) : (
                                <>
                                    <SecondaryButton
                                        className="w-full"
                                        name="Reset"
                                        onClick={resetHandler}
                                        disable={
                                            newPassword.password !== newPassword.confirmPassword ||
                                            !passwordReg.test(newPassword.password)
                                        }
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
