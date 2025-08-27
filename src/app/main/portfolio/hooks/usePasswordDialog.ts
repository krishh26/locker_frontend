import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { passwordReg } from 'src/app/contanst/regValidation'
import {
  resetPasswordMail,
  updatePasswordHandler,
} from 'app/store/userManagement'
import { selectGlobalUser } from 'app/store/globalUser'

export const usePasswordDialog = () => {
  const [dialogType, setDialogType] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState({
    password: '',
    confirmPassword: '',
  })
  const dispatch: any = useDispatch()
  const globalUser = useSelector(selectGlobalUser)

  const handleClickOpen = () => {
    setDialogType(true)
  }

  const handleCloseDialog = () => {
    setDialogType(false)
    setNewPassword({
      password: '',
      confirmPassword: '',
    })
  }

  const passwordHandler = (e) => {
    setNewPassword((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const resetHandler = async () => {
    if (newPassword.password === newPassword.confirmPassword) {
      setLoading(true)
      await dispatch(
        updatePasswordHandler({
          email: globalUser.selectedUser.email,
          password: newPassword.password,
        })
      )
      setLoading(false)
    }
    handleCloseDialog()
  }

  const handleEmailAlert = async () => {
    const confirmed = confirm(
      `Are you sure you wish to reset the password?\nAn email will be sent to ${globalUser.selectedUser.email} with reset instructions.`
    )

    if (confirmed) {
      try {
        await dispatch(
          resetPasswordMail({ email: globalUser.selectedUser.email })
        )
      } catch (error) {
        console.error('Error sending reset email:', error)
      }
    }
  }

  return {
    dialogType,
    loading,
    newPassword,
    handleClickOpen,
    handleCloseDialog,
    passwordHandler,
    resetHandler,
    handleEmailAlert,
  }
}
