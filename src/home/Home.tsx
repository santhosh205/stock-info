import {Box, Typography} from '@mui/material';
import {StackedLineChart} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import {green} from '@mui/material/colors';
import algoliasearch from 'algoliasearch';
import {initializeApp} from 'firebase/app';
import {initializeAppCheck, ReCaptchaV3Provider} from 'firebase/app-check';
import {collection, Firestore, getDocs, getFirestore} from 'firebase/firestore/lite';
import {getFunctions, httpsCallable} from 'firebase/functions';
import {useSnackbar} from 'notistack';
import React, {useEffect, useMemo, useState} from 'react';
import {Configure, InstantSearch} from 'react-instantsearch-dom';
import {ConnectedAlgoliaSearchBox} from '../instant-search/InstantSearch';
import {Quote, Sector, Stock} from '../interfaces';
import AlgoliaLogo from '../logo-algolia-nebula-blue-full.svg';
import SearchResult from '../search-result/SearchResult';
import SectorList from '../sector-list/SectorList';
import StockInfoDisplay from '../stock-info-display/StockInfoDisplay';

import './Home.css';

export default function Home() {
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
  const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.REACT_APP_RECAPTCHA_SITE_KEY as string)
  });

  if (appCheck !== null) {
    console.log('App check enabled with ReCaptcha V3');
  }

  const firestore = getFirestore(app);
  const functions = getFunctions(app);
  const getEODQuote = httpsCallable(functions, 'getEODQuote');

  const [sectors, loadSectors] = useState<string[]>([]);

  useEffect(() => {
    getSectors(firestore).then(data => {
      data.sort();
      loadSectors(data);
    });
  }, [firestore]);

  const [selectedSectors, updateSelectedSectors] = useState<string[]>([]);

  const handleSectorSelect = (sector: string) => {
    if (!selectedSectors.includes(sector) && selectedSectors.length < 5) {
      updateSelectedSectors([...selectedSectors, sector]);
    } else {
      updateSelectedSectors(selectedSectors.filter(value => value !== sector));
    }
  };

  const [selectedStock, selectStock] = useState<Stock>();
  const [stockQuoteRequested, setStockQuoteRequested] = useState(true);

  const handleStockSelect = (stock: Stock) => {
    selectStock(stock);
    setStockQuoteRequested(false);
  };

  const [quote, setQuote] = useState<Quote>();

  const {enqueueSnackbar} = useSnackbar();

  useEffect(() => {
    if (selectedStock !== undefined && !stockQuoteRequested) {
      getEODQuote({symbol: selectedStock.objectID})
          .then(res => setQuote(res.data as Quote))
          .catch(err => enqueueSnackbar(err.code + ' - ' + err.message, {variant: 'error'}));
      setStockQuoteRequested(true);
    }
  }, [selectedStock, stockQuoteRequested, enqueueSnackbar, getEODQuote]);

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
        <Box sx={{display: 'flex', alignItems: 'flex-end', columnGap: '16px', paddingBottom: '48px'}}>
          <StackedLineChart fontSize="large" sx={{color: green[600], paddingBottom: '4px'}} />
          <Typography variant="h4" component="div" className="text-gradient">Stock Info</Typography>
          <Typography variant="caption" component="div" color="text.primary" gutterBottom>powered by</Typography>
          <img width="96px" height="32px" src={AlgoliaLogo} alt="Algolia logo" />
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
                  : <Box sx={{paddingLeft: '72px', paddingTop: '8px'}}><CircularProgress /></Box>
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
