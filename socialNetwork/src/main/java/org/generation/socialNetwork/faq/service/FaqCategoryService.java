package org.generation.socialNetwork.faq.service;

import org.generation.socialNetwork.faq.model.FaqCategory;
import org.generation.socialNetwork.faq.repository.FaqCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FaqCategoryService {

    @Autowired
    private FaqCategoryRepository faqCategoryRepository;

    public List<FaqCategory> getAllFaqCategories() {
        return faqCategoryRepository.findAll();
    }

    public Optional<FaqCategory> getFaqCategoryById(Integer id) {
        return faqCategoryRepository.findById(id);
    }

    public FaqCategory createFaqCategory(FaqCategory faqCategory) {
        return faqCategoryRepository.save(faqCategory);
    }

    public FaqCategory updateFaqCategory(Integer id, FaqCategory faqCategoryDetails) {
        Optional<FaqCategory> optionalFaqCategory = faqCategoryRepository.findById(id);
        if (optionalFaqCategory.isPresent()) {
            FaqCategory faqCategory = optionalFaqCategory.get();
            faqCategory.setName(faqCategoryDetails.getName());
            faqCategory.setRoleScope(faqCategoryDetails.getRoleScope());
            faqCategory.setSortOrder(faqCategoryDetails.getSortOrder());
            return faqCategoryRepository.save(faqCategory);
        }
        return null;
    }

    public void deleteFaqCategory(Integer id) {
        faqCategoryRepository.deleteById(id);
    }
}