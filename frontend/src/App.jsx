import React from "react";
import FruitList from "./components/Fruit";

function App(){  
  return(
    <div className = "App">
      <header className="app-header">
        <h1>Fruit Management App</h1>
      </header>
      <main>
        <FruitList/>
      </main>
    </div>
  );
}

export default App;
