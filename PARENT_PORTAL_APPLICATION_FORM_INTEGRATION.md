# Parent Portal - Application Form Integration Guide

## Overview

This guide explains how to integrate the application form into the parent portal, allowing parents to:
1. Fill out admission application forms directly from their portal
2. Submit applications linked to their enquiry tracking ID
3. Generate and complete payment links for admission fees
4. Track their application status

---

## Table of Contents

1. [Application Submission API](#application-submission-api)
2. [Enquiry-Based Application Flow](#enquiry-based-application-flow)
3. [Payment Link Generation](#payment-link-generation)
4. [Application Stages & Status Tracking](#application-stages--status-tracking)
5. [Complete Integration Example](#complete-integration-example)
6. [Error Handling](#error-handling)

---

## Application Submission API

### Endpoint
```
POST /admin-core-service/v1/applicant/apply
```

### Authentication
Parents must be authenticated. Include the JWT token in the Authorization header:
```
Authorization: Bearer <parent_jwt_token>
```

### Request Payload

#### Basic Structure
```json
{
  "enquiry_id": "uuid-of-enquiry",
  "institute_id": "institute-uuid",
  "session_id": "session-uuid",
  "source": "LEVEL",
  "source_id": "class_5",
  "form_data": {
    // Form fields
  },
  "custom_field_values": {
    // Custom fields (if any)
  }
}
```

#### Complete Example with All Available Fields

```json
{
  "enquiry_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "institute_id": "df6faecd-0437-4700-8373-6c642c862c37",
  "session_id": "11111111-2222-3333-4444-555555555555",
  "source": "LEVEL",
  "source_id": "class_5",
  "destination_package_session_id": "destination-session-uuid",
  "form_data": {
    // Parent Information (Required)
    "parent_name": "John Doe",
    "parent_phone": "9999988888",
    "parent_email": "parent@example.com",
    
    // Child Information (Required)
    "child_name": "Jane Doe",
    "child_dob": "2015-08-15",
    "child_gender": "FEMALE",
    
    // Address Information (Required)
    "address_line": "42 Galaxy Apartment, MG Road",
    "city": "Mumbai",
    "pin_code": "400001",
    
    // Additional Parent Information (Optional)
    "father_name": "John Doe",
    "mother_name": "Jane Smith",
    
    // Identity Documents (Optional)
    "id_number": "AADHAR-1234-5678",
    "id_type": "AADHAR_CARD",
    
    // Previous School Information (Optional)
    "previous_school_name": "St. Xavier's High School",
    "previous_school_board": "ICSE",
    "last_class_attended": "Class 4",
    "last_exam_result": "95%",
    "subjects_studied": "Math, Science, English, Social Studies, Art",
    
    // Application Details (Optional)
    "applying_for_class": "Class 5",
    "academic_year": "2025-26",
    "board_preference": "CBSE",
    
    // Transfer Certificate (TC) Information (Optional)
    "tc_number": "TC-998877",
    "tc_issue_date": "2025-03-31",
    "tc_pending": false,
    
    // Medical & Special Needs (Optional)
    "has_special_education_needs": false,
    "is_physically_challenged": false,
    "medical_conditions": "None",
    "dietary_restrictions": "Vegetarian",
    
    // Other Details (Optional)
    "blood_group": "B+",
    "mother_tongue": "Hindi",
    "languages_known": "English, Hindi, Marathi",
    "category": "GENERAL",
    "nationality": "Indian"
  },
  "custom_field_values": {
    "custom-field-uuid-1": "Value 1",
    "custom-field-uuid-2": "Value 2"
  }
}
```

### Field Descriptions

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `enquiry_id` | string (uuid) | Enquiry tracking ID - can be `null` for fresh applications |
| `institute_id` | string (uuid) | Institute UUID (from parent's institute context) |
| `session_id` | string (uuid) | Academic session UUID |
| `source` | string | Source type: `"LEVEL"`, `"INSTITUTE"`, `"PACKAGE"` |
| `source_id` | string | ID corresponding to the source (e.g., level ID for "LEVEL") |
| `form_data.parent_name` | string | Parent's full name |
| `form_data.parent_phone` | string | Parent's phone number |
| `form_data.parent_email` | string | Parent's email address |
| `form_data.child_name` | string | Student's full name |
| `form_data.child_dob` | string (date) | Student's date of birth (YYYY-MM-DD format) |
| `form_data.child_gender` | string | Gender: `"MALE"`, `"FEMALE"`, `"OTHER"` |
| `form_data.address_line` | string | Complete address |
| `form_data.city` | string | City name |
| `form_data.pin_code` | string | Postal/ZIP code |

#### Optional Fields

All other fields in `form_data` are optional and can be included based on the institute's form configuration.

### Response

#### Success Response (200 OK)
```json
{
  "applicant_id": "uuid",
  "tracking_id": "ABC12345",
  "application_stage_id": "stage-uuid",
  "overall_status": "PENDING",
  "message": "Application submitted successfully"
}
```

#### Error Response (400 Bad Request)
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Missing required field: parent_email",
  "field": "form_data.parent_email"
}
```

---

## Enquiry-Based Application Flow

Parents can submit applications in two ways:

### 1. Fresh Application (Without Enquiry ID)
```json
{
  "enquiry_id": null,
  "institute_id": "institute-uuid",
  "session_id": "session-uuid",
  "source": "LEVEL",
  "source_id": "class_5",
  "form_data": {
    // Required fields
  }
}
```

### 2. Enquiry-Linked Application (With Tracking ID)

If the parent has an enquiry tracking ID from a previous enquiry or website form:

```json
{
  "enquiry_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "institute_id": "institute-uuid",
  "session_id": "session-uuid",
  "source": "LEVEL",
  "source_id": "class_5",
  "form_data": {
    // Pre-filled from enquiry data + additional fields
  }
}
```

### Benefits of Enquiry-Based Submission
- **Auto-fill**: Pre-populate form fields from enquiry data
- **Tracking**: Link application to existing enquiry workflow
- **History**: Maintain communication and interaction history
- **Analytics**: Track conversion from enquiry to application

---

## Payment Link Generation

After submitting the application, parents need to complete the payment for admission fees. The payment flow involves:

### Step 1: Get Application Stages

Fetch the application stages to identify which stage requires payment.

#### Endpoint
```
GET /admin-core-service/v1/application/stages
```

#### Query Parameters
- `instituteId` (required): Institute UUID
- `source` (required): Source type (e.g., "LEVEL", "INSTITUTE")
- `sourceId` (required): Source ID (e.g., level ID)

#### Request Example
```bash
curl --request GET \
  --url 'https://backend.vacademy.io/admin-core-service/v1/application/stages?instituteId=4983ac8a-4527-496d-89f0-79c6bc25f753&source=INSTITUTE&sourceId=4983ac8a-4527-496d-89f0-79c6bc25f753' \
  --header 'Authorization: Bearer <parent_jwt_token>'
```

#### Response
```json
[
  {
    "id": "form-stage-uuid",
    "sequence": "1",
    "source": "INSTITUTE",
    "type": "FORM",
    "stage_name": "Application Form",
    "source_id": "4983ac8a-4527-496d-89f0-79c6bc25f753",
    "institute_id": "4983ac8a-4527-496d-89f0-79c6bc25f753",
    "config_json": ""
  },
  {
    "id": "payment-stage-uuid",
    "sequence": "2",
    "source": "INSTITUTE",
    "type": "PAYMENT",
    "stage_name": "Admission Fee Payment",
    "source_id": "4983ac8a-4527-496d-89f0-79c6bc25f753",
    "institute_id": "4983ac8a-4527-496d-89f0-79c6bc25f753",
    "config_json": "{\"order_id\": null, \"display_text\": \"Please pay the admission fee to proceed.\", \"gateway_rules\": {\"fallback\": \"RAZORPAY\", \"preferred\": \"RAZORPAY\"}, \"payment_status\": null, \"payment_option_id\": \"e3458a23-2b76-47e2-bc73-b11eb093a3e1\"}"
  }
]
```

### Step 2: Parse Payment Configuration

From the `PAYMENT` type stage, extract the payment configuration:

```javascript
const paymentStage = stages.find(stage => stage.type === 'PAYMENT');
const paymentConfig = JSON.parse(paymentStage.config_json);

const {
  payment_option_id,
  display_text,
  gateway_rules
} = paymentConfig;
```

### Step 3: Generate Payment Link

#### Option A: Using Payment Option ID

If you have a `payment_option_id` from the application stage:

**Endpoint**: Fetch payment option details
```
POST /admin-core-service/payment/v1/get-payment-options
```

**Request Body**:
```json
{
  "types": ["ONE_TIME", "SUBSCRIPTION"],
  "source": "INSTITUTE",
  "source_id": "institute-uuid"
}
```

**Response**:
```json
[
  {
    "id": "payment-option-uuid",
    "name": "Admission Fee",
    "status": "ACTIVE",
    "type": "ONE_TIME",
    "payment_plans": [
      {
        "id": "plan-uuid",
        "name": "Admission Fee",
        "actual_price": 5000,
        "elevated_price": 5000,
        "currency": "INR",
        "description": "One-time admission fee"
      }
    ]
  }
]
```

#### Option B: Create Payment Order

**Endpoint**: Create Razorpay/Payment Gateway Order
```
POST /admin-core-service/payment/v1/create-order
```

**Request Body**:
```json
{
  "applicant_id": "applicant-uuid",
  "payment_option_id": "payment-option-uuid",
  "payment_plan_id": "plan-uuid",
  "institute_id": "institute-uuid",
  "amount": 5000,
  "currency": "INR"
}
```

**Response**:
```json
{
  "order_id": "order_xyz123",
  "amount": 5000,
  "currency": "INR",
  "payment_link": "https://rzp.io/l/xyz123abc",
  "gateway": "RAZORPAY",
  "status": "CREATED"
}
```

### Step 4: Display Payment Link to Parent

Show the payment link in the parent portal:

```html
<div class="payment-section">
  <h3>Complete Your Admission Payment</h3>
  <p>Amount: ₹5,000</p>
  <a href="https://rzp.io/l/xyz123abc" class="payment-button">
    Pay Now
  </a>
</div>
```

### Step 5: Handle Payment Callback

After payment completion, the payment gateway will send a callback/webhook:

**Webhook Endpoint** (Backend handles this):
```
POST /admin-core-service/payment/v1/webhook
```

The backend will:
1. Verify payment signature
2. Update application stage status
3. Move applicant to next stage

---

## Application Stages & Status Tracking

### Application Statuses

| Status | Description |
|--------|-------------|
| `PENDING` | Application submitted, awaiting review |
| `APPROVED` | Application approved by admin |
| `REJECTED` | Application rejected |
| `PAYMENT_PENDING` | Payment stage pending |
| `PAYMENT_COMPLETED` | Payment completed successfully |
| `ENROLLED` | Student enrolled after payment |

### Get Application Status

#### Endpoint
```
POST /admin-core-service/v1/applicant/list
```

#### Request Body
```json
{
  "institute_id": "institute-uuid",
  "search": "ABC12345"  // tracking_id
}
```

#### Response
```json
{
  "content": [
    {
      "applicant_id": "uuid",
      "tracking_id": "ABC12345",
      "overall_status": "PAYMENT_PENDING",
      "application_stage_status": "INITIATED",
      "created_at": "2026-01-15T10:30:00Z",
      "updated_at": "2026-01-15T11:00:00Z",
      "application_stage": {
        "stage_id": "payment-stage-uuid",
        "stage_name": "Admission Fee Payment",
        "type": "PAYMENT"
      },
      "student_data": {
        "full_name": "Jane Doe",
        "applying_for_class": "Class 5"
      },
      "parent_data": {
        "full_name": "John Doe",
        "email": "parent@example.com"
      }
    }
  ]
}
```

---

## Complete Integration Example

### Parent Portal Flow Implementation

```typescript
// 1. Submit Application Form
async function submitApplicationForm(formData: ApplicationFormData) {
  const payload = {
    enquiry_id: formData.enquiryId || null,
    institute_id: getCurrentInstituteId(),
    session_id: formData.sessionId,
    source: "LEVEL",
    source_id: formData.levelId,
    form_data: {
      parent_name: formData.parentName,
      parent_phone: formData.parentPhone,
      parent_email: formData.parentEmail,
      child_name: formData.childName,
      child_dob: formData.childDob,
      child_gender: formData.childGender,
      address_line: formData.addressLine,
      city: formData.city,
      pin_code: formData.pinCode,
      // ... other fields
    },
    custom_field_values: formData.customFields || {}
  };

  try {
    const response = await fetch('/admin-core-service/v1/applicant/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getParentToken()}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Failed to submit application');
    }

    const result = await response.json();
    return {
      applicantId: result.applicant_id,
      trackingId: result.tracking_id,
      status: result.overall_status
    };
  } catch (error) {
    console.error('Application submission error:', error);
    throw error;
  }
}

// 2. Get Application Stages
async function getApplicationStages(instituteId: string, source: string, sourceId: string) {
  const url = new URL('/admin-core-service/v1/application/stages', BASE_URL);
  url.searchParams.append('instituteId', instituteId);
  url.searchParams.append('source', source);
  url.searchParams.append('sourceId', sourceId);

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${getParentToken()}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch application stages');
  }

  return await response.json();
}

// 3. Generate Payment Link
async function generatePaymentLink(applicantId: string, paymentOptionId: string) {
  // First, get payment option details
  const paymentOptions = await fetch('/admin-core-service/payment/v1/get-payment-options', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getParentToken()}`
    },
    body: JSON.stringify({
      types: ['ONE_TIME'],
      source: 'INSTITUTE',
      source_id: getCurrentInstituteId()
    })
  }).then(res => res.json());

  const paymentOption = paymentOptions.find(opt => opt.id === paymentOptionId);
  const paymentPlan = paymentOption.payment_plans[0];

  // Create payment order
  const orderResponse = await fetch('/admin-core-service/payment/v1/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getParentToken()}`
    },
    body: JSON.stringify({
      applicant_id: applicantId,
      payment_option_id: paymentOptionId,
      payment_plan_id: paymentPlan.id,
      institute_id: getCurrentInstituteId(),
      amount: paymentPlan.actual_price,
      currency: paymentPlan.currency
    })
  });

  const order = await orderResponse.json();
  return order.payment_link;
}

// 4. Track Application Status
async function trackApplicationStatus(trackingId: string) {
  const response = await fetch('/admin-core-service/v1/applicant/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getParentToken()}`
    },
    body: JSON.stringify({
      institute_id: getCurrentInstituteId(),
      search: trackingId
    })
  });

  const data = await response.json();
  return data.content[0];
}

