// EmailJS Configuration
const EMAILJS_PUBLIC_KEY = '-LKHbi7c8PgshEsXX';
const EMAILJS_SERVICE_ID = 'service_3vh3dlj';
const EMAILJS_TEMPLATE_ID = 'template_o9tnova';

let isEmailJSInitialized = false;

// Initialize EmailJS immediately
function initEmailJS() {
    if (typeof emailjs !== 'undefined' && !isEmailJSInitialized) {
        emailjs.init(EMAILJS_PUBLIC_KEY);
        isEmailJSInitialized = true;
        console.log('✅ EmailJS initialized successfully');
    } else if (typeof emailjs === 'undefined') {
        console.error('❌ EmailJS library not found');
    }
}

// Attach form handler with multiple attempts
function attachFormHandler() {
    const form = document.getElementById('leadForm');

    if (!form) {
        console.log('⏳ Form not found yet, will retry...');
        return false;
    }

    // Remove any existing listeners to prevent duplicates
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    // Attach the submit handler
    newForm.addEventListener('submit', handleFormSubmission);
    console.log('✅ Form handler attached successfully');

    // Set up phone formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneInput);
    }

    return true;
}

// Try to initialize multiple times until it works
function tryInitialize() {
    initEmailJS();

    if (attachFormHandler()) {
        console.log('✅ Everything initialized successfully!');
    } else {
        setTimeout(tryInitialize, 100);
    }
}

// Start trying as soon as possible
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInitialize);
} else {
    tryInitialize();
}

// Also try when components are loaded
document.addEventListener('componentsLoaded', function() {
    console.log('📦 Components loaded event received');
    tryInitialize();
});

// Phone formatting function
function formatPhoneInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 6) {
        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    } else if (value.length >= 3) {
        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    }
    e.target.value = value;
}

// Form validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
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
    if (!field) return;

    const errorDiv = field.parentNode.querySelector('.error-message');

    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    field.classList.add('border-red-400');
}

function clearFieldError(fieldName) {
    const field = document.getElementById(fieldName);
    if (!field) return;

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

    clearAllErrors();

    if (!formData.name.trim()) {
        showFieldError('name', 'Name is required');
        isValid = false;
    }

    if (!formData.email.trim()) {
        showFieldError('email', 'Email is required');
        isValid = false;
    } else if (!validateEmail(formData.email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }

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

    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.classList.add('hidden');
    if (loadingText) loadingText.classList.remove('hidden');
}

function hideLoadingState() {
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const loadingText = document.getElementById('loadingText');

    if (submitBtn) submitBtn.disabled = false;
    if (submitText) submitText.classList.remove('hidden');
    if (loadingText) loadingText.classList.add('hidden');
}

function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    if (errorMessage) errorMessage.classList.add('hidden');
    if (successMessage) {
        successMessage.classList.remove('hidden');
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function showErrorMessage(message) {
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    if (successMessage) successMessage.classList.add('hidden');
    if (errorText) errorText.textContent = message;
    if (errorMessage) {
        errorMessage.classList.remove('hidden');
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function resetForm() {
    const form = document.getElementById('leadForm');
    if (form) form.reset();
    clearAllErrors();

    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    if (successMessage) successMessage.classList.add('hidden');
    if (errorMessage) errorMessage.classList.add('hidden');
}

// Main form submission handler
async function handleFormSubmission(event) {
    // CRITICAL: Prevent default form submission
    event.preventDefault();
    event.stopPropagation();

    console.log('🚀 Form submission started');

    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        message: document.getElementById('message').value.trim()
    };

    console.log('📝 Form data collected:', formData);

    if (!validateForm(formData)) {
        console.log('❌ Form validation failed');
        return false;
    }

    console.log('✅ Form validation passed');

    showLoadingState();

    try {
        if (!isEmailJSInitialized || typeof emailjs === 'undefined') {
            throw new Error('EmailJS is not initialized. Please refresh the page and try again.');
        }

        const templateParams = {
            from_name: formData.name,
            from_email: formData.email,
            phone: formatPhone(formData.phone),
            message: formData.message || 'No additional details provided',
            to_name: 'Chorvinsky Smart Home',
            reply_to: formData.email,
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

        console.log('📧 Sending email via EmailJS...');

        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );

        console.log('✅ Email sent successfully:', response);

        showSuccessMessage();

        setTimeout(() => {
            resetForm();
        }, 3000);

    } catch (error) {
        console.error('❌ Error sending email:', error);

        let errorMessage = 'Failed to send your message. Please try again.';

        if (error.text) {
            errorMessage = `Error: ${error.text}`;
            console.error('Error details:', error.text);
        } else if (error.message) {
            errorMessage = `Error: ${error.message}`;
            console.error('Error details:', error.message);
        }

        showErrorMessage(errorMessage);
    } finally {
        hideLoadingState();
    }

    return false;
}
