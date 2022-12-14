import * as React from 'react';
import App, { storiesReducer, Item, List, SearchForm, LabelInput } from './App';

const storyOne = {
  title: 'React',
  url: 'https://reactjs.org/',
  author: 'Jordan Walke',
  num_comments: 3,
  points: 4,
  objectID: 0
}

const storyTwo = {
  title: 'Redux',
  url: 'https://redux.js.org/',
  author: 'Dan Abramov, Andrew Clark',
  num_comments: 2,
  points: 5,
  objectID: 1
}

const stories = [storyOne, storyTwo];

describe('storiesReducer', () => {
  test('removes a story from all stories', () => {
    const state = { data: stories, isLoading: false, isError: false };
    const action = { type: 'REMOVE_STORY', payload: storyOne };
    const newState = storiesReducer(state, action);
    const expectedState = { data: [storyTwo], isLoading: false, isError: false }
    expect(newState).toStrictEqual(expectedState);
  })
})

describe('something truthy and falsy', () => {
  test('true to be true', () => {
    expect(true).toBeTruthy();
  })

  test('false to be false', () => {
    expect(false).toBeFalsy();
  })
})

describe('App component', () => {
  test('removes an item when clicking the Dismiss button', () => {

  })

  test('requests some initial stories from an API', () => {

  })
})