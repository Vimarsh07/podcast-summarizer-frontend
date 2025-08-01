import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#00897b' },
    secondary: { main: '#ffb300' }
  },
  typography: {
    h5: { fontWeight: 600 }
  }
});

export default theme;