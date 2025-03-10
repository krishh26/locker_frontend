import { Button, CircularProgress } from '@mui/material'

export const SecondaryButton = (props) => {
    const { name, disable = false, onClick = () => { }, startIcon, className = "", style = {} } = props;
    return (
        <Button
            variant="contained"
            color="secondary"
            aria-label="Sign in"
            type="submit"
            size="small"
            disabled={disable}
            sx={{
                borderRadius: "4px",
                '&:hover': {
                    backgroundColor: "#6D81A3"
                }
            }}
            style={style}
            onClick={onClick}
            className={className}
            startIcon={startIcon}
        >
            {name}
        </Button>
    )
}

export const SecondaryButtonOutlined = (props) => {
    const { name, disable = false, onClick = () => { }, className = "", style = {} } = props;
    return (
        <Button
            variant="outlined"
            color="secondary"
            aria-label="Sign in"
            type="submit"
            size="small"
            disabled={disable}
            sx={{
                borderRadius: "4px",
                '&:hover': {
                    color: "black"
                }
            }}
            className={className}
            style={style}
            onClick={onClick}
        >
            {name}
        </Button>
    )
}

export const DangerButton = (props) => {
    const { name, disable = false, onClick = () => { } } = props;
    return (
        <Button
            variant="contained"
            color="secondary"
            aria-label="Sign in"
            type="submit"
            size="small"
            disabled={disable}
            sx={{
                borderRadius: "4px",
                '&:hover': {
                    backgroundColor: "red"
                }
            }}
            onClick={onClick}
        >
            {name}
        </Button>
    )
}

export const LoadingButton = (props) => {
    const { variant = "contained", style, className = "" } = props;
    return (
        <Button
            variant={variant}
            color="secondary"
            aria-label="Sign in"
            type="submit"
            size="small"
            sx={{
                borderRadius: "4px",
                '&:hover': {
                    backgroundColor: "#5B718F"
                }
            }}
            className={className}
            style={style}
        >
            <CircularProgress size={20} sx={{ color: "white" }} />
        </Button>
    )
}

