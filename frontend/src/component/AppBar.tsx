
import { DarkModeRounded } from '@mui/icons-material'
import { Switch, Toolbar, Typography } from '@mui/material'
import MuiAppBar, {
    type AppBarProps as MuiAppBarProps,
} from '@mui/material/AppBar'
import { styled, useColorScheme } from '@mui/material/styles'

interface AppBarProps extends MuiAppBarProps {
    open?: boolean
}

export const drawerWidth: number = 270

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}))

export const DashboardAppBar = () => {
    const { mode, setMode } = useColorScheme()
    if (!mode) return null

    return (
        <AppBar position="absolute" open={false}>
            <Toolbar
                variant='dense'
                sx={{
                    pr: '24px', // keep right padding when drawer closed
                }}
            >

                <Typography
                    component="h1"
                    variant="h6"
                    color="inherit"
                    noWrap
                    sx={{ flexGrow: 1 }}
                >
                    Dashboard
                </Typography>
                <Switch
                    value={mode === 'dark'}
                    onChange={() =>
                        setMode(mode !== 'dark' ? 'dark' : 'light')
                    } />
                <DarkModeRounded />
            </Toolbar>
        </AppBar>
    )
}
