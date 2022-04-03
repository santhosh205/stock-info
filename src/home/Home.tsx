import {Box, Button, Input, Typography} from '@mui/material';
import {StackedLineChart} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import {green} from '@mui/material/colors';
import algoliasearch from 'algoliasearch';
import {initializeApp} from 'firebase/app';
import {collection, Firestore, getDocs, getFirestore} from 'firebase/firestore/lite';
import {useSnackbar} from 'notistack';
import React, {useEffect, useMemo, useState} from 'react';
import {Configure, InstantSearch} from 'react-instantsearch-dom';
import {ConnectedAlgoliaSearchBox} from '../instant-search/InstantSearch';
import {Sector} from '../interfaces';
import AlgoliaLogo from '../logo-algolia-nebula-blue-full.svg';
import SearchResult from '../search-result/SearchResult';
import SectorList from '../sector-list/SectorList';
import StockInfoDisplay from '../stock-info-display/StockInfoDisplay';

import './Home.css';

export default function Home() {

  const [sectors, loadSectors] = useState<string[]>([]);
  const [selectedSectors, updateSelectedSectors] = useState<string[]>([]);

  useEffect(() => {
    const firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: 'stock-info-71428.firebaseapp.com',
      projectId: 'stock-info-71428',
      storageBucket: 'stock-info-71428.appspot.com',
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
    };

    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);

    getSectors(firestore).then(data => {
      data.sort();
      loadSectors(data);
    });
  }, []);

  const handleSectorSelect = (sector: string) => {
    if (!selectedSectors.includes(sector) && selectedSectors.length < 5) {
      updateSelectedSectors([...selectedSectors, sector]);
    } else {
      updateSelectedSectors(selectedSectors.filter(value => value !== sector));
    }
  };

  const alphaVantageGetKeyUrl = 'https://www.alphavantage.co/support/#api-key';
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

        let filtersValue = '';
        selectedSectors.forEach((sector, index) => {
          if (index) filtersValue += ' OR ';
          filtersValue += `Sector:'${sector}'`;
        });

        return (
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
              <InstantSearch searchClient={searchClient} indexName={searchIndex}>
                <Configure filters={filtersValue} />
                <ConnectedAlgoliaSearchBox />
                <SearchResult selectStock={handleStockSelect} />
              </InstantSearch>
            </Box>
        );
      },
      [selectedSectors]
  );

  return (
      <Box sx={{padding: '24px 48px'}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '48px'}}>
          <Box sx={{display: 'flex', alignItems: 'flex-end', columnGap: '16px'}}>
            <StackedLineChart fontSize="large" sx={{color: green[600], paddingBottom: '4px'}} />
            <Typography variant="h4" component="div" className="text-gradient">Stock Info</Typography>
            <Typography variant="caption" component="div" color="text.primary" gutterBottom>powered by</Typography>
            <img width="96px" height="32px" src={AlgoliaLogo} alt="Algolia logo" />
            <Typography variant="caption" component="div" color="text.primary" gutterBottom>&</Typography>
            <Typography variant="h6" component="div" className="text-gradient">Alpha Vantage</Typography>
          </Box>
          <Box sx={{width: '360px', display: 'flex', flexDirection: 'row-reverse', columnGap: '16px'}}>
            <Button href={alphaVantageGetKeyUrl} target="_blank" sx={{textTransform: 'none'}}>
              Get key
            </Button>
            <Input
                placeholder="Enter Alpha Vantage key"
                onChange={e => setAlphavantageKey(e.currentTarget.value)}
                sx={{width: '240px', height: '48px', fontSize: '16px', padding: '0 16px'}}
            />
          </Box>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'flex-start', columnGap: '24px'}}>
          {memoizedAlgoliaSearch}
          <StockInfoDisplay selectedStock={selectedStock} quote={quote} />
          <Box sx={{marginLeft: 'auto', width: '360px'}}>
            <Typography
                variant="h6"
                component="div"
                color="text.primary"
                sx={{paddingBottom: '16px', paddingLeft: '72px'}}
            >
              Sectors ({selectedSectors.length}/5)
            </Typography>
            {
              sectors.length > 0
                  ? <SectorList sectors={sectors} selectedSectors={selectedSectors} selectSector={handleSectorSelect}/>
                  : <CircularProgress sx={{paddingLeft: '72px'}} />
            }
          </Box>
        </Box>
      </Box>
  );
}

async function getSectors(firestore: Firestore): Promise<string[]> {
  const sectorCollection = collection(firestore, 'sector');
  const sectorSnapshot = await getDocs(sectorCollection);
  return sectorSnapshot.docs.map(doc => (doc.data() as Sector).name);
}
