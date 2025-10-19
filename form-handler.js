// EmailJS Configuration
// Replace 'YOUR_PUBLIC_KEY' with your actual EmailJS public key
const EMAILJS_PUBLIC_KEY = '-LKHbi7c8PgshEsXX';
const EMAILJS_SERVICE_ID = 'service_3vh3dlj';
const EMAILJS_TEMPLATE_ID = 'template_o9tnova';

// Initialize EmailJS when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
    
    // Set up form submission handler
    const form = document.getElementById('leadForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }
});

// Form validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Check if it's 10 digits (US phone number)
    return cleaned.length === 10;
}

function formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
}

function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const errorDiv = field.parentNode.querySelector('.error-message');
    
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
    
    field.classList.add('border-red-400');
}

function clearFieldError(fieldName) {
    const field = document.getElementById(fieldName);
    const errorDiv = field.parentNode.querySelector('.error-message');
    
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
    
    field.classList.remove('border-red-400');
}

function clearAllErrors() {
    const fields = ['name', 'email', 'phone'];
    fields.forEach(fieldName => clearFieldError(fieldName));
}

function validateForm(formData) {
    let isValid = true;
    
    // Clear previous errors
    clearAllErrors();
    
    // Validate name
    if (!formData.name.trim()) {
        showFieldError('name', 'Name is required');
        isValid = false;
    }
    
    // Validate email
    if (!formData.email.trim()) {
        showFieldError('email', 'Email is required');
        isValid = false;
    } else if (!validateEmail(formData.email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate phone
    if (!formData.phone.trim()) {
        showFieldError('phone', 'Phone number is required');
        isValid = false;
    } else if (!validatePhone(formData.phone)) {
        showFieldError('phone', 'Please enter a valid 10-digit phone number');
        isValid = false;
    }
    
    return isValid;
}

function showLoadingState() {
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const loadingText = document.getElementById('loadingText');
    
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    loadingText.classList.remove('hidden');
}

function hideLoadingState() {
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const loadingText = document.getElementById('loadingText');
    
    submitBtn.disabled = false;
    submitText.classList.remove('hidden');
    loadingText.classList.add('hidden');
}

function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.classList.add('hidden');
    successMessage.classList.remove('hidden');
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showErrorMessage(message) {
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    successMessage.classList.add('hidden');
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    
    // Scroll to error message
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetForm() {
    const form = document.getElementById('leadForm');
    form.reset();
    clearAllErrors();
    
    // Hide all messages
    document.getElementById('successMessage').classList.add('hidden');
    document.getElementById('errorMessage').classList.add('hidden');
}

// Main form submission handler
async function handleFormSubmission(event) {
    event.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        message: document.getElementById('message').value.trim()
    };
    
    // Validate form
    if (!validateForm(formData)) {
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    try {
        // Check if EmailJS is loaded
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS is not loaded. Please check your configuration.');
        }
        
        // Prepare template parameters
        const templateParams = {
            from_name: formData.name,
            from_email: formData.email,
            phone: formatPhone(formData.phone),
            message: formData.message || 'No additional details provided',
            to_name: 'Chorvinsky Smart Home',
            reply_to: formData.email,
            // Additional context for the email
            subject: `New Lead: ${formData.name} - Smart Home Consultation`,
            lead_source: 'Website Contact Form',
            timestamp: new Date().toLocaleString('en-US', {
                timeZone: 'America/New_York',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        // Send email using EmailJS
        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );
        
        console.log('Email sent successfully:', response);
        
        // Show success message
        showSuccessMessage();
        
        // Reset form after 3 seconds
        setTimeout(() => {
            resetForm();
        }, 3000);
        
    } catch (error) {
        console.error('Error sending email:', error);
        
        // Show user-friendly error message
        let errorMessage = 'Failed to send your message. Please try again.';
        
        if (error.text) {
            errorMessage = `Error: ${error.text}`;
        } else if (error.message) {
            errorMessage = `Error: ${error.message}`;
        }
        
        showErrorMessage(errorMessage);
    } finally {
        // Hide loading state
        hideLoadingState();
    }
}

// Auto-format phone number as user types
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 6) {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            } else if (value.length >= 3) {
                value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            }
            e.target.value = value;
        });
    }
});

