import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <p>
        Welcome to the Obsession game guide!
      </p>
      <p>
        Eventually, the guide will have more info. Maybe a table of contents, too.
      </p>
      <p>
        For now, you can search the articles using the search box at the top of the page.
      </p>
      <p>
        This is just a proof-of-concept. Only the pages for <Link to="/guest/casual/sara-forbes-bonetta">Sara</Link> and the <Link to="/tile/barn">Barn</Link> have images, and the Barn one is out of date.
      </p>
    </div>
  );
}

export default Home;
