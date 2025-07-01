// Form Handler for OpenRockets Form
// Manages form validation, submission, and user feedback

import { submitFormData, validateConnection } from './firebase-config.js';
import { sendEmailNotification } from './emailjs-config.js';

class FormHandler {
    constructor() {
        this.form = document.getElementById('openrockets-form');
        this.submitBtn = document.getElementById('submit-btn');
        this.successOverlay = document.getElementById('success-overlay');
        this.submitAnotherBtn = document.getElementById('submit-another');
        
        this.isSubmitting = false;
        this.validationRules = this.setupValidationRules();
        
        this.init();
    }

    init() {
        if (!this.form) {
            console.error('Form not found');
            return;
        }

        this.setupEventListeners();
        this.validateFirebaseConnection();
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time validation
        this.form.addEventListener('input', (e) => {
            this.validateField(e.target);
        });

        this.form.addEventListener('blur', (e) => {
            this.validateField(e.target);
        }, true);

        // Success modal actions
        if (this.submitAnotherBtn) {
            this.submitAnotherBtn.addEventListener('click', () => {
                this.resetForm();
                this.hideSuccessMessage();
            });
        }

        // Close success modal when clicking outside
        this.successOverlay.addEventListener('click', (e) => {
            if (e.target === this.successOverlay) {
                this.hideSuccessMessage();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.successOverlay.classList.contains('show')) {
                this.hideSuccessMessage();
            }
        });
    }

    setupValidationRules() {
        return {
            name: {
                required: true,
                minLength: 2,
                maxLength: 100,
                pattern: /^[a-zA-Z\s\-\.\']+$/,
                errorMessage: 'Please enter a valid name (letters, spaces, hyphens, dots, and apostrophes only)'
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                errorMessage: 'Please enter a valid email address'
            },
            githubUrl: {
                required: true,
                pattern: /^https:\/\/github\.com\/[a-zA-Z0-9\-_]+\/?$/,
                errorMessage: 'Please enter a valid GitHub profile URL (https://github.com/username)'
            },
            reason: {
                required: true,
                minLength: 50,
                maxLength: 1000,
                errorMessage: 'Please provide a detailed reason (at least 50 characters)'
            }
        };
    }

    async validateFirebaseConnection() {
        try {
            const isConnected = await validateConnection();
            if (!isConnected) {
                console.warn('Firebase connection validation failed');
            }
        } catch (error) {
            console.error('Firebase connection check failed:', error);
        }
    }

    validateField(field) {
        if (!field.name || !this.validationRules[field.name]) {
            return true;
        }

        const rule = this.validationRules[field.name];
        const value = field.value.trim();
        const errorElement = document.getElementById(`${field.name}-error`);

        // Clear previous error state
        field.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }

        // Check if field is required and empty
        if (rule.required && !value) {
            if (field.hasAttribute('data-touched')) {
                this.showFieldError(field, errorElement, 'This field is required');
                return false;
            }
            return true; // Don't show error until field is touched
        }

        // Mark field as touched
        field.setAttribute('data-touched', 'true');

        // Validate minimum length
        if (rule.minLength && value.length < rule.minLength) {
            this.showFieldError(field, errorElement, `Minimum ${rule.minLength} characters required`);
            return false;
        }

        // Validate maximum length
        if (rule.maxLength && value.length > rule.maxLength) {
            this.showFieldError(field, errorElement, `Maximum ${rule.maxLength} characters allowed`);
            return false;
        }

        // Validate pattern
        if (rule.pattern && !rule.pattern.test(value)) {
            this.showFieldError(field, errorElement, rule.errorMessage);
            return false;
        }

        return true;
    }

