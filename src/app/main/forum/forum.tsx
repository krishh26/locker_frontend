import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ClearIcon from '@mui/icons-material/Clear';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import SendIcon from '@mui/icons-material/Send';
import { Avatar, Box, Grid, IconButton, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import { getChatListAPI, getMessageAPI, selectForumData, sendMessageAPI, slice } from "app/store/forum";
import EmojiPicker from 'emoji-picker-react';
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LoadingButton, SecondaryButton } from "src/app/component/Buttons";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import { useCurrentUser } from "src/app/utils/userHelpers";
import { UserRole } from "src/enum";
import { getRandomColor } from "src/utils/randomColor";

const timeAgo = (timestamp) => {
  if (!timestamp) return '';

  const now: any = new Date();
  const past: any = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(diffInSeconds / 3600);
  const days = Math.floor(diffInSeconds / 86400);
  const weeks = Math.floor(diffInSeconds / 604800);

  if (diffInSeconds < 60) {
    return `Just now`;
  } else if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (days < 7) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }
};


const Forum = () => {

  const chatEndRef = useRef(null);
  const forumData = useSelector(selectForumData);
  const user = useCurrentUser();

  const dispatch: any = useDispatch();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const [sendMessage, setSendMessage] = useState({
    course_id: forumData?.message?.course_course_id,
    message: "",
    file: null
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [file, setFile] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleSendMessage = (event, row) => {
    setSelectedCourse(row);

    dispatch(slice.setMessage(row));
    setSendMessage(pre => ({
      ...pre,
      course_id: row.course_course_id
    }))
    dispatch(getMessageAPI({ page: 1, page_size: 25 }, row?.course_course_id));
  };

  const handleEmojiClick = (event) => {
    setSendMessage(prevState => ({
      ...prevState,
      course_id: forumData?.message?.course_course_id,
      message: prevState.message + event.emoji,
    }));
  };

  const handleSendChatMessage = async () => {
    try {
      if (sendMessage.message.trim() === "" && sendMessage.file === "") {
        return
      }
      const formData = new FormData();
      formData.append('course_id', sendMessage.course_id);
      formData.append('sender_id', user.user_id);
      formData.append('message', sendMessage.message);
      formData.append('file', sendMessage.file);

      await dispatch(sendMessageAPI(formData));
    } catch (err) {
      console.log(err);
    } finally {
      handleCloseEmoji();
    }
    setSendMessage({
      course_id: forumData?.message?.course_course_id,
      message: "",
      file: null
    });
    setFile(null);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendChatMessage();
    }
  };

  const handleCloseEmoji = () => {
    setShowEmojiPicker(false);
  };

  const handleFileUploadClick = () => {
    document.getElementById('fileUpload').click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      setSendMessage(pre => ({ ...pre, file }));
    }
  };

  const handleFileRemove = () => {
    setFile(null);
  };

  const handleCloseChat = () => {
    setSelectedCourse(null);
  };

  useEffect(() => {
    scrollToBottom();
  }, [forumData]);

  useEffect(() => {
    dispatch(getChatListAPI(user.role !== UserRole.Admin && user.user_id));
  }, [dispatch]);

  const filteredCourseData = forumData.courseData.filter(row =>
    row.course_course_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const screenSize = window.innerWidth;

  return (
    <div className="flex w-full gap-12 overflow-hidden sm:h-[91vh] sm:p-12 ">
      {(screenSize > 600 || !selectedCourse) && <div className={`${screenSize > 600 ? 'w-[30%]' : "w-full"} p-4  rounded-0 shadow-2 overflow-hidden overflow-y-scroll`}>
        {/* <div className={`w-full md:w-1/3 p-1 rounded-lg shadow-lg overflow-hidden ${selectedCourse ? 'hidden max-[600px]:block' : ''}`}> */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between p-2 sticky top-0 z-10">
            <input
              type="text"
              placeholder="Search contacts..."
              className="px-10 py-6 border border-gray-300 rounded-md w-full m-6"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="border-t border-gray-300 mt-auto"></div>
          {filteredCourseData.map((msg) => (
            <div
              key={msg.course_course_id}
              className="flex items-center cursor-pointer rounded-md p-2 m-10 gap-10"
              onClick={(e) => handleSendMessage(e, msg)}
            >
              <Avatar
                className="mr-4"
                alt={msg.course_course_name?.toUpperCase().charAt(0)}
                src="../"
                sx={{ bgcolor: getRandomColor(msg.course_course_name?.toLowerCase().charAt(0)) }}
              />
              <div className="flex flex-col w-10/12">
                <div className="flex justify-between flex-row ml-0 m-5">
                  <Tooltip title={msg.course_course_name}>
                    <div className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{msg.course_course_name}</div>
                  </Tooltip>
                  <div className="text-xs flex justify-end text-gray-500 w-[42%] sm:w-[70%]">{timeAgo(msg.latest_forum_created_at)}</div>
                </div>
                <Tooltip title={msg.course_course_code}>
                  <div className="text-sm text-justify overflow-hidden text-ellipsis whitespace-nowrap">{msg.course_course_code}</div>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>

      </div>}

      {(screenSize > 600 || !!selectedCourse) && ((forumData.message?.course_course_id !== null) ?
        <div className="w-full p-4 rounded-0 shadow-2 relative">
          <IconButton
            onClick={handleCloseChat}
            className="absolute top-14 right-2 text-gray-500"
            style={{ display: screenSize < 600 ? 'block' : 'none' }}
          >
            <ArrowBackIosIcon />
          </IconButton>
          {forumData && (
            <div className="flex items-start rounded-md p-2 border-b border-gray-200 m-10 gap-10">
              <Avatar className="mr-4" alt={forumData?.message?.course_course_name?.toUpperCase().charAt(0)} src="../" sx={{ bgcolor: getRandomColor(forumData?.message?.course_course_name?.toLowerCase().charAt(0)) }} />
              <div className="flex  flex-col pr-10 ">
                <div className="flex justify-between flex-row ml-0 m-5">
                  <div className="font-semibold  text-lg">{forumData?.message?.course_course_name}</div>
                </div>
                <div className="text-justify text-sm pr-10 ">{forumData?.message?.course_course_code}</div>
              </div>
            </div>
          )}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: "78vh",
            justifyContent: "space-between",
            '@media screen and (max-width:426px)': {
              height: "75vh",
            },
          }}>

            <Box className="flex overflow-y-scroll flex-col max-w-full gap-10 h-[85%]">
              {forumData.data?.map((message) => (
                <>
                  {user?.user_id === message.sender.user_id ?
                    <Grid className="w-[80%] flex ml-auto text-justify justify-end pr-10 ">
                      <Typography sx={{ overflowWrap: "anywhere" }} className=" bg-[#959CA9] p-10 rounded-md text-base">
                        {message?.message && message?.file ?
                          <>
                            <Link to={message?.file?.url} target="_blank" rel="noopener" style={{ border: '0px', backgroundColor: 'unset' }}>
                              <FileCopyIcon style={{ fontSize: '2rem', color: "black" }} />
                            </Link>
                            {message?.message}
                          </>
                          :
                          message?.message || (message?.file &&
                            <Link to={message?.file?.url} target="_blank" rel="noopener" style={{ border: '0px', backgroundColor: 'unset' }}>
                              <FileCopyIcon style={{ fontSize: '2rem', color: "black" }} />
                            </Link>
                          )}
                        <div className="flex justify-end text-xs opacity-50">{timeAgo(message.created_at)}</div>
                      </Typography>
                    </Grid>
                    :
                    <Grid >
                      {sendMessage && (
                        <div className="flex items-start justify-start bg-[#959ca960] rounded-md m-10 gap-10 w-[80%] p-10">
                          {<Avatar className="mr-4" alt="Cindy Baker" src={message.sender?.avatar?.url} />}
                          <div style={{ overflowWrap: "anywhere" }} className="flex flex-col w-full">
                            <div className="flex justify-between flex-row ml-0 m-5 pr-10 ">
                              <div className="font-semibold  text-base">{message.sender?.user_name}</div>
                              <div className="text-xs opacity-50">{timeAgo(message.created_at)}</div>
                            </div>
                            <div className="text-justify text-base pr-10 ">
                              {message?.message && message?.file ?
                                <>
                                  <Link to={message?.file?.url} target="_blank" rel="noopener" style={{ border: '0px', backgroundColor: 'unset' }}>
                                    <FileCopyIcon style={{ fontSize: '2rem', color: "black" }} />
                                  </Link>
                                  {message?.message}
                                </>
                                :
                                message?.message || (message?.file &&
                                  <Link to={message?.file?.url} target="_blank" rel="noopener" style={{ border: '0px', backgroundColor: 'unset' }}>
                                    <FileCopyIcon style={{ fontSize: '2rem', color: "black" }} />
                                  </Link>
                                )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Grid>}
                  <div ref={chatEndRef} />
                </>
              ))}
            </Box>
            <Box mb='20px'>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Start your chat..."
                  value={sendMessage.message}
                  onChange={(e) => setSendMessage({
                    ...sendMessage,
                    message: e.target.value
                  })}
                  onKeyDown={handleKeyDown}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                          <EmojiEmotionsIcon style={{ fill: "#5B718F" }} />
                        </IconButton>
                        {file && (
                          <div>
                            <FileCopyIcon style={{ fontSize: '2rem', color: "black" }} />
                            <IconButton onClick={handleFileRemove}>
                              <ClearIcon style={{ fontSize: '1rem', color: "red" }} />
                            </IconButton>
                          </div>
                        )}
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleFileUploadClick}>
                          <AttachFileIcon style={{ fill: "#5B718F" }} />
                        </IconButton>
                        <input
                          type="file"
                          id="fileUpload"
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                        {/* <label htmlFor="file-upload">
                          <IconButton component="span">
                            <FileCopyIcon style={{ fontSize: '2rem', color: "black" }} />
                          </IconButton>
                        </label> */}
                      </InputAdornment>
                    )
                  }}
                />
                {!forumData.dataUpdatingLoadding ?
                  <SecondaryButton
                    disable={!sendMessage.message.trim() && !sendMessage.file}
                    sx={{ ml: 2 }}
                    className="ml-10 flex justify-end"
                    onClick={handleSendChatMessage}
                    startIcon={<SendIcon style={{ fontSize: "30px", margin: "auto", padding: "5px" }} />}
                  /> :
                  <LoadingButton className="py-9 ml-10" />}
              </Box>
              {showEmojiPicker && (
                <Box sx={{ position: 'absolute', bottom: '10%', left: '30%' }}>
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </Box>
              )}
            </Box>
          </Box>
        </div>
        : (
          <div
            className="flex flex-col justify-center items-center gap-10 w-full "
            style={{ height: "94%" }}
          >
            <DataNotFound width="25%" />
            <Typography variant="h5">No data found</Typography>
            <Typography variant="body2" className="text-center">
              It is a long established fact that a reader will be <br />
              distracted by the readable content.
            </Typography>
          </div>
        ))
      }

    </div>
  );
};

export default Forum;
