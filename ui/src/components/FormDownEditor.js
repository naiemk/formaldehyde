import React from 'react';

export default function FormDownEditor(params) {
  return (
    <div className="container space-under">
      <div className="row">
        <div className="col-12">
          <textarea className="form-control" value={params.text} rows="10"
             onChange={params.onChange}
          />

        </div>
      </div>
    </div>
  )
}
