import * as React from 'react';
import axios from 'axios';
import styles from './App.module.css';
import { ReactComponent as Check } from './check.svg';

type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
}

type Stories = Array<Story>;

type ListProps = {
  list: Stories;
  onDeleteItem: (item: Story) => void;
}

type ItemProps = {
  item: Story;
  onDeleteItem: (item: Story) => void;
}

type StoriesState = {
  data: Stories;
  isLoading: boolean;
  isError: boolean;
}

interface StoriesFetchInitAction {
  type: 'STORIES_FETCH_INIT';
}

interface StoriesFetchSuccessAction {
  type: 'STORIES_FETCH_SUCCESS';
  payload: Stories;
}

interface StoriesFetchFailureAction {
  type: 'STORIES_FETCH_FAILURE';
}

interface StoriesRemoveAction {
  type: 'REMOVE_STORY';
  payload: Story;
}

type StoriesAction =
  | StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction;

type SearchFormProps = {
  inputId: string;
  inputValue: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.ChangeEvent<HTMLFormElement>) => void;
}

type LabelInputProps = {
  isFocused: boolean;
  inputId: string;
  labelText: string;
  inputValue: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const storiesReducer = (state: StoriesState, action: StoriesAction) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      }
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      }
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      }
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter((story) => action.payload.objectID !== story.objectID)
      }
    default:
      throw new Error();
  }
}

const getSumComments = (stories) => {
  return stories.data.reduce((result, value) => result + value.num_comments, 0);
}

const App = () => {
  //alert('render app');

  const [stories, dispatchStories] = React.useReducer(storiesReducer,
    { data: [], isLoading: false, isError: false });

  const [searchTerm, setSearchTerm] = useStorageState('search', 'React');
  React.useEffect(() => localStorage.setItem('search', searchTerm), [searchTerm]);

  const storeSearchTerm = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchTerm(searchValue);
  }

  const [confirmedSearchTerm, setConfirmedSearchTerm] = React.useState('');

  const inputId = 'search';

  const submitSearchTerm = (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchInput = document.getElementById(inputId) as HTMLInputElement;
    setConfirmedSearchTerm(searchInput.value);
  }

  const handleFetchStories = React.useCallback(async () => {
    // alert(`callback handleFetchStories - confirmedSearchTerm ${confirmedSearchTerm}`);

    if (!confirmedSearchTerm)
      return;

    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      alert(`calling algolia`);
      const result = await axios.get(`https://hn.algolia.com/api/v1/search?query=${confirmedSearchTerm}`);
      alert(`got response from algolia`);
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits
      })
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }
  }, [confirmedSearchTerm]);

  React.useEffect(() => {
    const fetchStories = async () => {
      await handleFetchStories();
    }
    fetchStories();
  }, [handleFetchStories]);

  const onDeleteItem =
    React.useCallback((item: Story) => dispatchStories({ type: 'REMOVE_STORY', payload: item }),
      []);

  const sumComments = React.useMemo(() => getSumComments(stories), [stories]);

  return (
    <div className={styles.container}>
      <h1 className={styles.headlinePrimary}>My Hacker Stories with {sumComments} comments.</h1>

      <SearchForm
        onInputChange={storeSearchTerm}
        onSubmit={submitSearchTerm}
        inputId={inputId}
        inputValue={searchTerm}
      />

      {stories.isError && <p>Something went wrong...</p>}

      {stories.isLoading ? (
        <p>Loading...</p>
      ) : (

        stories.data.length > 0 ? (
          <List list={stories.data} onDeleteItem={onDeleteItem} />
        ) : (
          <p>No results</p>
        )
      )}
    </div>
  )
}

const useStorageState = (key: string, initialState: string):
  [string, (newValue: string) => void] => {

  const isMounted = React.useRef(false);
  const [value, setValue] = React.useState(localStorage.getItem(key) || initialState);

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      localStorage.setItem(key, value);
    }
  }, [value, key]);

  return [value, setValue];
}

const SearchForm = ({ onInputChange, onSubmit, inputId, inputValue }: SearchFormProps) => {
  return (
    <form className={styles.searchForm} onSubmit={onSubmit}>
      <LabelInput
        isFocused
        inputId={inputId} labelText="Search: "
        inputValue={inputValue}
        onInputChange={onInputChange}
      />
      <button className={`${styles.button} ${styles.buttonLarge}`} type="submit" disabled={!inputValue}>
        Submit
      </button>
    </form>
  )
}

const LabelInput = ({ isFocused, inputId, labelText, inputValue, onInputChange }: LabelInputProps) => {

  const inputRef = React.useRef<HTMLInputElement>(null!);

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <div>
      <label className={styles.label} htmlFor={inputId}>{labelText}</label>
      <input className={styles.input} ref={inputRef} id={inputId} type="text" value={inputValue} onChange={onInputChange} />
    </div>
  )
}

const List = React.memo(({ list, onDeleteItem }: ListProps) => (
  <ul>
    {list.slice(0, 10).map((item) => {
      return (
        <Item key={item.objectID} item={item} onDeleteItem={onDeleteItem} />
      )
    })}
  </ul>
));

const Item = ({ item, onDeleteItem }: ItemProps) => (
  <li className={styles.item}>
    <span style={{ width: '40%' }}>
      <a href={item.url}>{item.title}</a>
    </span>
    <span style={{ width: '30%' }}>{item.author}</span>
    <span style={{ width: '10%' }}>{item.num_comments}</span>
    <span style={{ width: '10%' }}>{item.points}</span>
    <button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => onDeleteItem(item)}>
      <Check height='18px' width='18px' />
    </button>
  </li>
);

export default App;
export { storiesReducer, SearchForm, LabelInput, List, Item };