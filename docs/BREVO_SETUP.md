# Brevo Email Service Setup Guide

## Introduction

Brevo (formerly Sendinblue) is a comprehensive email marketing and transactional email service used in this project for sending automated emails. It offers:

- **Reliable delivery**: High deliverability rates with dedicated infrastructure
- **Template management**: Visual email template editor with dynamic content
- **Free tier**: 300 emails/day on the free plan
- **Analytics**: Track opens, clicks, and delivery status
- **API-first**: Easy integration with RESTful API

This guide will walk you through setting up Brevo for the convex-shipfast project.

---

## Step 1: Create a Brevo Account

1. Go to [https://www.brevo.com](https://www.brevo.com)
2. Click **Sign up free** in the top right corner
3. Fill in your details:
   - Email address
   - Password
   - Company name (can be your project name)
4. Verify your email address by clicking the link sent to your inbox
5. Complete the onboarding questionnaire (you can skip optional steps)

> **Note**: The free tier includes 300 emails per day, which is sufficient for development and small projects.

---

## Step 2: Get Your API Key

1. Log in to your Brevo dashboard
2. Click on your profile name in the top right corner
3. Select **SMTP & API** from the dropdown menu
4. Navigate to the **API Keys** tab
5. Click **Generate a new API key**
6. Give it a descriptive name (e.g., "convex-shipfast-production")
7. Copy the API key immediately (it won't be shown again)

### Add API Key to Environment Variables

Add the API key to your `.env.local` file:

```bash
BREVO_API_KEY=xkeysib-your-api-key-here
```

> **Warning**: Never commit your API key to version control. Keep it in `.env.local` which should be in your `.gitignore`.

---

## Step 3: Verify Your Sender Domain (Recommended)

For production use, verify your domain to improve deliverability:

1. Go to **Senders & IP** → **Domains**
2. Click **Add a domain**
3. Enter your domain name (e.g., `yourdomain.com`)
4. Add the provided DNS records to your domain:
   - SPF record (TXT)
   - DKIM record (TXT)
   - DMARC record (TXT)
5. Wait for DNS propagation (can take up to 48 hours)
6. Click **Verify** once DNS records are added

> **Info**: For development, you can use an unverified domain, but emails may be marked as spam.

---

## Step 4: Create Email Templates

### Creating a Template

1. Navigate to **Campaigns** → **Templates** in the left sidebar
2. Click **Create a new template**
3. Choose **Transactional template**
4. Select a design method:
   - **Drag & Drop Editor** (recommended for beginners)
   - **Rich Text Editor**
   - **HTML Editor** (for custom designs)

### Template Variables

Brevo uses double curly braces for variables: `{{variableName}}`

Common variables you'll use:
- `{{params.name}}` - User's name
- `{{params.email}}` - User's email
- `{{params.verificationUrl}}` - Verification link
- `{{params.resetUrl}}` - Password reset link
- `{{params.magicLink}}` - Magic link for authentication
- `{{params.inviteUrl}}` - Invitation link

---

## Step 5: Template Examples

### Email Verification Template

**Template Name**: `email-verification`

**Subject**: `Verify your email address`

**HTML Content**:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #2563eb; margin-bottom: 20px;">Verify Your Email</h1>
        
        <p>Hi {{params.name}},</p>
        
        <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{params.verificationUrl}}" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email
            </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="{{params.verificationUrl}}" style="color: #2563eb; word-break: break-all;">{{params.verificationUrl}}</a>
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
    </div>
</body>
</html>
```

---

### Password Reset Template

**Template Name**: `password-reset`

**Subject**: `Reset your password`

**HTML Content**:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="wi-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #dc2626; margin-bottom: 20px;">Reset Your Password</h1>
        
        <p>Hi {{params.name}},</p>
        
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{params.resetUrl}}" 
               style="background-color: #dc2626; color: white; padding:px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
            </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="{{params.resetUrl}}" style="color: #dc2626; word-break: break-all;">{{params.resetUrl}}</a>
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
        </p>
    </div>
</body>
</html>
```

---

### Magic Link Template

**Template Name**: `magic-link`

**Subject**: `Your sign-in link`

**HTML Content**:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #7c3aed; margin-bottom: 20px;">Sign In to Your Account</h1>
        
        <p>Hi {{params.name}},</p>
        
        <p>Click the button below to sign in to your account. This link will only work once:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{params.magicLink}}" 
               style="background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Sign In
            </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
            Or copy ande this link into your browser:<br>
            <a href="{{params.magicLink}}" style="color: #7c3aed; word-break: break-all;">{{params.magicLink}}</a>
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This link will expire in 15 minutes. If you didn't request this link, you can safely ignore this email.
        </p>
    </div>
