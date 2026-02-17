import Button from './components/Button';

function App(){
  return (
    <div>
      <Button onClick={()=>{console.log("click") }} >button</Button>
    </div>
  )
}

export default App;
