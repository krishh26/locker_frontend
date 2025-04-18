import { styled } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";

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
}));

function Logo() {

  const navigate = useNavigate();

  return (
    <Root className="flex items-center" onClick={()=>{
      navigate("/home")
    }} style={{cursor: "pointer"}}>
      <img className="mx-auto w-96" style={{width:"50%"}}src="assets/images/logo/logo-text.svg" alt="logo" />
    </Root>
  );
}

export default Logo;
