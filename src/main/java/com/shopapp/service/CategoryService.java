package com.shopapp.service;

import com.shopapp.dto.CategoryRequest;
import com.shopapp.dto.CategoryResponse;
import com.shopapp.exception.ResourceNotFoundException;
import com.shopapp.model.Category;
import com.shopapp.repository.CategoryRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::from)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Long id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return CategoryResponse.from(cat);
    }

    public CategoryResponse createCategory(CategoryRequest req) {
        if (categoryRepository.existsByName(req.getName())) {
            throw new RuntimeException("Category with this name already exists");
        }

        Category cat = new Category();
        cat.setName(req.getName());
        cat.setDescription(req.getDescription());
        return CategoryResponse.from(categoryRepository.save(cat));
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest req) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        cat.setName(req.getName());
        cat.setDescription(req.getDescription());
        return CategoryResponse.from(categoryRepository.save(cat));
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
