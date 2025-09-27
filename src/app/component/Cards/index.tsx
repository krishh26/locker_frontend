import { Dialog, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Style from "./style.module.css";
import { useThemeMediaQuery } from "@fuse/hooks";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import clsx from "clsx";
import { useState } from "react";
import UserDetails from "src/app/main/admin/userManagement/usetDetails";
import UploadWorkDialog from "./uploadWorkDialog";
import UploadedEvidenceFile from "./uploadedEvidenceFile";
import Uploading from "src/app/component/Cards/uploading";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { slice as globalSlice } from "app/store/globalUser"
import { useSelector } from "react-redux";
import { selectstoreDataSlice } from "app/store/reloadData";
import { selectUser } from "app/store/userSlice";
import { useThemeColors, themeHelpers } from "../../utils/themeUtils";
import { styled } from "@mui/material/styles";

// Theme-aware styled components
interface ThemedCardProps {
  $background?: string;
  $hoverColor?: string;
}

const ThemedCard = styled('div')<ThemedCardProps>(({ theme, $background, $hoverColor }) => ({
  width: '20rem',
  height: '10rem',
  padding: '1rem',
  margin: '1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-evenly',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: $background || theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
  
  '&:hover': {
    boxShadow: themeHelpers.getShadow(theme, 3),
    transform: 'scale(1.05)',
    backgroundColor: $hoverColor || theme.palette.background.default,
    // Use smart text color selection for proper contrast
    color: themeHelpers.getHoverTextColor(theme, 'primary'),
  },
  
  '&:active': {
    backgroundColor: theme.palette.primary.dark || theme.palette.primary.light,
    transform: 'scale(0.98)',
    color: themeHelpers.getHoverTextColor(theme, 'primary'),
  },
  
  '@media (max-width: 426px)': {
    margin: '1rem 0.5rem',
  },
  
  '@media (max-width: 376px)': {
    width: '80vw',
    margin: '1rem 0.5rem',
  },
}));

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
    boxShadow: themeHelpers.getShadow(theme, 4),
  },
  
  '@media (max-width: 768px)': {
    width: '45%',
  },
  
  '@media (max-width: 480px)': {
    width: '100%',
  },
}));

interface ThemedIconProps {
  $background?: string;
  $textColor?: string;
}

const ThemedIcon = styled('div')<ThemedIconProps>(({ theme, $background, $textColor }) => ({
  borderRadius: '50%',
  padding: '12px',
  backgroundColor: $background || theme.palette.primary.main,
  color: $textColor || theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
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

const CountBadge = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '8px',
  right: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  color: theme.palette.text.primary,
  borderRadius: '12px',
  padding: '2px 8px',
  fontSize: '11px',
  fontWeight: 600,
  minWidth: '20px',
  textAlign: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const CountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  marginTop: '4px',
}));

const CountRow = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '10px',
  color: 'rgba(255, 255, 255, 0.9)',
}));

const CountValue = styled('span')(({ theme }) => ({
  fontWeight: 700,
  color: 'white',
}));

export const Card = (props) => {
  const {
    isIcon,
    name,
    title,
    color,
    background,
    textColor,
    radiusColor,
  } = props;
  
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("sm"));
  const colors = useThemeColors();
  const theme = useTheme();
  
  // Use theme colors with fallbacks
  const cardBackground = background || colors.background.paper;
  const cardTextColor = textColor || colors.text.primary;
  const iconBackground = radiusColor || colors.primary.main;
  const iconTextColor = textColor || colors.primary.contrastText;
  
  // Use the theme helper for smart hover color selection
  const hoverColor = themeHelpers.getHoverColor(theme, 'primary');

  return (
    <ThemedCard 
      $background={cardBackground}
      $hoverColor={hoverColor}
    >
      {isIcon ? (
        <ThemedIcon
          $background={iconBackground}
          $textColor={iconTextColor}
        >
          {name}
        </ThemedIcon>
      ) : (
        <Typography
          color={color ? `text.${color}` : 'text.primary'}
          variant="h6"
          className="rounded-full px-12 py-8"
          style={{
            backgroundColor: iconBackground,
            color: iconTextColor,
          }}
        >
          {name}
        </Typography>
      )}
      <Tooltip title={title} arrow>
        <Typography color="text.primary">
          {title?.length > 20 && !isMobile ? `${title.slice(0, 17)}...` : title}
        </Typography>
      </Tooltip>
    </ThemedCard>
  );
};

