// src/components/project-search/TagInput.tsx
import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
// This component will be styled via its props to fit your theme.
// The actual fetching logic is identical to what we built before.
// ... (Paste the full TagInput.js code we created, converting to TSX if needed)
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// This component will receive the currently selected tags (value)
// and a function to call when they change (onChange)
function TagInput({ value, onChange }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // This effect runs whenever the user types in the input box
  useEffect(() => {
    if (inputValue === '') {
      setOptions([]);
      return;
    }

    setLoading(true);
    // Fetch tag suggestions from our backend
    axios.get(`${API_BASE_URL}/tags/search?q=${inputValue}`)
      .then(response => {
        setOptions(response.data.map(tag => tag.name));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch tags", err);
        setLoading(false);
      });
  }, [inputValue]);

  return (
    <Autocomplete
      multiple // Allow multiple tags to be selected
      freeSolo // Allow users to create new tags not in the list
      value={value}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={options}
      loading={loading}
      style={{ width: '300px', margin: '20px 0' }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label="Tags"
          placeholder="Add tags..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

export default TagInput;