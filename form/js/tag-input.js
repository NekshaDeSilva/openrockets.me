class TagInput {
    constructor(container, input, display) {
        this.container = container;
        this.input = input;
        this.display = display;
        this.tags = new Set(); // Use Set to prevent duplicates
        this.maxTags = 10;
        this.minTags = 1;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSuggestions();
    }

    setupEventListeners() {
        // Handle Enter key and comma separation
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                this.addTag();
            } else if (e.key === 'Backspace' && this.input.value === '') {
                // Remove last tag when backspace is pressed on empty input
                this.removeLastTag();
            }
        });

        // Handle input blur (when user clicks away)
        this.input.addEventListener('blur', () => {
            if (this.input.value.trim()) {
                this.addTag();
            }
        });

        // Handle paste events
        this.input.addEventListener('paste', (e) => {
            setTimeout(() => {
                const value = this.input.value;
                if (value.includes(',')) {
                    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    this.input.value = '';
                    tags.forEach(tag => this.addTag(tag));
                }
            }, 0);
        });

        // Prevent form submission when Enter is pressed in tag input
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }

    setupSuggestions() {
        const suggestionButtons = document.querySelectorAll('.skill-suggestion');
        suggestionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const skill = button.dataset.skill;
                this.addTag(skill);
                this.input.focus();
            });
        });
    }

    addTag(tagText = null) {
        const text = (tagText || this.input.value).trim();
        
        if (!text) return;

        // Validate tag
        if (!this.isValidTag(text)) {
            this.showError('Invalid skill name. Please use only letters, numbers, and common characters.');
            return;
        }

        if (this.tags.has(text.toLowerCase())) {
            this.showError('This skill has already been added.');
            this.input.value = '';
            return;
        }

        if (this.tags.size >= this.maxTags) {
            this.showError(`Maximum ${this.maxTags} skills allowed.`);
            return;
        }

        // Add tag to set
        this.tags.add(text.toLowerCase());
        
        // Create tag element
        this.createTagElement(text);
        
        // Clear input
        this.input.value = '';
        
        // Clear any error messages
        this.clearError();
        
        // Update form validation
        this.updateValidation();
    }

    createTagElement(text) {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.dataset.value = text.toLowerCase();
        
        const tagText = document.createElement('span');
        tagText.textContent = text;
        
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'tag-remove';
        removeButton.innerHTML = '×';
        removeButton.setAttribute('aria-label', `Remove ${text}`);
        
        removeButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.removeTag(text.toLowerCase());
        });
        
        tag.appendChild(tagText);
        tag.appendChild(removeButton);
        
        this.display.appendChild(tag);
    }

    removeTag(tagValue) {
        this.tags.delete(tagValue);
        
        const tagElement = this.display.querySelector(`[data-value="${tagValue}"]`);
        if (tagElement) {
            tagElement.remove();
        }
        
        this.updateValidation();
        this.input.focus();
    }

    removeLastTag() {
        const lastTag = this.display.lastElementChild;
        if (lastTag && lastTag.classList.contains('tag')) {
            const tagValue = lastTag.dataset.value;
            this.removeTag(tagValue);
        }
    }

    isValidTag(text) {
        // Allow letters, numbers, spaces, dots, hyphens, plus signs, and hash symbols
        const validPattern = /^[a-zA-Z0-9\s\.\-\+\#]{1,30}$/;
        return validPattern.test(text) && text.length >= 1;
    }

    showError(message) {
        const errorElement = document.getElementById('skills-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            this.container.classList.add('error');
        }
    }

    clearError() {
        const errorElement = document.getElementById('skills-error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
            this.container.classList.remove('error');
        }
    }

    updateValidation() {
        if (this.tags.size >= this.minTags) {
            this.clearError();
        } else {
            // Don't show error until user tries to submit
            this.container.classList.remove('error');
        }
    }

    getTagsArray() {
        return Array.from(this.tags);
    }

    isValid() {
        return this.tags.size >= this.minTags;
    }

    clear() {
        this.tags.clear();
        this.display.innerHTML = '';
        this.input.value = '';
        this.clearError();
    }

    // Public method to validate for form submission
    validateForSubmission() {
        if (!this.isValid()) {
            this.showError(`Please add at least ${this.minTags} skill.`);
            return false;
        }
        return true;
    }

    // Public method to set initial tags (for editing)
    setTags(tagsArray) {
        this.clear();
        if (Array.isArray(tagsArray)) {
            tagsArray.forEach(tag => {
                if (typeof tag === 'string' && tag.trim()) {
                    this.addTag(tag.trim());
                }
            });
        }
    }
}

// Initialize tag input when DOM is loaded
export function initializeTagInput() {
    const container = document.querySelector('.tag-input-container');
    const input = document.getElementById('skills-input');
    const display = document.getElementById('tags-display');
    
    if (container && input && display) {
        const tagInput = new TagInput(container, input, display);
        
        // Make it globally accessible for form validation
        window.tagInputInstance = tagInput;
        
        return tagInput;
    } else {
        console.error('Tag input elements not found');
        return null;
    }
}

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    initializeTagInput();
});

export { TagInput };
