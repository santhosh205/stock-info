import React from 'react';
import {List, ListItem, ListItemButton, ListItemText} from '@mui/material';
import {connectHits} from 'react-instantsearch-dom';

function SearchResult(props: any) {

  return (
    <List sx={{width: '360px'}}>
      {
        props.hits.map((hit: any) => (
            <ListItem key={'search-result-' + hit['ISIN']} disablePadding>
              <ListItemButton>
                <ListItemText primary={hit['Company']} secondary={hit['Symbol']} />
              </ListItemButton>
            </ListItem>
        ))
      }
    </List>
  );
}

export default connectHits(SearchResult);
