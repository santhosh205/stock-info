import {
  Box,
  Input,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography
} from '@mui/material';
import algoliasearch from 'algoliasearch';
import {useSnackbar} from 'notistack';
import React, {useEffect, useMemo, useState} from 'react';
import {InstantSearch} from 'react-instantsearch-dom';
import {ConnectedAlgoliaSearchBox} from '../instant-search/InstantSearch';
import AlgoliaLogo from '../logo-algolia-nebula-blue-full.svg';
import SearchResult from '../search-result/SearchResult';
import StockInfoDisplay from '../stock-info-display/StockInfoDisplay';

import './Home.css';

interface Exchange {
  name: string,
  index: string,
  active: boolean
}

interface Index {
  name: string,
  price: number,
  change: number
}

export default function Home() {
  const indices: Index[] = [
    {
      name: 'Nifty 50',
      price: 18338.55,
      change: 0.97
    },
    {
      name: 'Nasdaq',
      price: 14897.34,
      change: 0.50
    },
    {
      name: 'Dow',
      price: 35294.76,
      change: 1.09
    }
  ];

  const exchanges: Exchange[] = [
    {
      name: 'NSE',
      index: 'dev_nse_equity',
      active: true
    },
    {
      name: 'NASDAQ',
      index: 'dev_nasdaq_equity',
      active: false
    },
    {
      name: 'NYSE',
      index: 'dev_nyse_equity',
      active: false
    }
  ];

  const sectors = ['IT Services', 'Food & Retail', 'Banking & Finance'];

  const alphavantageBaseUrl = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=';

  const [alphavantageKey, setAlphavantageKey] = useState('');

  const GLOBAL_QUOTE = 'Global Quote';
  const ERROR_MESSAGE = 'Error Message';
  const SYMBOL = '01. symbol';

  const [searchIndex, selectSearchIndex] = useState('dev_nse_equity');

  const [selectedExchange, selectExchange] = useState('NSE');

  const [selectedSector, selectSector] = useState('');

  const [selectedStock, selectStock] = useState(null);

  const [newStockSelected, setNewStockSelected] = useState(false);

  const [quote, setQuote] = useState(null);

  const {enqueueSnackbar} = useSnackbar();

  const handleExchangeSelect = (event: SelectChangeEvent) => {
    selectExchange(event.target.value);
    const entryNo = exchanges.findIndex(exchange => exchange.name === selectedExchange);
    selectSearchIndex((entryNo < 0) ? '' : exchanges[entryNo].index);
  };

  const handleSectorSelect = (value: string) => {
    if (value === selectedSector) selectSector('');
    else selectSector(value);
  };

  const handleStockSelect = (stock: any) => {
    // ISSUE - Setting 2 states is re-rendering the entire view and algolia search box resulting in 2 extra api calls.
    // SOLUTION - Fixed the re-render by using useMemo hook but caching can be added to reduce more unwanted api calls.
    setNewStockSelected(true);
    selectStock(stock);
  };

  useEffect(() => {
    const showErrorMessage = (message: string) => {
      enqueueSnackbar(message, {variant: 'error'});
    };

    if (newStockSelected && selectedStock) {
      fetch(alphavantageBaseUrl + selectedStock['Symbol'] + '.BSE&apikey=' + alphavantageKey)
          .then(res => res.json())
          .then(
              (q) => {
                if (q[ERROR_MESSAGE]) {
                  showErrorMessage(q[ERROR_MESSAGE])
                } else if (q[GLOBAL_QUOTE][SYMBOL] === undefined) {
                  showErrorMessage(
                      'Stock info not available. Please try again after some time.'
                  )
                }
                setQuote(q[GLOBAL_QUOTE]);
              },
              (e) => showErrorMessage(e.message)
          )
          .then(() => setNewStockSelected(false));
    }
  }, [newStockSelected, selectedStock, alphavantageKey, enqueueSnackbar]);

  const memoizedAlgoliaSearch = useMemo(() => {
    const searchClient = algoliasearch(
        // @ts-ignore
        process.env.ALGOLIA_APP_ID,
        process.env.ALGOLIA_API_KEY
    );

    return (
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
          <InstantSearch indexName={searchIndex} searchClient={searchClient}>
            <ConnectedAlgoliaSearchBox />
            <SearchResult selectStock={handleStockSelect} />
          </InstantSearch>
        </Box>
    );
    // eslint-disable-next-line
  }, [searchIndex]);

  const memoizedStockInfoDisplay = useMemo(
      () => <StockInfoDisplay selectedStock={selectedStock} quote={quote} />,
      [selectedStock, quote]
  );

  return (
      <Box sx={{padding: '0 48px'}}>
        <Box sx={{display: 'flex', columnGap: '20px', padding: '10px 0 20px 0'}}>
          <Box sx={{display: 'flex', alignItems: 'flex-end', columnGap: '16px', paddingBottom: '20px'}}>
            <Typography variant="h4" component="div" className="text-gradient">
              Stock Info
            </Typography>
            <Typography variant="caption" component="div" color="text.primary" gutterBottom>
              powered by
            </Typography>
            <img width="96px" height="32px" src={AlgoliaLogo} alt="Algolia logo" />
            <Typography variant="caption" component="div" color="text.primary" gutterBottom>
              &
            </Typography>
            <Typography variant="h6" component="div" className="text-gradient">
              Alpha Vantage
            </Typography>
          </Box>
          <List sx={{display: 'flex', columnGap: '20px', color: 'text.primary', paddingLeft: '20px'}}>
            {
              indices.map(index => (
                  <ListItem
                      key={index.name.replaceAll(' ', '') + '-index'}
                      sx={{width: '168px'}}
                      disablePadding
                  >
                    <ListItemButton>
                      <ListItemText
                          primary={index.name}
                          secondary={index.price + ' (' + index.change + '%)'}
                          secondaryTypographyProps={{color: 'forestgreen'}}
                      />
                    </ListItemButton>
                  </ListItem>
              ))
            }
          </List>
          <Box sx={{display: 'flex', alignItems: 'flex-end', columnGap: '16px', paddingBottom: '20px'}}>
            <Input
                placeholder="Enter Alpha Vantage Key"
                onChange={e => setAlphavantageKey(e.currentTarget.value)}
                sx={{width: '240px', fontSize: '18px', padding: '0 16px'}}
            />
            <Typography
                variant="caption"
                component="a"
                color="white"
                href="https://www.alphavantage.co/support/#api-key"
                target="_blank"
            >
              Get key
            </Typography>
          </Box>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'flex-start', columnGap: '20px'}}>
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <Select
                value={selectedExchange}
                onChange={handleExchangeSelect}
                variant="standard"
                sx={{
                  width: '144px',
                  fontSize: '18px',
                  '& .MuiSelect-select': {
                    paddingTop: '5px',
                    paddingLeft: '16px'
                  }
                }}
            >
              {
                exchanges.map((exchange: Exchange) => (
                    <MenuItem
                        key={exchange.name}
                        value={exchange.name}
                        disabled={!exchange.active}
                        sx={{fontSize: '18px'}}
                    >
                      {exchange.name}
                    </MenuItem>
                ))
              }
            </Select>
            <List sx={{width: '144px', color: 'text.primary'}}>
              {
                sectors.map(sector => (
                    <ListItem key={sector.replaceAll(' ', '')} disablePadding>
                      <ListItemButton selected={selectedSector === sector} onClick={() => handleSectorSelect(sector)}>
                        <ListItemText primary={sector} />
                      </ListItemButton>
                    </ListItem>
                ))
              }
            </List>
          </Box>
          {memoizedAlgoliaSearch}
          {memoizedStockInfoDisplay}
        </Box>
      </Box>
  );
}
