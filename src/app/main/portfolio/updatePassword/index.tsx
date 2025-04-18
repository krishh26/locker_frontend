import { Box, IconButton, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import { resetPasswordHandler } from "app/store/userManagement";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoadingButton, SecondaryButton } from "src/app/component/Buttons";
import { passwordReg } from "src/app/contanst/regValidation";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const UpdatePassword = (props) => {

    const { newPassword, passwordHandler } = props;

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
        <Box className="flex flex-col justify-between p-0">
            <Typography className="text-2xl font-extrabold tracking-tight leading-tight m-20">
                Create New Password
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
                        value={newPassword.password}
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
            </div>
        </Box>
    );
};

export default UpdatePassword;
