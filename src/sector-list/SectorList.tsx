import React from 'react';
import {Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from '@mui/material';

function SectorList(
    props: {
      sectors: string[],
      selectedSectors: string[],
      selectSector(sector: string): void
    }
) {
  const checkAndDisable = (sector: string) =>
      (props.selectedSectors.length === 5) && !props.selectedSectors.includes(sector);

  return (
      <List className="sector-list" sx={{maxHeight: '480px', overflowY: 'scroll', color: 'text.primary'}}>
        {
          props.sectors.map((sector: string, index: number) => (
              <ListItem key={'sector-' + index} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <Checkbox
                        edge="start"
                        disableRipple
                        sx={{width: '24px', height: '24px', paddingLeft: '16px'}}
                        onClick={() => props.selectSector(sector)}
                        checked={props.selectedSectors.includes(sector)}
                        disabled={checkAndDisable(sector)}
                    />
                  </ListItemIcon>
                  <ListItemText primary={sector} />
                </ListItemButton>
              </ListItem>
          ))
        }
      </List>
  );
}

export default SectorList;