    showFieldError(field, errorElement, message) {
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    validateForm() {
        let isValid = true;
        const formData = new FormData(this.form);

        // Validate regular form fields
        for (const [name, value] of formData.entries()) {
            const field = this.form.querySelector(`[name="${name}"]`);
            if (field) {
                field.setAttribute('data-touched', 'true');
                if (!this.validateField(field)) {
                    isValid = false;
                }
            }
        }

        // Validate skills (tag input)
        if (window.tagInputInstance) {
            if (!window.tagInputInstance.validateForSubmission()) {
                isValid = false;
            }
        } else {
            console.error('Tag input instance not found');
            isValid = false;
        }

        return isValid;
    }

    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};

        // Collect regular form fields
        for (const [name, value] of formData.entries()) {
            data[name] = value.trim();
        }

        // Add skills array from tag input
        if (window.tagInputInstance) {
            data.skills = window.tagInputInstance.getTagsArray();
        } else {
            data.skills = [];
        }

        return data;
    }

    async handleSubmit() {
        if (this.isSubmitting) return;

        // Validate form
        if (!this.validateForm()) {
            this.scrollToFirstError();
            return;
        }

        this.isSubmitting = true;
        this.setLoadingState(true);

        try {
            // Collect form data
            const formData = this.collectFormData();

            // Submit to Firebase first
            const firebaseResult = await submitFormData(formData);

            if (firebaseResult.success) {
                console.log('Form submitted to Firebase successfully with ID:', firebaseResult.id);
                
                // Send email notification (don't fail if email fails)
                try {
                    const emailResult = await sendEmailNotification(formData);
                    if (emailResult.success) {
                        console.log('Email notification sent successfully');
                    } else {
                        console.warn('Email notification failed:', emailResult.error);
                        // Continue with success flow even if email fails
                    }
                } catch (emailError) {
                    console.warn('Email notification error:', emailError);
                    // Continue with success flow even if email fails
                }

                // Show success message regardless of email status
                this.showSuccessMessage();
                this.resetForm();
            } else {
                throw new Error('Firebase submission failed');
            }

        } catch (error) {
            console.error('Form submission error:', error);
            this.showSubmissionError(error.message || 'An error occurred while submitting the form. Please try again.');
        } finally {
            this.isSubmitting = false;
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        if (loading) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('loading');
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('loading');
        }
    }

    showSubmissionError(message) {
        // Create or update error message element
        let errorElement = document.getElementById('form-submission-error');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'form-submission-error';
            errorElement.className = 'submission-error';
            errorElement.style.cssText = `
                background-color: #fff;
                border: 2px solid #000;
                border-radius: 8px;
                padding: 16px;
                margin-top: 16px;
                font-size: 14px;
                font-weight: 500;
                color: #000;
            `;
            this.form.appendChild(errorElement);
        }

        errorElement.textContent = message;
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorElement && errorElement.parentNode) {
                errorElement.remove();
            }
        }, 5000);
    }

    scrollToFirstError() {
        const firstError = this.form.querySelector('.error, .error-message.show');
        if (firstError) {
            firstError.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }

    showSuccessMessage() {
        this.successOverlay.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    hideSuccessMessage() {
        this.successOverlay.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    }

    resetForm() {
        // Reset form fields
        this.form.reset();

        // Clear all error states
        const errorElements = this.form.querySelectorAll('.error');
        errorElements.forEach(element => {
            element.classList.remove('error');
            element.removeAttribute('data-touched');
        });

        const errorMessages = this.form.querySelectorAll('.error-message.show');
        errorMessages.forEach(element => {
            element.classList.remove('show');
            element.textContent = '';
        });

        // Clear tag input
        if (window.tagInputInstance) {
            window.tagInputInstance.clear();
        }

        // Remove any submission error messages
        const submissionError = document.getElementById('form-submission-error');
        if (submissionError) {
            submissionError.remove();
        }

        // Focus on first field
        const firstField = this.form.querySelector('input');
        if (firstField) {
            firstField.focus();
        }
    }
}

// Initialize form handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FormHandler();
});

// Export for potential external use
export { FormHandler };
