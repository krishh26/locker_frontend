import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  Chip,
  Fade,
  Tooltip,
  Slide
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { slice as globalSlice } from 'app/store/globalUser';
import Style from './style.module.css';

interface LearnerPortfolioCardProps {
  data: {
    id: number;
    name: string;
    color: string;
  };
  learner?: any;
  handleClickData?: (id: string, user_id: string) => void;
  index?: number;
}

// Styled Components - Exact same as PortfolioCard
interface ThemedPortfolioCardProps {
  $background?: string;
}

const ThemedPortfolioCard = styled('div')<ThemedPortfolioCardProps>(({ theme, $background }) => ({
  borderRadius: '8px',
  position: 'relative',
  padding: '12px',
  width: '18%',
  overflow: 'hidden',
  background: $background,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
  },
  
  '@media (max-width: 768px)': {
    width: '45%',
  },
  
  '@media (max-width: 480px)': {
    width: '100%',
  },
}));

const ThemedIndex = styled('div')(({ theme }) => ({
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'white',
  fontWeight: 'bold',
}));

const ThemedTitle = styled('div')(({ theme }) => ({
  fontWeight: 600,
  color: 'white',
  margin: '8px 0px',
  fontSize: '13px',
}));

const LearnerPortfolioCard: React.FC<LearnerPortfolioCardProps> = ({
  data,
  learner,
  handleClickData = () => {},
  index = 0
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch: any = useDispatch();

  const { id, name, color } = data;

  const handleClick = () => {
    if (learner) {
      handleClickData(learner?.learner_id, learner?.user_id);
      dispatch(globalSlice.setSelectedUser(learner));
    }

    // Navigation logic - exact same as PortfolioCard
    if (id === 1) {
      navigate('/evidenceLibrary')
    } else if (id === 2) {
      navigate('/portfolio/progress');
    } else if (id === 3) {
      navigate('/cpd')
    } else if (id === 5) {
      navigate('/timeLog');
    } else if (id === 4) {
      navigate('/resources-card');
    } else if (id === 6) {
      navigate('/skillsScan');
    } else if (id === 7) {
      navigate(`/session-list/${learner?.learner_id}`);
    }
  };

  return (
    <Slide
      key={id}
      direction='up'
      in={true}
      timeout={300 + index * 100}
    >
      <Box>
        <ThemedPortfolioCard
          $background={color}
          onClick={() => {
            handleClick();
          }}
          className="w-full"
        >
          <div>
            <ThemedIndex>{index + 1}</ThemedIndex>
            <div className={Style.emptyRing}></div>
            <div className={Style.filledRing}></div>
          </div>
          <ThemedTitle>{name}</ThemedTitle>
        </ThemedPortfolioCard>
      </Box>
    </Slide>
  );
};

export default LearnerPortfolioCard;
