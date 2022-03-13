import {Box, Input, Typography} from '@mui/material';
import algoliasearch from 'algoliasearch';
import {useSnackbar} from 'notistack';
import React, {useEffect, useMemo, useState} from 'react';
import {InstantSearch} from 'react-instantsearch-dom';
import {ConnectedAlgoliaSearchBox} from '../instant-search/InstantSearch';
import AlgoliaLogo from '../logo-algolia-nebula-blue-full.svg';
import SearchResult from '../search-result/SearchResult';
import StockInfoDisplay from '../stock-info-display/StockInfoDisplay';

import './Home.css';

export default function Home() {

  const alphavantageQuoteUrl = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=';

  const [alphavantageKey, setAlphavantageKey] = useState('');

  const GLOBAL_QUOTE = 'Global Quote';
  const ERROR_MESSAGE = 'Error Message';
  const SYMBOL = '01. symbol';

  const [selectedStock, selectStock] = useState(null);
  const [newStockSelected, setNewStockSelected] = useState(false);

  const [quote, setQuote] = useState(null);

  const {enqueueSnackbar} = useSnackbar();

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
      const ticker = selectedStock['Symbol'] + (selectedStock['Market'] ? '.' + selectedStock['Market'] : '');
      const credentials = '&apikey=' + alphavantageKey;

      fetch(alphavantageQuoteUrl + ticker + credentials)
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

  const memoizedAlgoliaSearch = useMemo(
      () => {
        const searchClient = algoliasearch(
            process.env.REACT_APP_ALGOLIA_APP_ID as string,
            process.env.REACT_APP_ALGOLIA_API_KEY as string
        );
        const searchIndex = process.env.REACT_APP_ALGOLIA_SEARCH_INDEX as string;

        return (
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
              <InstantSearch searchClient={searchClient} indexName={searchIndex}>
                <ConnectedAlgoliaSearchBox />
                <SearchResult selectStock={handleStockSelect} />
              </InstantSearch>
            </Box>
        );
      },
      []
  );

  return (
      <Box sx={{padding: '24px 48px'}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '48px'}}>
          <Box sx={{display: 'flex', alignItems: 'flex-end', columnGap: '16px'}}>
            <Typography variant="h4" component="div" className="text-gradient">Stock Info</Typography>
            <Typography variant="caption" component="div" color="text.primary" gutterBottom>powered by</Typography>
            <img width="96px" height="32px" src={AlgoliaLogo} alt="Algolia logo" />
            <Typography variant="caption" component="div" color="text.primary" gutterBottom>&</Typography>
            <Typography variant="h6" component="div" className="text-gradient">Alpha Vantage</Typography>
          </Box>
          <Input
              placeholder="Enter Alpha Vantage key"
              onChange={e => setAlphavantageKey(e.currentTarget.value)}
              sx={{width: '240px', height: '48px', fontSize: '16px', padding: '0 16px'}}
          />
        </Box>
        <Box sx={{display: 'flex', alignItems: 'flex-start', columnGap: '24px'}}>
          {memoizedAlgoliaSearch}
          <StockInfoDisplay selectedStock={selectedStock} quote={quote}/>
        </Box>
      </Box>
  );
}
