export const template = `
{{! Document: Consumer Complaint (Australia) }}
{{! Template uses Handlebars.js syntax and assumes data structure from our Zod schemas. }}

**CONSUMER AFFAIRS {{state}} COMPLAINT**

{{! --- Consumer Details ---}}
**Consumer Details:**
Name: {{senderInfo.name}}
{{#if senderInfo.address}}Address: {{senderInfo.address}}{{/if}}
{{#if senderInfo.phone}}Phone: {{senderInfo.phone}}{{/if}}
{{#if senderInfo.email}}Email: {{senderInfo.email}}{{/if}}

{{! --- Trader (Mechanic) Details ---}}
**Trader Details:**
Business Name: {{recipientInfo.name}}
{{#if recipientInfo.address}}Address: {{recipientInfo.address}}{{/if}}
{{#if recipientInfo.abn}}ABN: {{recipientInfo.abn}}{{/if}}
{{#if recipientInfo.phone}}Phone: {{recipientInfo.phone}}{{/if}}
{{#if recipientInfo.email}}Email: {{recipientInfo.email}}{{/if}}

**Complaint Details:**

**Product/Service:**
Vehicle servicing provided on {{formatDate incidentDetails.serviceDate}}

**Vehicle Details:**
{{#if vehicleDetails.make}}Make: {{vehicleDetails.make}}{{/if}}
{{#if vehicleDetails.model}}Model: {{vehicleDetails.model}}{{/if}}
{{#if vehicleDetails.year}}Year: {{vehicleDetails.year}}{{/if}}
{{#if vehicleDetails.registration}}Registration: {{vehicleDetails.registration}}{{/if}}

**Description of Issue:**
{{#if incidentNarrative.text}}
{{{incidentNarrative.text}}}
{{else}}
I brought my vehicle to {{recipientInfo.name}} for servicing on {{formatDate incidentDetails.serviceDate}}. When I collected the vehicle, I discovered damage to my vehicle that was not present when I left the vehicle in their care.

The damage consists of {{incidentDetails.disputedDamageDescription}}.
{{/if}}

**Steps Taken to Resolve:**
{{#if timelineEvents}}
{{#each timelineEvents}}
{{@index}}. {{this.description}}{{#if this.timestamp}} on {{formatDate this.timestamp}}{{/if}}
{{/each}}
{{else}}
1. I immediately notified the business of the damage after collection.
2. I sent a formal letter of demand on {{formatDate metadata.generatedDate}} requesting compensation for the repair costs.
3. The business has not satisfactorily resolved this matter.
{{/if}}
{{#if remedyDetails.demandAmount}}4. I have obtained an independent repair quote of {{formatCurrency remedyDetails.demandAmount}}.{{/if}}

**Evidence Available:**
- Photos of the damage
- Service invoice
{{#if remedyDetails.demandAmount}}- Independent repair quote{{/if}}
- Copy of letter of demand
{{#if remedyDetails.insuranceDetails.insurer}}- Insurance claim details{{/if}}
{{#if incidentDetails.preServiceEvidenceAvailable}}- Evidence of vehicle condition before service{{/if}}

**Desired Outcome:**
{{#if remedyStatement.text}}
{{{remedyStatement.text}}}
{{else}}
{{#if remedyDetails.demandAmount}}
I am seeking full compensation for the repair costs of {{formatCurrency remedyDetails.demandAmount}} without having to sign any release of future claims or non-disparagement agreement.
{{else}}
I am seeking appropriate compensation for the damage caused to my vehicle.
{{/if}}
{{/if}}

I believe the business has breached the Australian Consumer Law by failing to provide services with due care and skill, resulting in damage to my vehicle.

I authorize Consumer Affairs {{state}} to contact the trader on my behalf to attempt to resolve this dispute.

{{senderInfo.name}}
{{formatDate metadata.generatedDate}}
`; 