import React from 'react';
import { Link } from 'react-router-dom';

export default function Template(props) {
  return (
    <div>
      <div className="page-header">
        <Link to="/search">Search</Link>
      </div>
      <div className="page-body">
        {props.children}
      </div>
    </div>
  );
}
