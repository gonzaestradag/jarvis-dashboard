import { useState, useEffect } from 'react';

const INITIAL_CONTACTS = [
  { id: 1, name: 'Papá', email: 'papa@example.com', group: 'FAMILIA' },
  { id: 2, name: 'Mamá', email: 'mama@example.com', group: 'FAMILIA' },
  { id: 3, name: 'Hermano', email: 'hermano@example.com', group: 'FAMILIA' },
  { id: 4, name: 'Profesores', email: 'profesor@udem.edu.mx', group: 'UDEM/ESCUELA' },
];

const STORAGE_KEY = 'jarvis_contacts';

export function useContacts() {
  const [contacts, setContacts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
    } catch (error) {
      console.error('Error loading contacts from localStorage:', error);
      return INITIAL_CONTACTS;
    }
  });

  // Guardar en localStorage cada vez que cambien los contactos
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }, [contacts]);

  const addContact = (name: string, email: string, group: string) => {
    const newContact = {
      id: Math.max(...contacts.map(c => c.id), 0) + 1,
      name,
      email,
      group,
    };
    setContacts([...contacts, newContact]);
    return newContact;
  };

  const updateContact = (id: number, name: string, email: string) => {
    setContacts(contacts.map(c =>
      c.id === id ? { ...c, name, email } : c
    ));
  };

  const deleteContact = (id: number) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  return { contacts, addContact, updateContact, deleteContact };
}
