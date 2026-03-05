import jsPDF from 'jspdf';
import { Action } from './supabaseService';

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  submitter?: string;
  includeDocuments?: boolean;
  includeMedia?: boolean;
}

export interface ReportConfig {
  title: string;
  organizationName?: string;
  footer?: string;
  includeMetrics?: boolean;
}

// Format numbers with . for thousands (European format)
const formatNumber = (value: number): string => {
  return value.toLocaleString('de-DE', {
    maximumFractionDigits: 0,
  });
};

// Format date
const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Template-based narrative generation
export function generateSummaryNarrative(
  actions: Action[],
  filters: ReportFilters
): string {
  if (actions.length === 0) {
    return 'No actions found for the selected criteria.';
  }

  const totalActions = actions.length;
  const totalPeopleImpacted = actions.reduce((sum, a) => sum + (a.people_impacted || 0), 0);
  const totalAmount = actions.reduce((sum, a) => sum + (a.amount || 0), 0);
  
  // Get unique categories
  const categories = [...new Set(actions.map(a => a.category))];
  const categoryCount: Record<string, number> = {};
  actions.forEach(a => {
    categoryCount[a.category] = (categoryCount[a.category] || 0) + 1;
  });
  
  // Get unique submitters
  const submitters = new Set(actions.map(a => a.company_name)).size;
  
  // Build narrative
  let narrative = '';
  
  if (filters.startDate && filters.endDate) {
    narrative += `Between ${formatDate(filters.startDate)} and ${formatDate(filters.endDate)}, `;
  } else if (filters.startDate) {
    narrative += `Starting from ${formatDate(filters.startDate)}, `;
  }
  
  narrative += `a total of ${totalActions} action${totalActions !== 1 ? 's' : ''} ${totalActions === 1 ? 'was' : 'were'} submitted. `;
  
  narrative += `These actions were submitted by ${submitters} different organization${submitters !== 1 ? 's' : ''}, `;
  narrative += `impacting ${formatNumber(totalPeopleImpacted)} people and contributing ${totalAmount > 0 ? `a total value of ${formatNumber(totalAmount)}` : 'resources'}. `;
  
  if (categories.length > 0) {
    narrative += `The actions covered ${categories.length} category/categories: `;
    const categoryStrings = categories.map(cat => {
      const count = categoryCount[cat];
      return `${cat} (${count} action${count !== 1 ? 's' : ''})`;
    });
    narrative += categoryStrings.join(', ') + '. ';
  }
  
  const avgImpact = Math.round(totalPeopleImpacted / totalActions);
  narrative += `On average, each action impacted ${formatNumber(avgImpact)} people.`;
  
  return narrative;
}

// Generate individual action summary
export function generateActionSummary(action: Action): string {
  let summary = '';
  
  if (action.company_name) {
    summary += `Submitted by ${action.company_name}. `;
  }
  
  if (action.type_action) {
    summary += `Action type: ${action.type_action}. `;
  }
  
  if (action.category) {
    summary += `Category: ${action.category}. `;
  }
  
  if (action.location) {
    summary += `Location: ${action.location}. `;
  }
  
  if (action.people_impacted) {
    summary += `People impacted: ${formatNumber(action.people_impacted)}. `;
  }
  
  if (action.amount) {
    summary += `Amount contributed: ${formatNumber(action.amount)}. `;
  }
  
  return summary;
}

// Filter actions based on criteria
export function filterActions(actions: Action[], filters: ReportFilters): Action[] {
  let filtered = [...actions];
  
  if (filters.startDate) {
    filtered = filtered.filter(a => {
      const actionDate = new Date(a.created_at || '');
      return actionDate >= filters.startDate!;
    });
  }
  
  if (filters.endDate) {
    filtered = filtered.filter(a => {
      const actionDate = new Date(a.created_at || '');
      const endDate = new Date(filters.endDate!);
      endDate.setHours(23, 59, 59, 999);
      return actionDate <= endDate;
    });
  }
  
  if (filters.category) {
    filtered = filtered.filter(a => a.category === filters.category);
  }
  
  if (filters.submitter) {
    filtered = filtered.filter(a => 
      a.company_name.toLowerCase().includes(filters.submitter!.toLowerCase())
    );
  }
  
  return filtered;
}

