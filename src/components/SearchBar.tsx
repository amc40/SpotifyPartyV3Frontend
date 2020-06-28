import React from 'react';
import { Paper, IconButton, InputBase, createStyles, Theme, makeStyles } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

interface Props {
    value: string;
    placeholder: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus: () => void;
    onCancel: () => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: 10,
      marginBottom: 10,
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      width: 400,
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    searchIcon: {
      padding: 1,
    },
    clearIcon: {
        padding: 3,
        // color: '#ADADAD'
    }
  }),
);

export const SearchBar = (props: Props) => {
    const { placeholder, value, onChange, onFocus, onCancel } = props;
    const classes = useStyles();
    return (
        <Paper component="form" className={classes.root}>
          <SearchIcon className={classes.searchIcon} />
          <InputBase
            className={classes.input}
            autoFocus={false}
            placeholder={placeholder}
            onChange={onChange}
            onFocus={onFocus}
            value={value}
          />
          <IconButton className={classes.clearIcon} aria-label="search" onClick={onCancel}>
            <ClearIcon />
          </IconButton>
        </Paper>
      );
}