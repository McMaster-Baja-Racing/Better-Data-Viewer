import '../styles/App.css';
// import useState
import React, { useState, useEffect } from 'react';
import Chart from './Chart';
import Topbar from './Topbar';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    callBackendAPI()
      .then(res => setData(res.express))
      .catch(err => console.log(err));
  }, []);

  // fetching the GET route from the Express server which matches the GET route from server.js
  const callBackendAPI = async () => {
    const response = await fetch('/express_backend');
    const body = await response.json();

    console.log(body);

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  };

  return (
    <><Topbar />
    <div className="App">
      
      <header className="App-header">
      <Chart />
      </header>
      <p className="App-intro">{data}</p>
    </div></>
  );
}

export default App;
