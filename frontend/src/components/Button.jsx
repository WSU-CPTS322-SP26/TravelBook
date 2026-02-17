import React from "react"

const Button = ({children, color="primary", onClick}) => {
    return (
        <button onClick = {onClick} className={"btn btn-" + color} >{children}</button>
    )
}

export default Button