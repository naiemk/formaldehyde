import React from 'react';

export default function FormDownEditor(params) {
  return (
    <textarea value={params.text} rows="10" cols="80"
       onChange={params.onChange}
    />
  )
}
