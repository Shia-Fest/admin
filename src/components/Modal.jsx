import React from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
    if(!isOpen) return null;

    return (
        <div>
            <div>
                <div>
                    <h3>{title}</h3>
                    <button onClick={onClose}>&times;</button>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal;