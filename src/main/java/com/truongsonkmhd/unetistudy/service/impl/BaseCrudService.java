package com.truongsonkmhd.unetistudy.service.impl;

import com.truongsonkmhd.unetistudy.exception.custom_exception.ResourceNotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Abstract base class for services providing common CRUD operations.
 * 
 * @param <T>  Entity type
 * @param <ID> ID type
 * @param <R>  Repository type
 * @author Clean Code Refactoring - Phase 3
 */
public abstract class BaseCrudService<T, ID, R extends JpaRepository<T, ID>> {

    protected final R repository;
    protected final String entityName;

    protected BaseCrudService(R repository, String entityName) {
        this.repository = repository;
        this.entityName = entityName;
    }

    @Transactional(readOnly = true)
    public T findByIdOrThrow(ID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("%s not found with ID: %s", entityName, id)));
    }

    @Transactional(readOnly = true)
    public List<T> findAll() {
        return repository.findAll();
    }

    @Transactional
    public T save(T entity) {
        return repository.save(entity);
    }

    @Transactional
    public void deleteById(ID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException(
                    String.format("%s not found with ID: %s", entityName, id));
        }
        repository.deleteById(id);
    }
}
