import React from 'react';
import {Box, Typography} from '@mui/material';
import './StockInfoDisplay.css';

function StockInfoDisplay(
    props: {
      selectedStock: any;
      quote: any
    }
) {
  const SYMBOL = '01. symbol';
  const PRICE = '05. price';
  const CHANGE = '09. change';
  const CHANGE_PERCENT = '10. change percent';

  const {selectedStock, quote} = props;

  const color = (quote && quote[CHANGE] && Number(quote[CHANGE]) > 0) ? 'forestgreen' : 'firebrick';

  return (
      <Box sx={{display: 'flex', flexDirection: 'column', paddingLeft: '10px'}}>
        <Typography variant="h6" component="div" color="text.primary">
          {selectedStock ? selectedStock['Company'] : ''}
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'flex-end'}}>
          <Typography variant="h6" component="div" color="text.primary">
            {quote ? Number(quote[PRICE])?.toFixed(2) : ''}
          </Typography>
          <Typography className="stock-value" variant="body1" component="div" color={color}>
            {
              quote
                  ? [
                      Number(quote[CHANGE])?.toFixed(2),
                      '(' + Number((quote[CHANGE_PERCENT] as string)?.slice(0, -1))?.toFixed(2) + '%)'
                    ]
                      .join(' ')
                  : ''
            }
          </Typography>
          <Typography className="stock-value" variant="caption" component="div" color="text.primary">
            {quote ? (quote[SYMBOL] as string)?.split('.')[1] : ''}
          </Typography>
        </Box>
      </Box>
  );
}

export default StockInfoDisplay;
