# EmailJS Lead Capture Setup Guide

This guide will help you set up EmailJS to enable the lead capture form on your smart home website.

## Prerequisites

- A free EmailJS account
- An email service (Gmail, Outlook, Yahoo, etc.)
- Access to your website files

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

## Step 2: Add Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail recommended for ease)
4. Follow the setup instructions for your chosen provider:
   - **Gmail**: Use your Gmail credentials
   - **Outlook**: Use your Microsoft account
   - **Yahoo**: Use your Yahoo credentials
5. Give your service a name (e.g., "gmail")
6. Click "Create Service"

## Step 3: Create Email Template

1. Go to "Email Templates" in your EmailJS dashboard
2. Click "Create New Template"
3. Use this template content:

### Template Subject
```
New Lead: {{from_name}} - Smart Home Consultation
```

### Template Body
```html
<h2>New Lead from Chorvinsky Smart Homes Website</h2>

<p><strong>Contact Information:</strong></p>
<ul>
    <li><strong>Name:</strong> {{from_name}}</li>
    <li><strong>Email:</strong> {{from_email}}</li>
    <li><strong>Phone:</strong> {{phone}}</li>
    <li><strong>Submitted:</strong> {{timestamp}}</li>
</ul>

<p><strong>Project Details:</strong></p>
<p>{{message}}</p>

<hr>

<p><strong>Lead Source:</strong> {{lead_source}}</p>
<p><strong>Reply To:</strong> {{reply_to}}</p>

<p>---</p>
<p>This lead was automatically generated from your smart home website contact form.</p>
```

4. Save the template and note the Template ID 

## Step 4: Get Your API Keys

1. In your EmailJS dashboard, go to "Account" → "General"
2. Copy your **Public Key** (User ID)  
3. Go to "Email Services" and copy your **Service ID** 
4. Go to "Email Templates" and copy your **Template ID** 

## Step 5: Configure Your Website

1. Open `form-handler.js` in your website files
2. Replace the placeholder values with your actual keys:

```javascript
// Replace these with your actual EmailJS credentials
const EMAILJS_PUBLIC_KEY = 'your_public_key_here';
const EMAILJS_SERVICE_ID = 'your_service_id_here';
const EMAILJS_TEMPLATE_ID = 'your_template_id_here';
```

## Step 6: Test Your Setup

1. Upload your updated files to your web server
2. Visit your website
3. Fill out the contact form with test data
4. Submit the form
5. Check your email for the lead notification

## Troubleshooting

### Form Not Working
- Check browser console for JavaScript errors
- Verify all API keys are correct
- Ensure EmailJS service is properly configured

### Emails Not Sending
- Check your email service configuration in EmailJS
- Verify the email template is published
- Check spam folder for test emails

### Template Variables Not Working
- Ensure template variables match exactly (case-sensitive)
- Check that all required fields are being sent

## EmailJS Free Tier Limits

- **200 emails per month**
- **2 email services**
- **2 email templates**
- **1,000 contacts**

For higher limits, consider upgrading to a paid plan.

## Security Notes

- The public key is safe to use in frontend code
- Never expose your private keys or email service passwords
- EmailJS handles the secure transmission of emails

## Support

- EmailJS Documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- EmailJS Support: Available through their dashboard

---

**Need Help?** If you encounter any issues, check the browser console for error messages and verify all configuration steps were completed correctly.

