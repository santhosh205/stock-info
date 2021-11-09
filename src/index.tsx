import {SnackbarProvider} from 'notistack';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Home from './home/Home';
import {createTheme, ThemeProvider} from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
});

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <SnackbarProvider maxSnack={2}>
        <Home />
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
