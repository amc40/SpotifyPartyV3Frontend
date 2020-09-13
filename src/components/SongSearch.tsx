import * as React from 'react';
import { SearchBar } from './SearchBar';

// search bar wrapper which converts onChange events into searchTextUpdated with the new text.

interface Props {
    // placeholder string to display when there is no text
    placeholder: string,
    // when the user changes the search text
    onSearchTextUpdated: (newSearchText: string) => void;
    // when the user starts to search
    onStartSearch: () => void;
    // when the user cancels searching
    handleCancel: () => void;
}

export const SongSearch = (props: Props) => {
    const { placeholder, onSearchTextUpdated, onStartSearch, handleCancel } = props;
    const [searchText, setSearchText] = React.useState('');
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchText = e.target.value;
        setSearchText(newSearchText);
        onSearchTextUpdated(newSearchText);
    }

    const onCancel = () => {
        setSearchText('');
        handleCancel();
    }

    return <SearchBar value={searchText} placeholder={placeholder} onChange={onChange} onFocus={onStartSearch} onCancel={onCancel}/>
};