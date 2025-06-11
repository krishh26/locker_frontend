import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'

const Root = styled('div')(({ theme }) => ({
  '& > .logo-icon': {
    transition: theme.transitions.create(['width', 'height'], {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
  '& > .badge': {
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
}))

function Logo() {
  const navigate = useNavigate()

  return (
    <Root
      className='flex items-center cursor-pointer'
      onClick={() => {
        navigate('/home')
      }}
    >
      <img
        className='mx-auto w-full'
        src='assets/images/logo/white-logo.svg'
        alt='logo'
      />
    </Root>
  )
}

export default Logo
