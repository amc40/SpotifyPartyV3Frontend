import * as React from 'react';
import { SearchBar } from './SearchBar';

interface Props {
    placeholder: string,
    onSearchTextUpdated: (newSearchText: string) => void;
    onStartSearch: () => void;
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