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

export interface ReportContext {
  actions: Action[];
  reliefRequests: any[];
  governmentPriorities: any[];
  mediaFiles: any[];
  filters: {
    actions: {
      submitter?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
    };
    reliefRequests: {
      submitter?: string;
      helpType?: string;
      startDate?: string;
      endDate?: string;
      excludeINGD?: boolean;
    };
    governmentPriorities: {
      submitter?: string;
    };
  };
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

// Get date range string
const getDateRangeString = (filters: ReportContext['filters']): string => {
  const actionFilters = filters.actions;
  if (actionFilters.startDate && actionFilters.endDate) {
    return `${formatDate(actionFilters.startDate)} to ${formatDate(actionFilters.endDate)}`;
  } else if (actionFilters.startDate) {
    return `From ${formatDate(actionFilters.startDate)}`;
  } else if (actionFilters.endDate) {
    return `Until ${formatDate(actionFilters.endDate)}`;
  }
  return formatDate(new Date());
};

// Generate Report Header
function generateReportHeader(): string {
  return `SACBM PRIVATE SECTOR DISASTER RESPONSE REPORT
South African Chamber of Business in Mozambique

Reporting Period: [Date Range]
Report Generated: ${formatDate(new Date())}
Platform: SACBM Disaster Response Coordination Platform`;
}

// Generate Executive Overview with conditional narratives
function generateExecutiveOverview(actionCount: number): string {
  let narrative = `\n1. EXECUTIVE OVERVIEW\n\n`;
  
  // Base narrative - always included
  narrative += `This report provides a consolidated overview of disaster response activities recorded through the South African Chamber of Business in Mozambique (SACBM) Disaster Response Platform during the selected reporting period.

The platform enables coordination between SACBM members, government institutions, and partner organizations by providing visibility into private sector actions, humanitarian needs, and priority interventions identified during emergency response and recovery phases.

The information presented reflects submissions made directly through the platform and represents only the data captured within the filters applied for this report.\n\n`;

  // Conditional paragraph based on action count
  if (actionCount >= 20) {
    narrative += `During the reporting period, SACBM members demonstrated strong operational engagement across affected communities, contributing multiple relief initiatives through coordinated private sector support.

This level of activity reflects the continued commitment of Chamber members to complement national disaster response efforts and support recovery in areas where needs remain significant.`;
  } else if (actionCount >= 8 && actionCount < 20) {
    narrative += `During the reporting period, SACBM members maintained consistent engagement in supporting affected communities through targeted relief initiatives and coordinated private sector contributions.

These efforts continue to support stabilization and recovery efforts following earlier emergency response phases.`;
  } else if (actionCount >= 1 && actionCount < 8) {
    narrative += `A limited number of actions were recorded during the reporting period. This reflects a transition from earlier concentrated response efforts toward a stabilization phase, where fewer but more targeted interventions are taking place.`;
  } else {
    narrative += `No private sector actions were recorded through the platform during the selected reporting period. The platform remains active to capture emerging needs and support coordination between Chamber members and partner institutions should new response initiatives arise.`;
  }

  return narrative;
}

// Generate Report Scope
function generateReportScope(context: ReportContext): string {
  let narrative = `\n2. REPORT SCOPE\n\n`;
  narrative += `This report includes information recorded in the SACBM Disaster Response Platform based on the filters applied during report generation.

The report may include the following categories:\n\n`;

  const includedCategories = [];
  if (context.actions.length > 0) includedCategories.push('Private Sector Actions');
  if (context.reliefRequests.length > 0) includedCategories.push('Relief Requests');
  if (context.governmentPriorities.length > 0) includedCategories.push('Government Priority Needs');
  if (context.mediaFiles.length > 0) includedCategories.push('Media Documentation');

  if (includedCategories.length > 0) {
    includedCategories.forEach(cat => {
      narrative += `• ${cat}\n`;
    });
  } else {
    narrative += `• No data categories selected\n`;
  }

  narrative += `\nOnly the categories selected during report generation are included in the sections below.`;

  return narrative;
}

// Generate Platform Activity Summary
function generatePlatformActivitySummary(context: ReportContext): string {
  let narrative = `\n3. PLATFORM ACTIVITY SUMMARY\n\n`;
  narrative += `During the reporting period, the SACBM platform recorded the following entries:\n\n`;
  
  narrative += `Private Sector Actions: ${context.actions.length}\n`;
  narrative += `Relief Requests: ${context.reliefRequests.length}\n`;
  narrative += `Government Priority Submissions: ${context.governmentPriorities.length}\n`;
  narrative += `Media Files Included: ${context.mediaFiles.length}\n\n`;
  
  narrative += `These entries represent submissions made by Chamber members, partner organizations, and institutional stakeholders.`;

  return narrative;
}

// Generate Private Sector Actions Section
function generateActionsSection(context: ReportContext): string {
  if (context.actions.length === 0) return '';

  let narrative = `\n4. PRIVATE SECTOR ACTIONS\n\n`;
  
  // Base narrative
  narrative += `This section summarizes relief initiatives undertaken by SACBM member companies and partner organizations during the selected reporting period.

The actions recorded below represent private sector contributions submitted through the SACBM platform.\n\n`;

  // Conditional category description
  const categories = [...new Set(context.actions.map(a => a.category))].filter(Boolean);
  if (categories.length > 0) {
    narrative += `Actions undertaken during this period included contributions across the following categories:\n\n`;
    categories.forEach(cat => {
      narrative += `• ${cat}\n`;
    });
    narrative += '\n';
  }

  // Conditional narrative based on activity level
  if (context.actions.length >= 20) {
    narrative += `The volume of recorded actions highlights the significant role played by SACBM members in complementing national disaster response efforts. In several cases, companies have remained actively engaged beyond the immediate emergency phase, supporting recovery efforts in affected communities.`;
  } else if (context.actions.length >= 8) {
    narrative += `The actions recorded during this reporting period reflect continued private sector engagement in supporting recovery efforts in affected areas.`;
  } else {
    narrative += `The reduced number of actions during this reporting period follows an earlier phase of concentrated private sector response. SACBM members continue to support recovery initiatives where needs persist.`;
  }

  // Conditional organization-specific narrative
  if (context.filters.actions.submitter) {
    narrative += `\n\nThis report highlights relief initiatives undertaken by ${context.filters.actions.submitter}, a member of the South African Chamber of Business in Mozambique.`;
  }

  return narrative;
}

// Generate Relief Requests Section
function generateReliefRequestsSection(context: ReportContext): string {
  if (context.reliefRequests.length === 0) return '';

  let narrative = `\n5. RELIEF REQUESTS\n\n`;
  
  // Base narrative
  narrative += `Relief requests represent humanitarian needs identified through the SACBM platform and submitted by Chamber members, partner organizations, or institutional stakeholders.

These requests provide visibility into areas where additional assistance may be required and help guide private sector support toward priority needs.\n\n`;

  // Conditional narrative based on originator
  const hasGovernmentRequests = context.reliefRequests.some(r => r.originator === 'INGD');
  const onlyMemberRequests = !context.filters.reliefRequests.excludeINGD === false;

  if (hasGovernmentRequests && !onlyMemberRequests) {
    narrative += `Some requests included in this section originate from government institutions responsible for disaster response coordination.`;
  } else if (onlyMemberRequests) {
    narrative += `This report includes requests submitted directly by SACBM members and partner organizations.`;
  }

  return narrative;
}

// Generate Government Priority Needs Section
function generateGovernmentPrioritiesSection(context: ReportContext): string {
  if (context.governmentPriorities.length === 0) return '';

  let narrative = `\n6. GOVERNMENT PRIORITY NEEDS\n\n`;
  
  narrative += `Government priority submissions represent needs identified by public institutions involved in disaster response coordination.

These priorities provide guidance for aligning private sector initiatives with national disaster response and recovery strategies.`;

  return narrative;
}

// Generate Media Documentation Section
function generateMediaSection(context: ReportContext): string {
  if (context.mediaFiles.length === 0) return '';

  let narrative = `\n7. MEDIA DOCUMENTATION\n\n`;
  
  narrative += `This section includes media documentation associated with actions and requests recorded through the SACBM platform.

Media files are selected individually during report generation and may include images, documents, or other supporting materials.`;

  return narrative;
}

// Generate Closing Note
function generateClosingNote(): string {
  return `\n8. CLOSING NOTE\n\nThe SACBM Disaster Response Platform continues to support structured coordination between the private sector, government institutions, and partner organizations during humanitarian response and recovery operations.

By consolidating information from multiple stakeholders, the platform provides greater transparency and visibility into private sector contributions supporting affected communities across Mozambique.

The South African Chamber of Business in Mozambique remains committed to encouraging responsible private sector engagement in disaster response and recovery efforts.`;
}

// Build complete narrative
export function generateComprehensiveNarrative(context: ReportContext): string {
  let narrative = '';
  
  narrative += generateReportHeader();
  narrative += generateExecutiveOverview(context.actions.length);
  narrative += generateReportScope(context);
  narrative += generatePlatformActivitySummary(context);
  narrative += generateActionsSection(context);
  narrative += generateReliefRequestsSection(context);
  narrative += generateGovernmentPrioritiesSection(context);
  narrative += generateMediaSection(context);
  narrative += generateClosingNote();

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

// Generate PDF report with SACBM narrative engine
export async function generatePDFReport(
  context: ReportContext,
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
  
  // Generate and add complete narrative
  const narrative = generateComprehensiveNarrative(context);
  addWrappedText(narrative, 10);
  
  yPosition += 10;
  checkPageBreak(20);
  
  // Add detailed actions if present
  if (context.actions.length > 0) {
    pdf.setFontSize(12);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('DETAILED ACTIONS', margin, yPosition);
    yPosition += 8;
    
    context.actions.forEach((action, index) => {
      checkPageBreak(15);
      
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
  let name = 'sacbm-report';
  
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
  context: ReportContext,
  config: ReportConfig
) {
  const blob = await generatePDFReport(context, config);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sacbm-disaster-response-report-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
