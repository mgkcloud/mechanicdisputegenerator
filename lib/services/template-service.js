import Handlebars from 'handlebars';
// Remove fs and path imports as we won't use them
// import fs from 'fs/promises';
// import path from 'path';

// Import templates directly from JS modules
import { template as letter_of_demand_template } from '../templates/letter_of_demand.template.js';
import { template as consumer_complaint_template } from '../templates/consumer_complaint.template.js';
import { template as vcat_application_template } from '../templates/vcat_application.template.js';
import { template as insurance_claim_template } from '../templates/insurance_claim.template.js';

// Store template strings directly
const templateContentMap = {
  letter_of_demand: letter_of_demand_template,
  consumer_complaint: consumer_complaint_template,
  vcat_application: vcat_application_template,
  insurance_claim: insurance_claim_template,
  // Add other templates here
};


// --- Handlebars Helpers --- 

// Simple equality comparison helper (for {{#if (eq value1 value2)}})
Handlebars.registerHelper('eq', function(value1, value2) {
  return value1 === value2;
});

// Formats a date string (e.g., "YYYY-MM-DD" or ISO string) into DD/MM/YYYY format for Australia.
Handlebars.registerHelper('formatDate', function(dateString) {
  if (!dateString) return '';
  try {
    // Attempt to parse the date
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
        console.warn(`formatDate helper received invalid date string: ${dateString}`);
        return dateString; // Return original string if invalid
    }
    // Use Australian locale formatting
    return date.toLocaleDateString('en-AU', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });
  } catch (error) {
      console.error(`Error formatting date '${dateString}':`, error);
      return dateString; // Return original string on error
  }
});

// Formats a number into Australian Dollar currency format (e.g., $1,234.50).
Handlebars.registerHelper('formatCurrency', function(amount) {
  // Check if the amount is a valid number (including 0)
  if (typeof amount !== 'number' || isNaN(amount)) {
      // Allow null or undefined to return empty string
      if (amount === null || typeof amount === 'undefined') {
          return '';
      }
      console.warn(`formatCurrency helper received non-numeric value: ${amount}`);
      return String(amount); // Return original value as string if not a valid number
  }
  
  // Format as AUD currency
  try {
    return new Intl.NumberFormat('en-AU', { 
      style: 'currency', 
      currency: 'AUD' 
    }).format(amount);
  } catch (error) {
      console.error(`Error formatting currency '${amount}':`, error);
      return String(amount); // Return original value as string on error
  }
});

// --- Template Loading and Rendering --- 

// Cache for compiled templates
const compiledTemplateCache = new Map();

/**
 * Loads (from imports), compiles (with caching), and renders a Handlebars template.
 * 
 * @param {string} templateName - The key corresponding to the imported template (e.g., 'letter_of_demand').
 * @param {object} data - The data object to pass to the template.
 * @returns {Promise<string>} - A promise resolving to the rendered document text.
 * @throws {Error} - If the template is not found or rendering fails.
 */
export async function renderDocumentTemplate(templateName, data) {
  console.log(`Rendering document template: ${templateName}`);
  let template;

  try {
    // Check cache first
    if (compiledTemplateCache.has(templateName)) {
      template = compiledTemplateCache.get(templateName);
      console.log(`Using cached template: ${templateName}`);
    } else {
      // Get template content from the imported map
      const templateContent = templateContentMap[templateName];

      if (!templateContent) {
        console.error(`Template content not found for key: ${templateName}`);
        throw new Error(`Template content not found for '${templateName}'. Ensure it's imported and mapped correctly.`);
      }
      
      // Compile template
      console.log(`Compiling template: ${templateName}`);
      template = Handlebars.compile(templateContent);
      
      // Store in cache
      compiledTemplateCache.set(templateName, template);
      console.log(`Template compiled and cached: ${templateName}`);
    }

    // Render the template with data
    const renderedText = template(data);
    console.log(`Template ${templateName} rendered successfully.`);
    return renderedText;

  } catch (error) {
    console.error(`Error rendering template '${templateName}':`, error);
    // Check for specific errors like template not found vs. rendering errors
    if (error.message.includes('Template content not found')) {
        throw error; // Re-throw the specific error
    } else if (error.message.includes('Handlebars')) {
        // Handlebars-specific rendering error
        throw new Error(`Handlebars rendering error in template '${templateName}': ${error.message}`);
    } else {
        // General error
        throw new Error(`Failed to render template '${templateName}': ${error.message}`);
    }
  }
} 