
function handleClick(event){
    console.log(event)
}

function ListGroup(){
    let items= [
        'New York',
        'San Francisco',
        'Tokyo',
        'London',
        'Paris'
    ];
    
    return (
    <>
        <h1>List</h1>
        <ul className="list-group">
            {items.length===0 && <p>No Items Found</p>}
            {items.map((item) => 
                <li key={item} onClick={handleClick} className='list-group-item'>{item}</li>
            )}
        </ul>
    </>
    );
}

export default ListGroup;