import { Box, CircularProgress } from '@mui/material'
import {
  useGetFormDetailsQuery,
  useGetSavedFormDetailsQuery,
} from 'app/store/api/form-api'
import { slice } from 'app/store/formData'
import { showMessage } from 'app/store/fuse/messageSlice'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { SimpleFormField } from 'src/app/component/FormBuilder'
import { useCurrentUser } from 'src/app/utils/userHelpers'
import { UserRole } from 'src/enum'
import DynamicFormPreview from './DynamicFormPreview'

const AddViewForm = () => {
  const param = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const formId: string | boolean = param?.id ?? false
  const userId: string | boolean = param?.userId ?? false
  const isSavedViewedPath =
    location.pathname === `/forms/view-saved-form/${formId}/user/${userId}`

  const [formFields, setFormFields] = useState<SimpleFormField[]>([])
  const [formData, setFormData] = useState<any>({})
  const [isLocked, setIsLocked] = useState(false)
  const dispatch: any = useDispatch()
  const currentUser = useCurrentUser()

  const {
    data: formDetails,
    isLoading: isFormDetailsLoading,
    isError: isFormDetailsError,
    error: formDetailsError,
  } = useGetFormDetailsQuery(
    {
      id: formId,
    },
    {
      skip: !formId || isSavedViewedPath,
      refetchOnMountOrArgChange: false,
    }
  )

  const {
    data: savedFormDetails,
    isLoading: isSavedFormDetailsLoading,
    isError: isSavedFormDetailsError,
    error: savedFormDetailsError,
  } = useGetSavedFormDetailsQuery(
    {
      formId,
      userId: userId ? userId : currentUser?.user_id,
    },
    {
      refetchOnMountOrArgChange: false,
    }
  )

  useEffect(() => {
    if (isFormDetailsError && formDetailsError) {
      console.error('Error fetching form details:', formDetailsError)
      dispatch(
        showMessage({
          message: 'Error fetching form details',
          variant: 'error',
        })
      )
      navigate('/forms')
    }

    if (formDetails && !isFormDetailsLoading) {
      const { form_name, type, form_data, description } = formDetails.data

      setFormData({
        form_name,
        type,
        description,
      })

      setFormFields(form_data)
    }
  }, [formDetails, isFormDetailsLoading, isFormDetailsError, formDetailsError])

  useEffect(() => {
    if (isSavedFormDetailsError && savedFormDetailsError) {
      // console.error('Error fetching saved form details:', savedFormDetailsError)
      // dispatch(
      //   showMessage({
      //     message: 'Error fetching saved form details',
      //     variant: 'error',
      //   })
      // )
      // navigate('/forms')
    }

    if (savedFormDetails && !isSavedFormDetailsLoading) {
      const { form_name, type, form_data, description } =
        savedFormDetails.data.form

      const { is_locked } = savedFormDetails.data

      setFormData({
        form_name,
        type,
        description,
      })

      setFormFields(form_data)

      const isLocked = currentUser.role === UserRole.Learner && is_locked

      setIsLocked(isLocked)
      dispatch(slice.setFormDataDetails(savedFormDetails.data.form_data))
    }
  }, [
    savedFormDetails,
    isSavedFormDetailsLoading,
    isSavedFormDetailsError,
    savedFormDetailsError,
  ])

  if (isFormDetailsLoading || isSavedFormDetailsLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
          fontSize: '24px',
          fontWeight: 'bold',
          gap: '10px',
        }}
      >
        <CircularProgress />
        please wait while we load the form details...
      </div>
    )
  }

  return (
    <Box
      sx={{
        p: 3,
        m: 2,
        height: 'calc(100% - 32px)',
        backgroundColor: '#f5f5f5',
        borderRadius: 3,
        overflow: 'auto',
      }}
    >
      <DynamicFormPreview
        fields={formFields}
        formName={formData.form_name}
        description={formData.description}
        isLocked={isLocked}
      />
    </Box>
  )
}

export default AddViewForm
