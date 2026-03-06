package org.generation.socialNetwork.contact.controller;

import org.generation.socialNetwork.contact.model.ContactMessage;
import org.generation.socialNetwork.contact.service.ContactMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact-messages")
public class ContactMessageController {

    @Autowired
    private ContactMessageService contactMessageService;

    @GetMapping
    public List<ContactMessage> getAllContactMessages() {
        return contactMessageService.getAllContactMessages();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactMessage> getContactMessageById(@PathVariable Long id) {
        return contactMessageService.getContactMessageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ContactMessage createContactMessage(@RequestBody ContactMessage contactMessage) {
        return contactMessageService.createContactMessage(contactMessage);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactMessage> updateContactMessage(@PathVariable Long id, @RequestBody ContactMessage contactMessageDetails) {
        ContactMessage updatedContactMessage = contactMessageService.updateContactMessage(id, contactMessageDetails);
        if (updatedContactMessage != null) {
            return ResponseEntity.ok(updatedContactMessage);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContactMessage(@PathVariable Long id) {
        contactMessageService.deleteContactMessage(id);
        return ResponseEntity.noContent().build();
    }
}