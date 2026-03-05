package org.generation.socialNetwork.contact.service;

import org.generation.socialNetwork.contact.model.ContactMessage;
import org.generation.socialNetwork.contact.repository.ContactMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ContactMessageService {

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    public List<ContactMessage> getAllContactMessages() {
        return contactMessageRepository.findAll();
    }

    public Optional<ContactMessage> getContactMessageById(Long id) {
        return contactMessageRepository.findById(id);
    }

    public ContactMessage createContactMessage(ContactMessage contactMessage) {
        return contactMessageRepository.save(contactMessage);
    }

    public ContactMessage updateContactMessage(Long id, ContactMessage contactMessageDetails) {
        Optional<ContactMessage> optionalContactMessage = contactMessageRepository.findById(id);
        if (optionalContactMessage.isPresent()) {
            ContactMessage contactMessage = optionalContactMessage.get();
            contactMessage.setName(contactMessageDetails.getName());
            contactMessage.setEmail(contactMessageDetails.getEmail());
            contactMessage.setSubject(contactMessageDetails.getSubject());
            contactMessage.setMessage(contactMessageDetails.getMessage());
            contactMessage.setSourcePage(contactMessageDetails.getSourcePage());
            contactMessage.setStatus(contactMessageDetails.getStatus());
            return contactMessageRepository.save(contactMessage);
        }
        return null;
    }

    public void deleteContactMessage(Long id) {
        contactMessageRepository.deleteById(id);
    }
}