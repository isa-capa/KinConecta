package org.generation.socialNetwork.faq.service;

import org.generation.socialNetwork.faq.model.FaqItem;
import org.generation.socialNetwork.faq.repository.FaqItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FaqItemService {

    @Autowired
    private FaqItemRepository faqItemRepository;

    public List<FaqItem> getAllFaqItems() {
        return faqItemRepository.findAll();
    }

    public Optional<FaqItem> getFaqItemById(Long id) {
        return faqItemRepository.findById(id);
    }

    public FaqItem createFaqItem(FaqItem faqItem) {
        return faqItemRepository.save(faqItem);
    }

    public FaqItem updateFaqItem(Long id, FaqItem faqItemDetails) {
        Optional<FaqItem> optionalFaqItem = faqItemRepository.findById(id);
        if (optionalFaqItem.isPresent()) {
            FaqItem faqItem = optionalFaqItem.get();
            faqItem.setQuestion(faqItemDetails.getQuestion());
            faqItem.setAnswer(faqItemDetails.getAnswer());
            faqItem.setIsActive(faqItemDetails.getIsActive());
            faqItem.setSortOrder(faqItemDetails.getSortOrder());
            return faqItemRepository.save(faqItem);
        }
        return null;
    }

    public void deleteFaqItem(Long id) {
        faqItemRepository.deleteById(id);
    }
}