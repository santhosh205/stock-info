import {createConnector} from 'react-instantsearch-dom';
import {Input} from '@mui/material';
import React from 'react';

const algoliaSearchConnect = createConnector({
  displayName: 'AlgoliaSearchConnect',
  getProvidedProps(props, searchState) {
    const currentRefinement = searchState.searchText || '';
    return {currentRefinement};
  },
  refine(props, searchState, nextRefinement) {
    return {...searchState, searchText: nextRefinement};
  },
  getSearchParameters(searchParameters, props, searchState) {
    return searchParameters.setQuery(searchState.searchText || '');
  },
  cleanUp(props, searchState) {
    const {searchText, ...nextSearchState} = searchState;
    return nextSearchState;
  }
});

function InstantSearch({currentRefinement, refine}: any) {
  return (
      <Input
          placeholder="Search stocks"
          value={currentRefinement}
          onChange={e => refine(e.currentTarget.value)}
          sx={{width: '360px', fontSize: '18px', padding: '0 16px'}}
      />
  );
}

export const ConnectedAlgoliaSearchBox = algoliaSearchConnect(InstantSearch);
