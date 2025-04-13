import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

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
 * Loads, compiles (with caching), and renders a Handlebars template.
 * 
 * @param {string} templateName - The name of the template file (without extension, e.g., 'letter_of_demand').
 * @param {object} data - The data object to pass to the template.
 * @returns {Promise<string>} - A promise resolving to the rendered document text.
 * @throws {Error} - If the template file cannot be read or rendering fails.
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
      // Load template file
      const templateFilename = `${templateName}.hbs`;
      const templatePath = path.join(process.cwd(), 'lib', 'templates', templateFilename);
      console.log(`Loading template from: ${templatePath}`);
      
      const templateContent = await fs.readFile(templatePath, 'utf8');
      
      // Compile template
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
    // Check for specific errors like file not found vs. rendering errors
    if (error.code === 'ENOENT') {
        throw new Error(`Template file not found for '${templateName}'. Looked in lib/templates/${templateName}.hbs`);
    } else if (error.message.includes('Handlebars')) {
        // Handlebars-specific rendering error
        throw new Error(`Handlebars rendering error in template '${templateName}': ${error.message}`);
    } else {
        // General error
        throw new Error(`Failed to render template '${templateName}': ${error.message}`);
    }
  }
} 