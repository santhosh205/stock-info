import {Variant} from '@mui/material/styles/createTypography';
import React from 'react';
import {Box, Typography} from '@mui/material';
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

function StockInfoDisplay(
    props: {
      selectedStock: any,
      quote: any
    }
) {
  const PRICE = '05. price';
  const LATEST_TRADING_DAY = '07. latest trading day';
  const {selectedStock, quote} = props;

  const displayText = (size: Variant, text: string) =>
      <Typography variant={size} component="div" color="text.primary">{text}</Typography>;

  const displayPriceAndDate = () => {

    const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'} as DateTimeFormatOptions;
    const formattedDate = new Intl.DateTimeFormat('en-IN', options).format(new Date(quote[LATEST_TRADING_DAY]));

    return (
        <Box sx={{display: 'flex', alignItems: 'baseline', columnGap: '10px'}}>
          {displayText('h6', selectedStock['Currency'] + ' ' + Number(quote[PRICE]).toFixed(2))}
          {displayText('caption', 'as on ' + formattedDate)}
        </Box>
    );
  };

  return (
      <Box sx={{display: 'flex', flexDirection: 'column', rowGap: '10px'}}>
        {displayText('h5', selectedStock ? selectedStock['Company'] : '')}
        {quote ? displayPriceAndDate(): ''}
      </Box>
  );
}

export default StockInfoDisplay;
