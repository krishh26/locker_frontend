import {
  Autocomplete,
  Box,
  Checkbox,
  IconButton,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { roles } from "src/app/contanst";
import {
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "src/app/component/Buttons";
import { timezones } from "src/app/contanst/timezoneData";
import {
  emailValidationMsg,
  mobileValidationMsg,
  nameValidationMsg,
  passwordValidation,
  usernameValidationMsg,
} from "src/app/contanst/regValidation";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";
import { useState } from "react";
import Style from "./style.module.css";

const UserDetails = (props) => {
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

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    handleUpdate({
      target: {
        name: "role",
        value: typeof value === "string" ? value.split(",") : value,
      },
    });
  };
  return (
    <div className="h-full flex flex-col">
      <Box>
        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div>
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
              InputProps={{
                endAdornment: (
                  <Tooltip title={nameValidationMsg} placement="bottom" arrow>
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
          <div>
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
              InputProps={{
                endAdornment: (
                  <Tooltip title={nameValidationMsg} placement="bottom" arrow>
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
        </Box>
        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div>
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

          <div>
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
              InputProps={{
                endAdornment: (
                  <Tooltip title={emailValidationMsg} placement="bottom" arrow>
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
        </Box>
        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div>
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
              type="password"
              required={!updateData}
              fullWidth
              onChange={handleUpdate}
              error={userDataError?.password}
              InputProps={{
                endAdornment: (
                  <Tooltip title={passwordValidation} placement="bottom" arrow>
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

          <div>
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
              type={updateData ? "password" : "text"}
              required={!updateData}
              fullWidth
              onChange={handleUpdate}
              error={userDataError?.confrimpassword}
              InputProps={{
                endAdornment: (
                  <Tooltip
                    title="Password must be same"
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
        </Box>

        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div>
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Mobile<sup>*</sup>
            </Typography>
            <TextField
              name="mobile"
              value={userData?.mobile}
              size="small"
              placeholder="Enter mobile number"
              required
              fullWidth
              onChange={handleUpdate}
              error={userDataError?.mobile}
              InputProps={{
                endAdornment: (
                  <Tooltip title={mobileValidationMsg} placement="bottom" arrow>
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
              Time Zone<sup>*</sup>
            </Typography>
            <Autocomplete
              fullWidth
              size="small"
              value={userData?.time_zone}
              options={timezones.map((option) => option)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select timezone"
                  name="time_zone"
                />
              )}
              onChange={(e, value) =>
                handleUpdate({ target: { name: "time_zone", value: value } })
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

        <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
          <div className="w-full">
            <Typography
              sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
              className={Style.name}
            >
              Role<sup>*</sup>
            </Typography>
            <Select
              multiple
              value={userData?.role}
              fullWidth
              size="small"
              onChange={handleChange}
              input={<OutlinedInput placeholder="Select Role" />}
              renderValue={(selected) => selected.join(", ")}
            >
              {roles.filter(item => item.label !== "Employer")?.map((item) => (
                <MenuItem
                  key={item.value}
                  value={item.label}
                  sx={{ height: "32px" }}
                >
                  <Checkbox checked={userData.role.indexOf(item.label) > -1} />
                  <ListItemText primary={item.label} />
                </MenuItem>
              ))}
            </Select>
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
