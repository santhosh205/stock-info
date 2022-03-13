import React from 'react';
import {List, ListItem, ListItemButton, ListItemText} from '@mui/material';
import {connectHits} from 'react-instantsearch-dom';

function SearchResult(
    props: {
      hits: any[];
      selectStock: (symbol: string) => any
    }
) {
  return (
      <List sx={{width: '360px', color: 'text.primary'}}>
        {
          props.hits.map((hit: any) => (
              <ListItem key={'search-result-' + hit['objectID']} disablePadding>
                <ListItemButton onClick={() => props.selectStock(hit)}>
                  <ListItemText primary={hit['Company']} secondary={hit['Symbol']} />
                </ListItemButton>
              </ListItem>
          ))
        }
      </List>
  );
}

export default connectHits(SearchResult);
