import {useState} from 'react';

function ListGroup({items, heading}){
    
    const [selectedIndex, setSelectedIndex] = useState(-1);
    
    return (
    <>
        <h1>{heading}</h1>
        <ul className="list-group">
            {items.length===0 && <p>No Items Found</p>}
            {items.map((item, index) => 
                <li key={item} onClick={ () => { setSelectedIndex(index) } } className={selectedIndex===index ? 'list-group-item active' : 'list-group-item' }>{item}</li>
            )}
        </ul>
    </>
    );
}

export default ListGroup;