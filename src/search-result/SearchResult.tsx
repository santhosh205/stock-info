import React from 'react';
import {List, ListItem, ListItemButton, ListItemText} from '@mui/material';
import {connectHits} from 'react-instantsearch-dom';
import {Stock} from '../interfaces';

function SearchResult(
    props: {
      hits: any[];
      selectStock: (stock: Stock) => void
    }
) {
  return (
      <List sx={{width: '360px', color: 'text.primary'}}>
        {
          props.hits.map((hit: Stock) => (
              <ListItem key={'search-result-' + hit.objectID} disablePadding>
                <ListItemButton onClick={() => props.selectStock(hit)}>
                  <ListItemText primary={hit.Company} secondary={hit.Symbol} />
                </ListItemButton>
              </ListItem>
          ))
        }
      </List>
  );
}

export default connectHits(SearchResult);