</body>
</html>
```

---

### Welcome Email Template

**Template Name**: `welcome-email`

**Subject**: `Welcome to {{params.appName}}!`

**HTML Content**:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #059669; margin-bottom: 20px;">Welcome Aboard! 🎉</h1>
        
        <p>Hi {{params.name}},</p>
        
        <p>Welcome to {{params.appName}}! We're thrilled to have you on board.</p>
        
        <p>Here are some quick links to get you started:</p>
        
        <ul style="line-height: 2;">
            <li><a href="{{params.dashboardUrl}}" style="color: #2563eb;">Go to Dashboard</a></li>
            <li><a href="{{params.docsUrl}}" style="color: #2563eb;">Read Documentation</a></li>
            <li><a href="{{params.supportUrl}}" style="color: #2563eb;">Get Support</a></li>
        </ul>
        
        <div style="background-color: #e0f2fe; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #0369a1;">💡 Pro Tip:</p>
            <p style="margin:px 0 0 0;">Complete your profile to unlock all features and get the most out of your account.</p>
        </div>
        
        <p>If you have any questions, feel free to reach out to our support team.</p>
        
        <p style="margin-top: 30px;">
            Best regards,<br>
            The {{params.appName}} Team
        </p>
    </div>
</body>
</html>
```

---

### Invite Email Template

**Template Name**: `invite-email`

**Subject**: `{{params.inviterName}} invited you to join {{params.appName}}`

**HTML Content**:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #2563eb; margin-bottom: 20px;">You've Been Invited!</h1>
        
        <p>Hi there,</p>
        
        <p><strong>{{params.inviterName}}</strong> has invited you to join <strong>{{params.organizationName}}</strong> on {{params.appName}}.</p>
        
        <div style="background-color: #fff; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0;">
            <p style="margin: 0; color: #666; font-style: italic;">"{{params.inviteMessage}}"</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{params.inviteUrl}}" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Accept Invitation
            </a>
        </div>
        
        <p="color: #666; font-size: 14px;">
  Or copy and paste this link into your browser:<br>
            <a href="{{params.inviteUrl}}" style="color: #2563eb; word-break: break-all;">{{params.inviteUrl}}</a>
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This invitation will expire in 7 days. If you don't want to accept this invitation, you can safely ignore this email.
        </p>
    </div>
</body>
</html>
```

---

## Step 6: Get Template IDs

After creating each template:

1. Go to **Campaigns** → **Templates**
2. Click on the template you created
3. Look at the URL in your browser - it will contain the template ID
   - Example: `https://app.brevo.com/template/123456/edit`
   - The template ID is `123456`
4. Alternatively, click on the template settings (gear icon) to see the ID

### Map Template IDs to Environment Variables

Add these to your `.env.local` file:

```bash
# Brevo Template IDs
BREVO_TEMPLATE_EMAIL_VERIFICATION=123456
BREVO_TEMPLATE_PASSWORD_RESET=234567
BREVO_TEMPLATE_MAGIC_LINK=345678
BREVO_TEMPLATE_WELCOME_EMAIL=456789
BREVO_TEMPLATE_INVITE_EMAIL=567890
```

Replace the numbers with your actual template IDs from Brevo.

---

## Step 7: Testing Email Delivery

### Test in Development

Create a test script to verify your setup:

```typescript
// test-email.ts
import { sendEmail } from './convex/lib/brevo';

async function testEmail() {
  try {
    await sendEmail({
      to: 'your-email@example.com',
      templateId: parseInt(process.env.BREVO_TEMPLATE_EMAIL_VERIFICATION!),
      params: {
        name: 'Test User',
        verificationUrl: 'https://example.com/verify?token=test123'
      }
    });
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Failed to send test email:', }
}

testEmail();
```

Run the test:

```bash
npx tsx test-email.ts
```

### Check Email Logs

1. Go to **Statistics** → **Email** in Brevo dashboard
2. View recent email activity
3. Check delivery status, opens, and clicks
4. Click on individual emails to see detailed logs

### Test Different Scenarios

- ✅ Valid email address
- ✅ Template with all variables populated
- ✅ Template with missing optional variables
- ❌ Invalid email address (should fail gracefully)
- ❌ Missing required template variables (should show error)

---

## Step 8: Troubleshooting Common Issues

### Issue: "Invalid API Key"

**Solution**: 
- Verify the API key is correctly copied to `.env.local`
- Ensure there are no extra spaces or quotes
- Check that the key starts with `xkeysib-`
- Regenerate the API key if necessary

