import { showMessage } from 'app/store/fuse/messageSlice';
import { getLearnerDetails } from 'app/store/learnerManagement';
import { fetchNotifications } from 'app/store/notification';
import jsonData from 'src/url.json';
import { SocketDomain } from './randomColor';
import { slice } from 'app/store/forum';
import { slice as InnovationSlice } from 'app/store/yourInnovation';
import { fetchAllLearnerByUserAPI } from 'app/store/courseManagement';
// import slice from ''
const SERVER_URL = jsonData.SOCKER_LINK

let socket;

export const connectToSocket = async (id, dispatch) => {
    socket = await new WebSocket(`${SERVER_URL}?id=${id}`);

    socket.onmessage = (Data) => {
        const { data = "", domain = "" } = JSON.parse(Data?.data);

        console.log(data, domain, Data)
        if (domain === SocketDomain.CourseAllocation) {
            dispatch(showMessage({ message: data.message, variant: "success" }));
            dispatch(fetchNotifications())
            if (data.role && data.id) {
                dispatch(fetchAllLearnerByUserAPI(data.id, data.role));
            } else {
                dispatch(getLearnerDetails())
            }
        } else if (domain === SocketDomain.MessageSend) {
            dispatch(slice.newMassageHandler(data))
        } else if (domain === SocketDomain.InnovationChat) {
            dispatch(InnovationSlice.setSingleDataForSocket(data))
        } else if (domain === SocketDomain.Notification) {
            dispatch(fetchNotifications())
        }
    };

    return socket;
};

export const disconnectFromSocket = () => {
    // if (socket) {
    //     socket.disconnect();
    // }
};
