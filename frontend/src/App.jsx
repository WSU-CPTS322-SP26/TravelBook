import Button from './components/Button';
import Alert from './components/Alert';
import { useState } from 'react';

function App(){
  let [alertVisible, setAlertVisibilty] = useState(false);



  return (
    <div>
      {alertVisible && <Alert onClose={()=>{ setAlertVisibilty(false)} }> Close me now!</Alert>}
      <Button onClick={()=>{ setAlertVisibilty(true) }} >button</Button>
    </div>
  )
}

export default App;
