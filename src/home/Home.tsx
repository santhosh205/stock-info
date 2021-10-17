import React, {useState} from 'react';
import {Box, List, ListItem, ListItemButton, ListItemText, MenuItem, Select, SelectChangeEvent} from '@mui/material';
import {ConnectedAlgoliaSearchBox} from '../instant-search/InstantSearch';
import {InstantSearch} from 'react-instantsearch-dom';
import algoliasearch from 'algoliasearch';
import SearchResult from '../search-result/SearchResult';

interface Exchange {
  name: string,
  index: string,
  active: boolean
}

export default function Home() {

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

  const [selectedExchange, selectExchange] = useState('NSE');

  let searchIndex: string | undefined = 'dev_nse_equity';

  const [selectedSector, selectSector] = useState('');

  const handleExchangeSelect = (event: SelectChangeEvent) => {
    selectExchange(event.target.value);
    searchIndex = exchanges.find(exchange => exchange.name === selectedExchange)?.index;
  };

  const handleSelectSector = (value: string) => {
    if (value === selectedSector) selectSector('');
    else selectSector(value);
  }

  const searchClient = algoliasearch('env.appId', 'env.apiKey');

  return (
      <Box sx={{display: 'flex', alignItems: 'flex-start', columnGap: '20px', padding: '100px'}}>
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
                  <MenuItem key={exchange.name} value={exchange.name} disabled={!exchange.active} sx={{fontSize: '18px'}}>
                    {exchange.name}
                  </MenuItem>
              ))
            }
          </Select>
          <List sx={{width: '144px'}}>
            {
              sectors.map(sector => (
                  <ListItem key={sector.replaceAll(' ', '')} disablePadding>
                    <ListItemButton selected={selectedSector === sector} onClick={() => handleSelectSector(sector)}>
                      <ListItemText primary={sector} />
                    </ListItemButton>
                  </ListItem>
              ))
            }
          </List>
        </Box>
        <Box sx={{display: 'flex', flexDirection: 'column'}}>
          <InstantSearch indexName={searchIndex ? searchIndex : ''} searchClient={searchClient}>
            <ConnectedAlgoliaSearchBox />
            <SearchResult />
          </InstantSearch>
        </Box>
      </Box>
  );
}
