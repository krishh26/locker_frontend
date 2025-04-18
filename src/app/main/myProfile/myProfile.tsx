import {
  Avatar,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { selectUser } from "app/store/userSlice";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  SecondaryButton,
  SecondaryButtonOutlined,
} from "src/app/component/Buttons";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import { changePassword, selectUserManagement, uploadAvatar } from "app/store/userManagement";
import { useDispatch } from "react-redux";
import { getRandomColor } from "src/utils/randomColor";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

const CustomInputField = ({ label, name, placeholder, value }) => {
  return (
    <div className="w-1/2">
      <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
        {label}
      </Typography>
      <TextField
        name={name}
        size="small"
        placeholder={placeholder}
        fullWidth
        value={value}
        disabled
      />
    </div>
  );
};

const MyProfile: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("personalDetails");

  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;
  const isLearnerTabOpen = !(!JSON.parse(sessionStorage.getItem('learnerToken'))?.user?.user_id || JSON.parse(sessionStorage.getItem('learnerToken'))?.user.user_id === useSelector(selectUser)?.data?.user_id)

  const { dataUpdatingLoadding } = useSelector(selectUserManagement);
  const fileInputRef: any = useRef();

  const handleopen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const dispatch: any = useDispatch();

  const handleImageUpload = (event) => {
    const selectedImage = event.target.files[0];
    dispatch(uploadAvatar(selectedImage));
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setPasswordData(prevState => ({
  //     ...prevState,
  //     [name]: value,
  //   }));
  // };

  const handleChangePassword = async () => {
    try {
      await dispatch(changePassword({ ...passwordData, user_id: user.user_id }));
    } catch (err) {
      console.log(err);
    } finally {
      handleClose();
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowCurrentPassword = () => {
    setShowCurrentPassword((prev) => !prev);
  };

  const handleClickShowNewPassword = () => {
    setShowNewPassword((prev) => !prev);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };


  return (
    <div className="p-4 m-4 flex">
      <Box
        sx={{
          ".MuiDialog-paper": {
            padding: "1rem",
          },
          display: "flex",
          flexWrap: "wrap",
          "& > :not(style)": {
            m: 1,
            borderRadius: "4px",
            width: 250,
            height: 250,
          },
        }}
      >
        <Paper
          sx={{
            marginLeft: "2px !important",
            marginTop: "0px !important",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div style={{ position: "relative" }}>
            {dataUpdatingLoadding ? (
              <CircularProgress />
            ) : (
              <>
                <Avatar
                  sx={{ width: "120px", height: "120px", bgcolor: getRandomColor(user?.displayName?.toLowerCase().charAt(0)) }}
                  src={user?.avatar?.url}
                  alt={user?.displayName}
                />
                {!isLearnerTabOpen && <IconButton
                  onClick={handleButtonClick}
                  sx={{
                    position: "absolute",
                    width: "24px",
                    height: "24px",
                    backgroundColor: "white",
                    top: 20,
                    right: -10,
                    color: "var(--primary)",
                    "&:hover": {
                      backgroundColor: "white",
                    },
                  }}
                >
                  <ModeEditOutlineOutlinedIcon sx={{ fontSize: "16px" }} />
                </IconButton>}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
              </>
            )}
          </div>
          <Typography sx={{ fontWeight: "bold", textTransform: "capitalize" }}>
            {user?.displayName}
          </Typography>
          <Typography>{user?.email}</Typography>
        </Paper>
      </Box>

      <div className="w-5/6 p-4 bg-white rounded-lg shadow-md h-fit">
        <div className="flex">
          <div
            className={`relative px-4 py-2 m-12 cursor-pointer text-black 
          
            `}
            onClick={() => handleTabClick("personalDetails")}
          >
            Personal Details
            {activeTab === "personalDetails" && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#5B718F] text-white"></div>
            )}
          </div>

          <div
            className={`relative px-4 py-2 m-12 cursor-pointer text-black `}
            onClick={() => handleTabClick("changePassword")}
          >
            Change Password
            {activeTab === "changePassword" && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#5B718F] text-white"></div>
            )}
          </div>
        </div>

        {activeTab === "personalDetails" && (
          <div>
            <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
              <CustomInputField
                value={user?.first_name}
                label="First Name"
                name="first_name"
                placeholder="Enter first name"
              />
              <CustomInputField
                value={user?.last_name}
                label="Last Name"
                name="last_name"
                placeholder="Enter last name"
              />
            </Box>

            <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
              <CustomInputField
                value={user?.user_name}
                label="Username"
                name="user_name"
                placeholder="Enter username"
              />
              <CustomInputField
                value={user?.email}
                label="Email"
                name="email"
                placeholder="Enter email"
              />
            </Box>

            <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
              {/* <CustomInputField
                value={user?.mobile}
                label="Mobile"
                name="mobile"
                placeholder="Enter mobile"
              /> */}
              <div className="w-1/2">
                <Typography
                  sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
                >
                  Mobile
                </Typography>
                <PhoneInput
                  international
                  className="text-[#959ca9] opacity-100"
                  placeholder="Enter phone number"
                  // className="h-fit"
                  value={user?.mobile}
                  style={{
                    border: '1px solid lightgray',
                    padding: "9px",
                    borderRadius: "4px"
                  }}
                  onChange={() => { }}
                  disabled
                />
              </div>
              <CustomInputField
                value={user?.time_zone}
                label="Timezone"
                name="timezone"
                placeholder="Enter timezone"
              />
            </Box>

            <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
              <div className="w-full">
                <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
                  Role
                </Typography>
                <TextField
                  name="roles"
                  size="small"
                  // placeholder="Enter your role"
                  placeholder={user?.roles}
                  fullWidth
                  multiline
                // value={data?.roles}
                // onChange={handleChange}
                />
                {/* <CustomInputField
                  value={data?.roles}
                  label="Role"
                  name="roles"
                  placeholder="Enter your role"
                  // className="w-full"
                /> */}
              </div>
            </Box>
            {/* <Box
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "1rem",
                marginRight: "1rem",
              }}
            >
              <SecondaryButton
                name="Request to Admin"
                style={{ width: "14rem" }}
                className="py-8"
                onClick={handleopen}
              />
            </Box> */}
            <Dialog
              open={open}
              onClose={handleClose}
              sx={{
                ".MuiDialog-paper": {
                  borderRadius: "4px",
                  width: "100%",
                },
              }}
            >
              <DialogContent>
                <div>
                  <Box className="flex flex-col justify-between gap-12">
                    <div>
                      <Typography
                        sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
                      >
                        Subject
                      </Typography>
                      <TextField
                        name="subject"
                        size="small"
                        placeholder="Enter Subject"
                        fullWidth
                      // value={formData.uploaded_evidence_file}
                      // onChange={handleChange}
                      />
                      <Typography
                        sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
                      >
                        Message
                      </Typography>
                      <TextField
                        name="message"
                        size="small"
                        placeholder="Type here..."
                        fullWidth
                        multiline
                        rows={10}
                      // value={formData.cdp_plan}
                      // onChange={handleChange}
                      />
                    </div>
                  </Box>
                  <Box
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "2rem",
                    }}
                  >
                    <SecondaryButtonOutlined
                      name="Cancel"
                      style={{ width: "10rem", marginRight: "2rem" }}
                      onClick={handleClose}
                    />
                    <SecondaryButton name="Send" style={{ width: "10rem" }} />
                  </Box>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {activeTab === "changePassword" && (
          <div>
            <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
              <TextField
                size="small"
                value={passwordData?.currentPassword}
                onChange={handleChange}
                label="Current password"
                className="w-full"
                name="currentPassword"
                placeholder="Enter current password"
                type={showCurrentPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowCurrentPassword}
                        onMouseDown={handleMouseDownPassword}
                        sx={{ color: 'black' }}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                size="small"
                value={passwordData?.newPassword}
                onChange={handleChange}
                label="New password"
                className="w-full"
                name="newPassword"
                placeholder="Enter new password"
                type={showNewPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowNewPassword}
                        onMouseDown={handleMouseDownPassword}
                        sx={{ color: 'black' }}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                size="small"
                value={passwordData?.confirmPassword}
                onChange={handleChange}
                label="Confirm password"
                className="w-full"
                name="confirmPassword"
                placeholder="Enter confirm password"
                type={showConfirmPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        sx={{ color: 'black' }}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: "1rem",
                marginRight: "1rem",
              }}
            >
              <SecondaryButtonOutlined
                name="Cancel"
                style={{ width: "10rem", marginRight: "2rem" }}
              />
              <SecondaryButton name="Change Password" onClick={handleChangePassword} style={{ width: "15rem" }} />
            </Box>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
