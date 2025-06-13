import FuseLoading from '@fuse/core/FuseLoading'
import {
  Avatar,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  getLearnerDetails,
  selectLearnerManagement,
} from 'app/store/learnerManagement'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import {
  SecondaryButton,
  SecondaryButtonOutlined,
} from 'src/app/component/Buttons'
import { PortfolioCard } from 'src/app/component/Cards'
import DoughnutChart from 'src/app/component/Chart/doughnut'
import { portfolioCard } from 'src/app/contanst'
import Calendar from './calendar'
import { Link, useNavigate } from 'react-router-dom'
import { selectstoreDataSlice } from 'app/store/reloadData'
import { selectUser } from 'app/store/userSlice'
import { slice } from 'app/store/courseManagement'
import { getRandomColor } from 'src/utils/randomColor'
import { slice as courseSlice } from 'app/store/courseManagement'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import { sendMail } from 'app/store/userManagement'
import { slice as globalSlice, selectGlobalUser } from 'app/store/globalUser'

const Portfolio = () => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const { learner, dataUpdatingLoadding ,dataFetchLoading } = useSelector(selectLearnerManagement)

  const data = useSelector(selectstoreDataSlice)
  const user =
    JSON.parse(sessionStorage.getItem('learnerToken'))?.user ||
    useSelector(selectUser)?.data

  const { singleData } = useSelector(selectLearnerManagement)
  const { learnerTab } = useSelector(selectGlobalUser)

  const dispatch: any = useDispatch()

  const handleClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    if (data?.learner_id) dispatch(getLearnerDetails(data?.learner_id))
  }, [data])

  useEffect(() => {
    if (singleData?.learner_id)
      dispatch(getLearnerDetails(singleData?.learner_id))
    else if (user?.learner_id) dispatch(getLearnerDetails(user?.learner_id))
  }, [singleData?.learner_id, user.data])

  const handleOpen = () => {
    setOpen(true)
  }

  const handleOpenProfile = () => {
    const learnerId = learner?.learner_id
    navigate(`/portfolio/learner-details?learner_id=${learnerId}`)
  }

  const handleClickData = (event, row) => {
    dispatch(slice.setSingleData(row))
  }

  const handleClickSingleData = (row) => {
    dispatch(courseSlice.setSingleData(row))
  }

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOpenEmail = () => {
    setIsDialogOpen(true)
  }

  const handleCloseEmail = () => {
    setIsDialogOpen(false)
    setEmailData({
      email: learner.email,
      subject: '',
      message: '',
      adminName: user?.displayName,
    })
  }

  const [emailData, setEmailData] = useState({
    email: learner.email,
    subject: '',
    message: '',
    adminName: user?.displayName,
  })

  useEffect(() => {
    if (learner.email) {
      setEmailData((prevEmail) => ({ ...prevEmail, email: learner.email }))
    }
  }, [learner.email])

  const handleChange = (e) => {
    const { name, value } = e.target
    setEmailData((prevEmail) => ({ ...prevEmail, [name]: value }))
  }

  const handleSend = async () => {
    try {
      let response
      response = await dispatch(sendMail(emailData))
    } catch (err) {
      console.log(err)
    } finally {
      handleCloseEmail()
    }
  }
  return (
    <div>
      <div className='m-10 flex flex-wrap justify-evenly gap-10 cursor-pointer'>
        {portfolioCard?.map((value, index) => (
          <PortfolioCard data={value} index={index} key={value.id} />
        ))}
      </div>
      {dataUpdatingLoadding || dataFetchLoading || !learner ? (
        <FuseLoading />
      ) : (
        <div className='rounded shadow-md m-24'>
          {/* Header */}
          <div className='grid grid-cols-12 px-10 py-12 border-b font-semibold text-sm text-gray-700 bg-[#F8F8F8]'>
            <div className='col-span-2'>Name</div>
            <div className='col-span-5'>Information</div>
            <div className='col-span-5'>Next Visit Date</div>
          </div>

          {/* Content */}
          <div className='grid grid-cols-12 items-center justify-center px-10 py-16'>
            {/* Name with image */}
            <div className='col-span-2 flex items-start gap-4'>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  backgroundColor: getRandomColor(
                    learner?.first_name?.toLowerCase().charAt(0)
                  ),
                }}
                src={data?.learner_id ? learner?.avatar : user?.avatar?.url}
                alt={
                  data?.learner_id
                    ? learner?.first_name?.toUpperCase()?.charAt(0)
                    : user?.displayName
                }
              />
            </div>

            {/* Information */}
            <div className='col-span-5 text-sm space-y-1'>
              <div className='text-sm space-y-2'>
                <div className='flex gap-2'>
                  <span className='min-w-[140px] font-medium text-[14px]'>
                    Learner Name
                  </span>
                  <span className='font-medium text-[14px]'>:-</span>
                  <span className='text-[14px] ml-4'>
                    {' '}
                    {learner?.first_name} {learner?.last_name}
                  </span>
                </div>
                <div className='flex gap-2'>
                  <span className='min-w-[140px] font-medium text-[14px]'>
                    Trainer Name
                  </span>
                  <span className='font-medium text-[14px]'>:-</span>
                  <span className='text-[14px] ml-4'>
                    {learner?.course[0]?.trainer_id?.first_name}{' '}
                    {learner?.course[0]?.trainer_id?.last_name}
                  </span>
                </div>
                <div className='flex gap-2'>
                  <span className='min-w-[140px] font-medium text-[14px]'>
                    IQA Name
                  </span>
                  <span className='font-medium text-[14px]'>:-</span>
                  <span className='text-[14px] ml-4'>
                    {learner?.course && learner?.course?.length> 0 && learner?.course[0]?.IQA_id?.first_name}{' '}
                    {learner?.course && learner?.course?.length> 0 && learner?.course[0]?.IQA_id?.last_name}
                  </span>
                </div>
                <div className='flex gap-2'>
                  <span className='min-w-[140px] font-medium text-[14px]'>
                    Email Your Trainer
                  </span>
                  <span className='font-medium text-[14px]'>:-</span>
                  <span className='text-[14px] ml-4'>
                    {learner?.course && learner?.course?.length> 0 && learner?.course[0]?.trainer_id?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Visit Date & Graphs */}
            <div className='col-span-5 flex items-center gap-20'>
              <div className='text-sm font-medium whitespace-nowrap'>
                02-03-2023
              </div>
              <div className='flex gap-5 flex-wrap'>
                {learner?.course?.map((value) => (
                  <div className=' w-fit'>
                    <Tooltip title={value?.course?.course_name}>
                      <Link
                        to='/portfolio/learnertodata'
                        style={{
                          color: 'inherit',
                          textDecoration: 'none',
                        }}
                        onClick={(e) => {
                          handleClickSingleData(value)
                          handleClickData(e, value)
                        }}
                      >
                        <DoughnutChart value={value} />
                      </Link>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='flex justify-end mr-24'>
        {user?.role !== 'Learner' && (
          <SecondaryButton
            className='mr-12'
            onClick={handleOpenEmail}
            startIcon={<EmailOutlinedIcon className='ml-10 text-xl' />}
          />
        )}
        <SecondaryButtonOutlined name='Awaiting Signature' className='mr-12' />
        <SecondaryButton
          name='Calendar'
          className='mr-12'
          onClick={handleOpen}
        />
        <SecondaryButton
          name='Profile'
          className='mr-12'
          onClick={handleOpenProfile}
        />
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        sx={{
          '.MuiDialog-paper': {
            borderRadius: '4px',
            padding: '1rem',
            width: '90%',
            maxWidth: 'lg',
          },
        }}
      >
        <Calendar />
      </Dialog>

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseEmail}
        sx={{
          '.MuiDialog-paper': {
            borderRadius: '4px',
            width: '100%',
          },
        }}
      >
        <DialogTitle>Email {learner.user_name}</DialogTitle>

        <DialogContent>
          <Box className='flex flex-col justify-between gap-12 p-0'>
            <div>
              <Typography sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}>
                Subject
              </Typography>
              <TextField
                name='subject'
                size='small'
                placeholder='Subject'
                fullWidth
                value={emailData?.subject}
                onChange={handleChange}
              />
            </div>
            <div>
              <Typography sx={{ fontSize: '0.9vw', marginBottom: '0.5rem' }}>
                Message
              </Typography>
              <TextField
                name='message'
                size='small'
                placeholder='Message'
                fullWidth
                multiline
                rows={6}
                value={emailData?.message}
                onChange={handleChange}
              />
            </div>
          </Box>
        </DialogContent>

        <DialogActions>
          <SecondaryButton
            name='Send'
            disable={!emailData?.subject || !emailData?.message}
            onClick={handleSend}
          />
          <SecondaryButtonOutlined name='Close' onClick={handleCloseEmail} />
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Portfolio
