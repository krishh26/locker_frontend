import { useRef, useState } from 'react';
import { Button, Box, Avatar } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectGlobalUser } from 'app/store/globalUser';
import { useDispatch } from 'react-redux';
import { uploadLearnerAvatar } from 'app/store/userManagement';
import { getRandomColor } from 'src/utils/randomColor';

const UploadPhoto = () => {

    const dispatch: any = useDispatch();
    const globalUser = useSelector(selectGlobalUser);
    const fileInputRef = useRef(null);

    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(URL.createObjectURL(file));
            dispatch(uploadLearnerAvatar(file));
        }
    };


    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };


    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
        >
            <Avatar
                alt="Awaiting Photo"
                src={selectedImage ? selectedImage : globalUser.selectedUser.avatar}
                sx={{
                    width: 150,
                    height: 200,
                    border: '1px solid #ccc',
                    borderRadius: 0,
                    backgroundColor: getRandomColor(globalUser?.selectedUser?.user_name?.toLowerCase().charAt(0)),
                    cursor: 'pointer'
                }}
                onClick={handleAvatarClick}  // Trigger file input on click
            />
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}          // Attach ref to the input
                hidden
                onChange={handleImageChange} // Handle file change
            />
        </Box>
    );
};

export default UploadPhoto;
