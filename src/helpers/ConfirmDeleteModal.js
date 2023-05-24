import React, {useContext} from "react";
import {COMMENT, CURRENT_LINE, FOREGROUND, PURPLE, YELLOW} from "./colors";
import {confirmAlert} from "react-confirm-alert";
import 'react-confirm-alert/src/react-confirm-alert.css';
import {ContactContext} from "../context/contactContext";

const ConfirmDeleteModal = ({contactId, contactFullName}) => {
    const {removeContact} = useContext(ContactContext);
    const handleDelete = (contactId) => {
        removeContact(contactId)
    }
    confirmAlert({
        customUI: ({onClose}) => {
            return (
                <div dir='rtl'
                     style={{backgroundColor: CURRENT_LINE, border: `1px solid ${PURPLE}`, borderRadius: '1em'}}
                     className='p-4'>
                    <h1 style={{color: YELLOW}}>پاک کردن مخاطب</h1>
                    <p style={{color: FOREGROUND}}>مطمئنید که می خواهید مخاطب {contactFullName} را پاک کنید؟ </p>
                    <button onClick={() => {handleDelete();onClose();}
                    } className='btn mx-2' style={{backgroundColor: PURPLE}}>مطمئن هستم
                    </button>
                    <button onClick={onClose} className='btn' style={{backgroundColor: COMMENT}}>انصراف</button>
                </div>
            )
        }
    })
}

export default ConfirmDeleteModal;