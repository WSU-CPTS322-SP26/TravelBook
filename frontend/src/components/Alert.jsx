

const Alert = ({children, color="primary", onClose}) => {
    return (
        <div className = {"alert alert-dismissible alert-" + color} role='alert'>
            {children}
            <button type="button" className='btn-close' data-bs-dismiss="alert" aria-label="Close" onClick={onClose}></button>
        </div>
    );
}

export default Alert;