### Issue: "Template not found"

**Solution**:
- Verify the template ID is correct
- Ensure the template is published (not in draft mode)
- Check that you're using the correct Brevo account

### Issue: Emails going to spam

**Solution**:
- Verify your sender domain (see Step 3)
- Add SPF, DKIM, and DMARC records
- Use a professional "from" email address
- Avoid spam trigger words in subject lines
- Include an unsubscribe link (required for marketing emails)

### Issue: "Daily sending limit exceeded"

**Solution**:
- Free tier: 300 emails/day
- Upgrade to a paid plan for higher limits
- Implement email queuing for high-volume scenarios
- Monitor your usage in the Brevo dashboard

### Issue: Template variables not rendering

**Solution**:
- Check variable syntax: `{{params.variableName}}`
- Ensure all required variables are passed in the API call
- Test with the Brevo template preview feature
- Verify variable names match exactly (case-sens

### Issue: Slow email delivery

**Solution**:
- Check Brevo status page: [https://status.brevo.com](https://status.brevo.com)
- Verify your account is in good standing
- Consider using webhooks for delivery notifications
- Implement retry logic for failed sends

---

## Step 9: Production Considerations

### Security Best Practices

1. **API Key Management**
   - Use environment variables (never hardcode)
   - Rotate API keys periodically
   - Use different keys for development and production
   - Restrict API key permissions if possible

2. **Rate Limiting**
   - Implement rate limiting in your application
   - Monitor daily sending limits
   - Queue emails during high-traffic periods
   - Set up alerts for quota warnings

3. **Error Handling**
   - Log all email failures
   - Implement retry logic with exponential backoff
   - Alert on repeated failures
   - Provide fallback mechanisms

### Monitoring and Analytics

1. **Set up webhooks** for real-time delivery notifications:
   - Go to **Settings** → **Webhooks**
   - Add your webhook URL
   - Select events: delivered, opened, clicked, bounced, spam

2. **Track key metrics**:
   - Delivery rate (should be >95%)
   - Open rate (industry average: 15-25%)
   - Clicstry average: 2-5%)
   - Bounce rate (should be <5%)
   - Spam complaints (should be <0.1%)

3. **Set up alerts**:
   - High bounce rate
   - Spam complaints
   - API errors
   - Quota warnings

### Scaling Considerations

1. **Email Queue**: Implement a queue system for high-volume sending
2. **Batch Processing**: Use Brevo's batch API for multiple recipients
3. **Caching**: Cache template IDs and configurations
4. **Failover**: Have a backup email service provider
5. **Load Testing**: Test your email system under expected load

### Compliance

1. **GDPR Compliance**:
   - Include unsubscribe links
   - Honor opt-out requests immediately
   - Store consent records
   - Provide data export/deletion options

2. **CAN-SPAM Act**:
   - Include physical address
   - Clear identification as advertisement (if applicable)
   - Honor opt-out requests within 10 days
   - Don't use deceptive subject lines

3. **Data Privacy**:
   - Don't send sensitive data in emails
   - Use secure links (HTTPS)
   - Implement link expiration
   - Log access to sensitive operations

---

## Additional Resources

- [Brevo API Documentation](https://developers.brevo.com/)
- [Brevo Template Language](https://help.brevo.com/hc/en-us/articles/360000268730)
- [Email Deliverability Best Practices](https://www.brevo.com/blog/email-deliverability/)
- [Brevo Status Page](https://status.brevo.com/)
- [Brevo Support](https://help.brevo.com/)

---

## Quick Reference

### Environment Variables Checklist

```bash
# Required
BREVO_API_KEY=xkeysib-your-api-key-here

# Template IDs
BREVO_TEMPLATE_EMAIL_VERIFICATION=123456
BREVO_TEMPLATE_PASSWORD_RESET=234567
BREVO_TEMPLATE_MAGIC_LINK=345678
BREVO_TEMPLATE_WELCOME_EMAIL=456789
BREVO_TEMPLATE_INVITE_EMAIL=567890

# Optional
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=Your App Name
```

### Common API Endpoints

- Send transactional email: `POST /v3/smtp/email`
- Get template: `GET /v3/smtp/templates/{templateId}`
- Get email events: `GET /v3/smtp/statistics/events`

### Support

If you encounter issues not covered in this guide:
1. Check the [Brevo Help Center](https://help.brevo.com/)
2. Contact Brevo support via live chat
3. Review the project's GitHub issues
4. Reach out to the development team

---

**Last Updated**: February 2026
