import * as React from 'react';

interface Props {
    initialSearchText: string,
    onSearchTextUpdated: (newSearchText: string) => void;
    onStartSearch: () => void;
}

export const SongSearch = (props: Props) => {
    const [searchText, setSearchText] = React.useState(props.initialSearchText);
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchText = e.target.value;
        setSearchText(newSearchText);
        props.onSearchTextUpdated(newSearchText);
    }
    return <input value={searchText} onChange={onChange} onFocus={props.onStartSearch}/>;
};