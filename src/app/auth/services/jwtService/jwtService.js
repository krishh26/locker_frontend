/* eslint-disable class-methods-use-this */
/* eslint-disable no-async-promise-executor */
import FuseUtils from '@fuse/utils/FuseUtils';
import { slice } from 'app/store/globalUser';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import jsonData from 'src/url.json';
import { connectToSocket } from 'src/utils/socket';

/* eslint-disable camelcase */

const URL_BASE_LINK = jsonData.API_LOCAL_URL;
class JwtService extends FuseUtils.EventEmitter {
    init() {
        this.setInterceptors();
        this.handleAuthentication();
    }

    setInterceptors = () => {
        axios.interceptors.response.use(
            (response) => {
                return response;
            },
            (err) => {
                return new Promise((resolve, reject) => {
                    if (err.response.status === 401 && err.config && !err.config.__isRetryRequest) {
                        // if you ever get an unauthorized response, logout the user
                        this.emit('onAutoLogout', 'Invalid access_token');
                        this.setSession(null);
                    }
                    throw err;
                });
            }
        );
    };

    handleAuthentication = () => {
        const access_token = this.getAccessToken();

        if (!access_token) {
            this.emit('onNoAccessToken');
            return;
        }

        if (this.isAuthTokenValid(access_token)) {
            this.setSession(access_token);
            this.emit('onAutoLogin', true);
        } else {
            this.setSession(null);
            this.emit('onAutoLogout', 'access_token expired');
        }
    };

    // createUser = (data) => {
    //   return new Promise((resolve, reject) => {
    //     axios.post(jwtServiceConfig.signUp, data).then((response) => {
    //       if (response.data.user) {
    //         this.setSession(response.data.access_token);
    //         resolve(response.data.user);
    //         this.emit('onLogin', response.data.user);
    //       } else {
    //         reject(response.data.error);
    //       }
    //     });
    //   });
    // };

    signInWithEmailAndPassword = (credentials, dispatch) => {
        const payload = { ...credentials };

        return new Promise((resolve, reject) => {
            axios
                .post(`${URL_BASE_LINK}/user/login`, payload)
                .then(async (response) => {
                    if (response?.data?.status) {
                        const data = response?.data?.data;
                        const decoded = jwtDecode(data?.accessToken);
                        if (decoded?.role === 'Learner') {
                            sessionStorage.setItem('learnerToken', JSON.stringify({ ...data, user: { ...data.user, displayName: data.user.first_name + " " + data.user.last_name } }));
                        }
                        connectToSocket(decoded?.user_id, dispatch);
                        dispatch(slice.setCurrentUser(data.user))
                        if (data.password_changed) {
                            this.setSession(data.accessToken);
                            this.emit('onLogin', decoded);
                        } else {
                            sessionStorage.setItem('email', decoded?.email);
                            resolve({ token: data?.accessToken, decoded });
                        }
                    } else {
                        reject(response?.data.error);
                    }
                })
                .catch((err) => reject(err));
        });
    };

    chnageRole = (token) => {
        const decoded = jwtDecode(token);
        this.setSession(token);
        this.emit('onLogin', decoded);
    }

    signInWithToken = (dispatch) => {
        return new Promise(async (resolve, reject) => {
            const decoded = jwtDecode(this.getAccessToken());
            if (decoded.role === 'Learner') {
                sessionStorage.setItem('learnerToken', JSON.stringify({ accessToken: this.getAccessToken(), user: { ...decoded, displayName: decoded?.first_name + " " + decoded?.last_name } }));
            }
            connectToSocket(decoded.user_id, dispatch);
            resolve(decoded);
        });
    };

    setSession = (access_token) => {
        if (access_token) {
            localStorage.setItem('token', access_token);
            axios.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        } else {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common.Authorization;
        }
    };

    logout = () => {
        this.setSession(null);
        sessionStorage.clear();
        localStorage.clear();
        this.emit('onLogout', 'Logged out');
    };

    // eslint-disable-next-line class-methods-use-this
    isAuthTokenValid = (access_token) => {
        if (!access_token) {
            return false;
        }
        const decoded = jwtDecode(access_token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            console.warn('access token expired');
            return false;
        }

        return true;
    };

    getAccessToken = () => {
        return window.localStorage.getItem('token');
    };
}

const instance = new JwtService();

export default instance;