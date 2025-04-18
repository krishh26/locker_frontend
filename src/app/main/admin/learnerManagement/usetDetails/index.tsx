import {
  Autocomplete,
  Box,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "src/app/component/Buttons";
import {
  usernameValidationMsg,
} from "src/app/contanst/regValidation";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";
import Style from "./style.module.css";
import { useSelector } from "react-redux";
import { selectEmployer } from "app/store/employer";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import MobileNumberInput from "src/app/component/Input/MobileNumberInput";

const UserDetails = (props) => {
  const { data } = useSelector(selectEmployer);

  const {
    handleClose,
    handleUpdate,
    createUserHandler,
    userData,
    updateData,
    updateUserHandler,
    dataUpdatingLoadding,
    userDataError,
  } = props;


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
    <div className="h-full flex flex-col">
      <Box>
        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-1/2">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              First Name<sup>*</sup>
            </Typography>
            <TextField
              name="first_name"
              // label="First Name"
              value={userData?.first_name}
              size="small"
              placeholder="Enter first name"
              required
              fullWidth
              onChange={handleUpdate}
              error={userDataError?.first_name}
            // InputProps={{
            //     endAdornment:
            //         <Tooltip title={nameValidationMsg} placement="bottom" arrow>
            //             <HelpOutlinedIcon sx={{ fontSize: "16px", color: "gray", marginLeft: "2px", cursor: "help" }} />
            //         </Tooltip>
            // }}
            />
          </div>
          <div className="w-1/2">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Last Name<sup>*</sup>
            </Typography>
            <TextField
              name="last_name"
              value={userData?.last_name}
              size="small"
              placeholder="Enter last name"
              required
              fullWidth
              onChange={handleUpdate}
              error={userDataError?.last_name}
            // InputProps={{
            //     endAdornment:
            //         <Tooltip title={nameValidationMsg} placement="bottom" arrow>
            //             <HelpOutlinedIcon sx={{ fontSize: "16px", color: "gray", marginLeft: "2px", cursor: "help" }} />
            //         </Tooltip>
            // }}
            />
          </div>
        </Box>
        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-1/2">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              User Name<sup>*</sup>
            </Typography>
            <TextField
              name="user_name"
              // label="Username"
              value={userData?.user_name}
              size="small"
              placeholder="Enter username"
              required
              fullWidth
              onChange={handleUpdate}
              error={userDataError?.user_name}
              InputProps={{
                endAdornment: (
                  <Tooltip
                    title={usernameValidationMsg}
                    placement="bottom"
                    arrow
                  >
                    <HelpOutlinedIcon
                      sx={{
                        fontSize: "16px",
                        color: "gray",
                        marginLeft: "2px",
                        cursor: "help",
                      }}
                    />
                  </Tooltip>
                ),
              }}
            />
          </div>

          <div className="w-1/2">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Email<sup>*</sup>
            </Typography>
            <TextField
              name="email"
              value={userData?.email}
              size="small"
              placeholder="Enter email"
              required
              fullWidth
              onChange={handleUpdate}
              error={userDataError?.email}
              autoComplete="new-email"
            // InputProps={{
            //     endAdornment:
            //         <Tooltip title={emailValidationMsg} placement="bottom" arrow>
            //             <HelpOutlinedIcon sx={{ fontSize: "16px", color: "gray", marginLeft: "2px", cursor: "help" }} />
            //         </Tooltip>
            // }}
            />
          </div>
        </Box>
        {!updateData && <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-1/2">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Password<sup>*</sup>
            </Typography>

            <TextField
              name="password"
              placeholder="Enter Password"
              value={updateData ? "Locker@2024" : userData?.password}
              size="small"
              type={showPassword ? 'text' : 'password'}
              required={!updateData}
              fullWidth
              onChange={handleUpdate}
              error={userDataError?.password}
              helperText={userDataError?.password ? "Password: 6+ chars, with 1 each: A, a, 0-9." : ""}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  // <Tooltip title={passwordValidation} placement="bottom" arrow>
                  //   <HelpOutlinedIcon
                  //     sx={{
                  //       fontSize: "16px",
                  //       color: "gray",
                  //       marginLeft: "2px",
                  //       cursor: "help",
                  //     }}
                  //   />
                  // </Tooltip>
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

          <div className="w-1/2">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Confirm Password<sup>*</sup>
            </Typography>
            <TextField
              name="confrimpassword"
              placeholder="Enter confirm password"
              value={updateData ? "Locker@2024" : userData?.confrimpassword}
              size="small"
              type={showConfirmPassword ? 'text' : 'password'}
              required={!updateData}
              fullWidth
              onChange={handleUpdate}
              error={userDataError?.confrimpassword}
              helperText={userDataError?.password ? "Password must be same" : ""}
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
        </Box>}

        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-1/2">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Employer<sup>*</sup>
            </Typography>
            <Autocomplete
              disableClearable
              fullWidth
              size="small"
              options={data}
              getOptionLabel={(option: any) => option.employer_name}
              isOptionEqualToValue={(option, value) => option.employer_id === value.employer_id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select employer"
                  name="employer_id"
                />
              )}
              value={data.find(option => option.employer_id === userData?.employer_id) || null}
              onChange={(e, value: any) =>
                handleUpdate({
                  target: { name: "employer_id", value: value ? value.employer_id : "" },
                })
              }
              sx={{
                ".MuiAutocomplete-clearIndicator": {
                  color: "#5B718F",
                },
              }}
              PaperComponent={({ children }) => (
                <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
              )}
            />

          </div>

          <div className="w-1/2">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Mobile
            </Typography>
            {/* <TextField
              name="mobile"
              value={userData?.mobile}
              size="small"
              placeholder="Enter mobile number"
              required
              fullWidth
              onChange={handleUpdate}
              error={userDataError?.mobile}

            // InputProps={{
            //     endAdornment:
            //         <Tooltip title={mobileValidationMsg} placement="bottom" arrow>
            //             <HelpOutlinedIcon sx={{ fontSize: "16px", color: "gray", marginLeft: "2px", cursor: "help" }} />
            //         </Tooltip>
            // }}
            /> */}
            <MobileNumberInput
              value={userData?.mobile}
              handleChange={handleUpdate}
              name={"mobile"}
            />
          </div>
        </Box>

        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-1/2">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              National Insurance Number
            </Typography>

            <TextField
              name="national_ins_no"
              placeholder="Enter national insurance number"
              value={userData?.national_ins_no}
              size="small"
              type="text"
              fullWidth
              onChange={handleUpdate}
            // InputProps={{
            //     endAdornment:
            //         <Tooltip title={passwordValidation} placement="bottom" arrow>
            //             <HelpOutlinedIcon sx={{ fontSize: "16px", color: "gray", marginLeft: "2px", cursor: "help" }} />
            //         </Tooltip>
            // }}
            />
          </div>

          <div className="w-1/2">
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }} className={Style.name}>
              Funding Body<sup>*</sup>
            </Typography>
            {/* <TextField
                            name="funding_body"
                            value={userData?.funding_body}
                            size="small"
                            placeholder='Enter funding details'
                            fullWidth
                            onChange={handleUpdate}
                            error={userDataError?.funding_body}
                        /> */}
            <Autocomplete
              disableClearable
              fullWidth
              size="small"
              value={userData?.funding_body}
              options={[
                "Bursary",
                "Commercial ",
                "Community Learning",
                "EFA",
                "Employer",
                "ESF",
                "ESF",
                "ESFA",
                "Fee Waiver",
                "FWDF",
                "ITA",
                "Levy",
                "MA Fully Funded",
                "MA-Employer",
                "Non-Levy",
                "Other",
                "SAAS",
                "SAAS-Employer",
                "SAAS-Self",
                "SDS",
                "Self",
                "SFA",
                "Student Loan",
              ].map((option) => option)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select funding body"
                  name="funding_body"
                  error={userDataError?.funding_body}
                />
              )}
              onChange={(e, value) =>
                handleUpdate({ target: { name: "funding_body", value: value } })
              }
              sx={{
                ".MuiAutocomplete-clearIndicator": {
                  color: "#5B718F",
                },
              }}
              PaperComponent={({ children }) => (
                <Paper style={{ borderRadius: "4px" }}>{children}</Paper>
              )}
            />
          </div>
        </Box>
      </Box>
      <Box style={{ margin: "auto 1rem 1rem auto" }}>
        {dataUpdatingLoadding ? (
          <LoadingButton />
        ) : (
          <>
            <SecondaryButtonOutlined
              name="Cancel"
              onClick={handleClose}
              style={{ width: "10rem", marginRight: "2rem" }}
            />
            <SecondaryButton
              name={updateData ? "Update" : "Create"}
              style={{ width: "10rem" }}
              onClick={updateData ? updateUserHandler : createUserHandler}
            />
          </>
        )}
      </Box>
    </div>
  );
};

export default UserDetails;