// Complete Flow
async function completeApplicationFlow(formData: ApplicationFormData) {
  try {
    // Step 1: Submit application
    const application = await submitApplicationForm(formData);
    console.log('Application submitted:', application.trackingId);

    // Step 2: Get stages to find payment stage
    const stages = await getApplicationStages(
      getCurrentInstituteId(),
      'LEVEL',
      formData.levelId
    );

    const paymentStage = stages.find(stage => stage.type === 'PAYMENT');
    
    if (paymentStage) {
      const config = JSON.parse(paymentStage.config_json);
      
      // Step 3: Generate payment link
      const paymentLink = await generatePaymentLink(
        application.applicantId,
        config.payment_option_id
      );

      // Step 4: Show payment link to parent
      window.location.href = paymentLink;
    }

    return application;
  } catch (error) {
    console.error('Application flow error:', error);
    throw error;
  }
}
```

### React Component Example

```tsx
import React, { useState } from 'react';

interface ApplicationFormProps {
  enquiryId?: string;
  instituteId: string;
  sessionId: string;
  levelId: string;
}

export function ParentApplicationForm({ 
  enquiryId, 
  instituteId, 
  sessionId, 
  levelId 
}: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    childName: '',
    childDob: '',
    childGender: 'MALE',
    addressLine: '',
    city: '',
    pinCode: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        enquiry_id: enquiryId || null,
        institute_id: instituteId,
        session_id: sessionId,
        source: 'LEVEL',
        source_id: levelId,
        form_data: formData
      };

      const response = await fetch('/admin-core-service/v1/applicant/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('parent_token')}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      setTrackingId(result.tracking_id);

      // Get payment link
      const stages = await fetchApplicationStages();
      const paymentStage = stages.find(s => s.type === 'PAYMENT');
      
      if (paymentStage) {
        const link = await generatePaymentLink(
          result.applicant_id,
          JSON.parse(paymentStage.config_json).payment_option_id
        );
        setPaymentLink(link);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (trackingId && paymentLink) {
    return (
      <div className="success-screen">
        <h2>Application Submitted Successfully!</h2>
        <p>Your tracking ID: <strong>{trackingId}</strong></p>
        <p>Please complete the payment to proceed:</p>
        <a href={paymentLink} className="payment-button">
          Pay Admission Fee
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="application-form">
      <h2>Student Admission Application</h2>
      
      {/* Parent Information */}
      <section>
        <h3>Parent Information</h3>
        <input
          type="text"
          placeholder="Parent Name"
          value={formData.parentName}
          onChange={e => setFormData({...formData, parentName: e.target.value})}
          required
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={formData.parentPhone}
          onChange={e => setFormData({...formData, parentPhone: e.target.value})}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.parentEmail}
          onChange={e => setFormData({...formData, parentEmail: e.target.value})}
          required
        />
      </section>

      {/* Child Information */}
      <section>
        <h3>Student Information</h3>
        <input
          type="text"
          placeholder="Child Name"
          value={formData.childName}
          onChange={e => setFormData({...formData, childName: e.target.value})}
          required
        />
        <input
          type="date"
          placeholder="Date of Birth"
          value={formData.childDob}
          onChange={e => setFormData({...formData, childDob: e.target.value})}
          required
        />
        <select
          value={formData.childGender}
          onChange={e => setFormData({...formData, childGender: e.target.value})}
          required
        >
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
      </section>

      {/* Address */}
      <section>
        <h3>Address</h3>
        <input
          type="text"
          placeholder="Address Line"
          value={formData.addressLine}
          onChange={e => setFormData({...formData, addressLine: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="City"
          value={formData.city}
          onChange={e => setFormData({...formData, city: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="PIN Code"
          value={formData.pinCode}
          onChange={e => setFormData({...formData, pinCode: e.target.value})}
          required
        />
      </section>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}
```

---

## Error Handling

### Common Errors and Solutions

#### 1. Validation Errors (400)
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Missing required field: parent_email"
}
```
**Solution**: Ensure all required fields are included in the form_data object.

#### 2. Authentication Errors (401)
```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}
```
**Solution**: Refresh the parent's authentication token.

#### 3. Institute Not Found (404)
```json
{
  "error": "NOT_FOUND",
  "message": "Institute not found"
}
```
**Solution**: Verify the institute_id is correct and the institute is active.

#### 4. Session Invalid (400)
```json
{
  "error": "INVALID_SESSION",
  "message": "Session is not active or has expired"
}
```
**Solution**: Check session validity and use an active session_id.

#### 5. Payment Gateway Error (500)
```json
{
  "error": "PAYMENT_GATEWAY_ERROR",
  "message": "Failed to create payment order"
}
```
**Solution**: Retry payment creation or contact support.

### Error Handling Best Practices

```typescript
async function submitWithErrorHandling(formData: ApplicationFormData) {
  try {
    const result = await submitApplicationForm(formData);
    return { success: true, data: result };
  } catch (error: any) {
    // Handle specific error types
    if (error.status === 400) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Please check all required fields and try again.'
      };
    } else if (error.status === 401) {
      return {
        success: false,
        error: 'AUTH_ERROR',
        message: 'Your session has expired. Please log in again.'
      };
    } else if (error.status === 404) {
      return {
        success: false,
        error: 'NOT_FOUND',
        message: 'Institute or session not found.'
      };
    } else {
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again later.'
      };
    }
  }
}
```

---

## Testing Checklist

- [ ] Test fresh application submission (without enquiry_id)
- [ ] Test enquiry-linked application (with enquiry_id)
- [ ] Test form validation for required fields
- [ ] Test payment link generation
- [ ] Test payment completion callback
- [ ] Test application status tracking
- [ ] Test error handling for invalid data
- [ ] Test authentication token expiry
- [ ] Test different payment gateways (Razorpay, Stripe)
- [ ] Test custom field values submission

---

## Additional Notes

1. **Security**: Always validate parent authentication before allowing application submission
2. **Data Privacy**: Ensure parent can only view/edit their own applications
3. **Session Management**: Handle token expiry gracefully with refresh mechanisms
4. **Payment Security**: Use HTTPS for all payment-related operations
5. **Tracking**: Log all application submissions and payment attempts for audit trail
6. **Notifications**: Send email/SMS notifications to parents for each stage completion

---

## Support

For technical support or questions, contact:
- **API Documentation**: [Backend API Docs]
- **Support Email**: support@vacademy.io
- **Developer Portal**: https://developer.vacademy.io