export const PortfolioCard = ({ data, learner = undefined, handleClickData = (id, user_id) => { }, index, countData = {} }) => {
  const [open, setOpen] = useState(false);
  const dispatch: any = useDispatch();
  const navigate = useNavigate();
  const { role } = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;
  const colors = useThemeColors();

  const { id = 0, name = "No title", color = colors.primary.main } = data;
  
  // Function to get count information for each card type
  const getCountInfo = (cardId, countData) => {
    switch (cardId) {
      case 1: // Evidence Library
        return {
          total: countData.evidenceTotal || 0,
          label: 'Evidence'
        };
      case 2: // Unit Progress
        return {
          total: countData.unitsTotal || 0,
          completed: countData.unitsCompleted || 0,
          progress: countData.progressPercentage || 0,
          label: 'Units'
        };
      case 3: // Gap Analysis
        return {
          total: countData.gapsTotal || 0,
          resolved: countData.gapsResolved || 0,
          label: 'Gaps'
        };
      case 6: // Choose Units
        return {
          total: countData.availableUnits || 0,
          selected: countData.selectedUnits || 0,
          label: 'Units'
        };
      case 7: // Learning Plan
        return {
          total: countData.sessionsTotal || 0,
          label: 'Sessions'
        };
      case 8: // Resources
        return {
          total: countData.resourcesTotal || 0,
          label: 'Resources'
        };
      default:
        return null;
    }
  };

  const countInfo = getCountInfo(id, countData);
  
  const handleClick = (row = "") => {
    if (learner) {
      handleClickData(learner?.learner_id, learner?.user_id);
      dispatch(globalSlice.setSelectedUser(learner))
    }

    if (id === 1) {
      navigate('/evidenceLibrary')
    } else if (id === 2) {
      navigate('/portfolio/progress');
    } else if (id === 3) {
      navigate('/cpd')
    } else if (id === 5) {
      navigate('/learner-wellbeing');
    } else if (id === 4) {
      navigate('/resources-card');
    } else if (id === 6) {
      navigate('/skillsScan');
    } else if (id === 7) {
      navigate(`/session-list/${learner?.learner_id}`);
    }
    else if (id === 9) {
      navigate('/timeLog');
    }else if (id === 10) {
      navigate('/learner-wellbeing');
    }
    else if (id === 8) {
      navigate('/portfolio/resourceData');
    }
  };
  
  const handleClose = () => {
    setOpen(false);
  };

  return (
    role !== "Learner" ?
      !["Upload Work"].includes(name) ?
        <>
          <ThemedPortfolioCard
            $background={color}
            onClick={() => {
              handleClick();
            }}
            className="w-full"
            style={{ position: 'relative' }}
          >
            {countInfo && (
              <CountBadge>
                {countInfo.progress ? `${Math.round(countInfo.progress)}%` : countInfo.total}
              </CountBadge>
            )}
            <div>
              <ThemedIndex>{name?.charAt(0)}</ThemedIndex>
              <div className={Style.emptyRing}></div>
              <div className={Style.filledRing}></div>
            </div>
            <ThemedTitle>{name}</ThemedTitle>
          </ThemedPortfolioCard>
          <Dialog
            open={open}
            onClose={handleClose}
            sx={{
              ".MuiDialog-paper": {
                borderRadius: "4px",
                padding: "1rem",
                backgroundColor: colors.background.paper,
                color: colors.text.primary,
              },
            }}
          >
            <UploadWorkDialog dialogFn={{ handleClose }} />
          </Dialog>
        </> :
        null
      :
      !["Skill Scan"].includes(name) ?
        <>
          <ThemedPortfolioCard
            $background={color}
            onClick={() => {
              handleClick();
            }}
            className="w-full"
            style={{ position: 'relative' }}
          >
            {countInfo && (
              <CountBadge>
                {countInfo.progress ? `${Math.round(countInfo.progress)}%` : countInfo.total}
              </CountBadge>
            )}
            <div>
              <ThemedIndex>{index + 1}</ThemedIndex>
              <div className={Style.emptyRing}></div>
              <div className={Style.filledRing}></div>
            </div>
            <ThemedTitle>{name}</ThemedTitle>
          </ThemedPortfolioCard>
          <Dialog
            open={open}
            onClose={handleClose}
            sx={{
              ".MuiDialog-paper": {
                borderRadius: "4px",
                padding: "1rem",
                backgroundColor: colors.background.paper,
                color: colors.text.primary,
              },
            }}
          >
            <UploadWorkDialog dialogFn={{ handleClose }} />
          </Dialog>
        </> :
        null
  );
};
