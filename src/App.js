import {useEffect} from "react";
import './App.css';
import {Contacts, AddContact, EditContact, Navbar, ViewContact} from "./components";
import {Navigate, Route, Routes, useNavigate} from "react-router-dom";
import {createContact, deleteContact, getAllContacts, getAllGroups} from "./services/contactService";
import {confirmAlert} from 'react-confirm-alert';
import {COMMENT, CURRENT_LINE, FOREGROUND, PURPLE, YELLOW} from "./helpers/colors";
import {ContactContext} from "./context/contactContext";
import _ from "lodash";
import {useImmer} from "use-immer";
import {ToastContainer, toast} from 'react-toastify'

const App = () => {
    const [loading, setLoading] = useImmer(false);
    const [contacts, setContacts] = useImmer([]);
    const [filteredContacts, setFilteredContacts] = useImmer([]);
    const [groups, setGroups] = useImmer([]);

    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const {data: contactsData} = await getAllContacts();
                const {data: groupsData} = await getAllGroups();

                setContacts(contactsData)
                setFilteredContacts(contactsData);
                setGroups(groupsData)

                setLoading(false)
            } catch (err) {
                console.log(err.message)
                setLoading(false)
            }
        }

        fetchData();

    }, []);

    const createContactForm = async (values) => {
        try {
            setLoading(draft => !draft);

            const {status, data} = await createContact(values);

            if (status === 201) {
                toast.success('مخاطب با موفقیت ساخته شد' , {icon: 'rocket'})
                // const allContacts = [...contacts, data]
                //
                // setContacts(allContacts);
                // setFilteredContacts(allContacts)

                setContacts(draft => {
                    draft.push(data)
                });

                setFilteredContacts(draft => {
                    draft.push(data)
                });

                setLoading(draft => !draft);
                navigate('/contacts')
            }
        } catch (err) {
            console.log(err.message);
            setLoading(draft => !draft);
        }
    }

    const confirmDeleteModal = (contactId, contactFullName) => {
        confirmAlert({
            customUI: ({onClose}) => {
                return (
                    <div dir='rtl'
                         style={{backgroundColor: CURRENT_LINE, border: `1px solid ${PURPLE}`, borderRadius: '1em'}}
                         className='p-4'>
                        <h1 style={{color: YELLOW}}>پاک کردن مخاطب</h1>
                        <p style={{color: FOREGROUND}}>مطمئنید که می خواهید مخاطب {contactFullName} را پاک کنید؟ </p>
                        <button onClick={() => {
                            removeContact(contactId);
                            onClose();
                        }} className='btn mx-2' style={{backgroundColor: PURPLE}}>مطمئن هستم
                        </button>
                        <button onClick={onClose} className='btn' style={{backgroundColor: COMMENT}}>انصراف</button>
                    </div>
                )
            }
        })
    }
    const removeContact = async (contactId) => {
        const contactsBackup = [...contacts];
        try {
            // const updatedContacts = contacts.filter(c => c.id !== contactId);
            // setContacts(updatedContacts);
            // setFilteredContacts(updatedContacts);

            setContacts((draft) => {
                draft.filter((contact) => contact.id !== contactId)
            });
            setFilteredContacts(draft => draft.filter(contact => contact.id !== contactId));

            const {status} = await deleteContact(contactId);

            toast.error('مخاطب با موفقیت حذف شد')

            if (status !== 200) {
                setContacts(contactsBackup)
                setFilteredContacts(contactsBackup)
            }
        } catch (err) {
            console.log(err.message)
            setContacts(contactsBackup)
            setFilteredContacts(contactsBackup)
        }
    }


    const contactSearch = _.debounce((query) => {
        if (!query) return setFilteredContacts([...contacts]);

        setFilteredContacts(contacts.filter((contact) => {
            return contact.fullName.toString().toLowerCase()
                .includes(query.toString().toLowerCase());
        }));

        // setFilteredContacts((draft) => draft.filter((contact) =>
        //     contact.fullName.toString().toLowerCase().includes(query.toString().toLowerCase())
        // ))

    }, 1000);

    return (
            <ContactContext.Provider value={{
                removeContact,
                loading,
                setLoading,
                setContacts,
                filteredContacts,
                setFilteredContacts,
                contacts,
                groups,
                deleteContact: confirmDeleteModal,
                createContact: createContactForm,
                contactSearch
            }}>
                <div className="App">
                    <ToastContainer rtl={true} position='top-right' theme='colored'/>
                    <Navbar/>
                    <Routes>
                        <Route path='/' element={<Navigate to='/contacts'/>}/>
                        <Route path='/contacts' element={<Contacts/>}/>
                        <Route path='/contacts/add' element={<AddContact/>}/>
                        <Route path='/contacts/:contactId' element={<ViewContact/>}/>
                        <Route path='/contacts/edit/:contactId' element={<EditContact/>}/>
                    </Routes>
                </div>
            </ContactContext.Provider>
    );
}

export default App;
