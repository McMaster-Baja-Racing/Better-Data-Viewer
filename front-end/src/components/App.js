import '../styles/App.css';
// import useState
import React, { useState } from 'react';
import Chart from './Chart';
import Topbar from './Topbar';

function App() {

  return (
    <><Topbar />
    <div className="App">
      
      <header className="App-header">
      <Chart />
      </header>
    </div></>
  );
}

export default App;
