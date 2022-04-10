import {Variant} from '@mui/material/styles/createTypography';
import React from 'react';
import {Box, Typography} from '@mui/material';
import {Quote, Stock} from '../interfaces';
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

function StockInfoDisplay(
    props: {
      selectedStock: Stock | undefined,
      quote: Quote | undefined
    }
) {
  const displayText = (size: Variant, text: string) =>
      <Typography variant={size} component="div" color="text.primary">{text}</Typography>;

  const displayPriceAndDate = (stock: Stock, q: Quote) => {
    const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'} as DateTimeFormatOptions;
    const formattedDate = new Intl.DateTimeFormat('en-IN', options).format(new Date(q.date));

    return (
        <Box sx={{display: 'flex', alignItems: 'baseline', columnGap: '10px'}}>
          {displayText('h6', stock.Currency + ' ' + Number(q.close).toFixed(2))}
          {displayText('caption', 'as on ' + formattedDate)}
        </Box>
    );
  };

  return (
      <Box sx={{display: 'flex', flexDirection: 'column', rowGap: '10px'}}>
        {displayText('h5', props.selectedStock !== undefined ? props.selectedStock.Company : '?')}
        {
          props.selectedStock !== undefined && props.quote !== undefined
              ? displayPriceAndDate(props.selectedStock, props.quote)
              : displayText('caption', 'Select a stock...')
        }
      </Box>
  );
}

export default StockInfoDisplay;
