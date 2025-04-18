/* eslint-disable import/extensions */
import { combineReducers } from '@reduxjs/toolkit';
import fuse from './fuse';
import i18n from './i18nSlice';
import user from './userSlice';
import userManagement from './userManagement';
import learnerManagement from './learnerManagement';
import courseManagement from './courseManagement';
import resourceManagement from './resourcesManagement';
import cpdPlanning from './cpdPlanning';
import supportData from './supportData';
import yourInnovation from './yourInnovation';
import assignment from './assignment';
import session from './session';
import formData from './formData';
import storeData from "./reloadData"
import notification from "./notification"
import forumData from './forum';
import skillsScan from './skillsScan';
import employer from './employer';
import globalUser from './globalUser';
import timeLog from './timeLog';
import broadcast from './broadcast';
import contractWork from './contractedWork';

const createReducer = (asyncReducers) => (state, action) => {
    const combinedReducer = combineReducers({
        fuse,
        i18n,
        user,
        userManagement,
        learnerManagement,
        courseManagement,
        cpdPlanning,
        resourceManagement,
        supportData,
        yourInnovation,
        assignment,
        session,
        formData,
        storeData,
        notification,
        forumData,
        skillsScan,
        employer,
        globalUser,
        timeLog,
        broadcast,
        contractWork,

        ...asyncReducers,
    });


    if (action.type === 'user/userLoggedOut') {
        // state = undefined;
    }

    return combinedReducer(state, action);
};

export default createReducer;