// Generate PDF report
export async function generatePDFReport(
  actions: Action[],
  filters: ReportFilters,
  config: ReportConfig
): Promise<Blob> {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;
  
  // Helper function to add text with wrapping
  const addWrappedText = (text: string, fontSize: number = 11, bold: boolean = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('Helvetica', bold ? 'bold' : 'normal');
    
    const lines = pdf.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 0.3527; // Convert to mm
    
    for (const line of lines) {
      if (yPosition + lineHeight > pageHeight - 10) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight + 2;
    }
    
    return yPosition;
  };
  
  // Helper function to add page break
  const checkPageBreak = (additionalHeight: number = 10) => {
    if (yPosition + additionalHeight > pageHeight - 10) {
      pdf.addPage();
      yPosition = margin;
    }
  };
  
  // Title
  addWrappedText(config.title, 18, true);
  yPosition += 5;
  
  // Organization name
  if (config.organizationName) {
    addWrappedText(config.organizationName, 12);
    yPosition += 2;
  }
  
  // Report date
  addWrappedText(`Report Generated: ${formatDate(new Date())}`, 10);
  yPosition += 8;
  
  // Summary Section
  checkPageBreak(20);
  addWrappedText('Summary', 14, true);
  yPosition += 3;
  
  const filtered = filterActions(actions, filters);
  const summary = generateSummaryNarrative(filtered, filters);
  addWrappedText(summary, 11);
  yPosition += 8;
  
  // Metrics Section (if enabled)
  if (config.includeMetrics && filtered.length > 0) {
    checkPageBreak(15);
    addWrappedText('Key Metrics', 14, true);
    yPosition += 3;
    
    const totalPeople = filtered.reduce((sum, a) => sum + (a.people_impacted || 0), 0);
    const totalAmount = filtered.reduce((sum, a) => sum + (a.amount || 0), 0);
    const avgPeople = Math.round(totalPeople / filtered.length);
    
    const metricsText = `Total Actions: ${filtered.length} | People Impacted: ${formatNumber(totalPeople)} | Total Amount: ${formatNumber(totalAmount)} | Average Impact per Action: ${formatNumber(avgPeople)} people`;
    addWrappedText(metricsText, 10);
    yPosition += 8;
  }
  
  // Detailed Actions Section
  if (filtered.length > 0) {
    checkPageBreak(15);
    addWrappedText('Detailed Actions', 14, true);
    yPosition += 5;
    
    filtered.forEach((action, index) => {
      checkPageBreak(20);
      
      // Action header
      pdf.setFontSize(11);
      pdf.setFont('Helvetica', 'bold');
      pdf.text(`${index + 1}. ${action.type_action || 'Action'}`, margin, yPosition);
      yPosition += 6;
      
      // Action details
      pdf.setFont('Helvetica', 'normal');
      pdf.setFontSize(10);
      
      const details = [
        action.company_name ? `Submitter: ${action.company_name}` : null,
        action.category ? `Category: ${action.category}` : null,
        action.location ? `Location: ${action.location}` : null,
        action.partner_organisation ? `Partner: ${action.partner_organisation}` : null,
        action.people_impacted ? `People Impacted: ${formatNumber(action.people_impacted)}` : null,
        action.amount ? `Amount: ${formatNumber(action.amount)}` : null,
        action.created_at ? `Date: ${formatDate(action.created_at)}` : null,
      ].filter(Boolean);
      
      details.forEach(detail => {
        if (yPosition + 5 > pageHeight - 10) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(detail!, margin + 5, yPosition);
        yPosition += 5;
      });
      
      // Description
      if (action.description) {
        yPosition += 2;
        checkPageBreak(10);
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text('Description:', margin + 5, yPosition);
        yPosition += 4;
        
        pdf.setFont('Helvetica', 'normal');
        const descLines = pdf.splitTextToSize(action.description, maxWidth - 10);
        const descLineHeight = 10 * 0.3527;
        
        for (const line of descLines) {
          if (yPosition + descLineHeight > pageHeight - 10) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin + 5, yPosition);
          yPosition += descLineHeight + 1;
        }
      }
      
      yPosition += 5;
    });
  }
  
  // Footer
  if (config.footer) {
    checkPageBreak(5);
    pdf.setFontSize(9);
    pdf.setFont('Helvetica', 'italic');
    pdf.text(config.footer, margin, pageHeight - 10);
  }
  
  return pdf.output('blob');
}

// Generate report file name
export function generateReportFileName(filters: ReportFilters): string {
  let name = 'actions-report';
  
  if (filters.startDate) {
    name += `-from-${filters.startDate.toISOString().split('T')[0]}`;
  }
  
  if (filters.endDate) {
    name += `-to-${filters.endDate.toISOString().split('T')[0]}`;
  }
  
  if (filters.category) {
    name += `-${filters.category.replace(/\s+/g, '-').toLowerCase()}`;
  }
  
  return `${name}.pdf`;
}

// Download PDF report
export async function downloadReport(
  actions: Action[],
  filters: ReportFilters,
  config: ReportConfig
) {
  const blob = await generatePDFReport(actions, filters, config);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = generateReportFileName(filters);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
