import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import {
  FileText,
  Download,
  AlertCircle,
  Loader,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Check,
  X,
} from "lucide-react";
import { getAchievements } from "@/services/achievementsService";
import { getRequests } from "@/services/supabaseService";
import { getIngdDocuments } from "@/services/supabaseService";
import { downloadReport, ReportContext, ReportFilters } from "@/services/reportService";
import type { Achievement } from "@/services/achievementsService";
import type { RelieRequest, IngdDocument } from "@/services/supabaseService";

// Government Priority Categories (same as GovernmentPriorities.tsx)
const PRIORITY_CATEGORIES = [
  {
    title: "1) Bens Alimentares diversos",
    items: [
      "Arroz",
      "Farinha de milho",
      "Feijão",
      "Açúcar",
      "Óleo",
      "Sal",
      "Alimentos fortificados",
    ],
  },
  {
    title: "2) Material para conservação e tratamento de água",
    items: [
      "Tanques flexíveis",
      "Tanques rígidos",
      "Purificadores de agua",
      "Certeza",
      "Cloro",
    ],
  },
  {
    title: "3) Bens para Saneamento",
    items: [
      "Lonas",
      "Rolos Plásticos",
      "Estacas",
      "Arrame queimado",
      "Pregos",
      "Lajes",
    ],
  },
  {
    title: "4) Sementes",
    items: [
      "Hortícolas diversas: couve, alface, cebola, tomate e Quiabo",
      "Cereais: Milho e Mapira",
    ],
  },
  {
    title: "5) Material de Construção",
    items: [
      "Cimento",
      "Areia grossa",
      "Areia fina",
      "Chapas de zinco",
      "Pregos",
      "Arrame queimado",
      "Barrotes",
      "Portas e Janelas",
    ],
  },
  {
    title: "6) Kits de Abrigo / Ferramentas",
    items: [
      "Martelos",
      "Enxadas",
      "Catanas",
      "Alicates",
      "Serrotes",
    ],
  },
];

export default function Reports() {
  const [allActions, setAllActions] = useState<Achievement[]>([]);
  const [allRequests, setAllRequests] = useState<RelieRequest[]>([]);
  const [allDocuments, setAllDocuments] = useState<IngdDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // What to include in report
  const [includeData, setIncludeData] = useState({
    actions: true,
    reliefRequests: false,
    governmentPriorities: false,
    media: false,
  });

  // Expanded filter sections
  const [expandedFilters, setExpandedFilters] = useState({
    actions: true,
    reliefRequests: false,
    governmentPriorities: false,
    media: false,
  });

  // Actions filters
  const [actionFilters, setActionFilters] = useState({
    submitter: "",
    category: "",
    startDate: "",
    endDate: "",
  });

  // Relief Requests filters
  const [reliefFilters, setReliefFilters] = useState({
    submitter: "",
    originator: "",
    helpType: "",
    startDate: "",
    endDate: "",
    includeINGD: false,
  });

  // Relief request help types
  const [reliefHelpTypes, setReliefHelpTypes] = useState<string[]>([]);

  // Government Priorities filters - track selected categories and items
  const [govPriorityFilters, setGovPriorityFilters] = useState<{
    selectedCategories: Set<number>;
    selectedItems: Set<string>;
  }>({
    selectedCategories: new Set(),
    selectedItems: new Set(),
  });

  // Media selection
  const [selectedMedia, setSelectedMedia] = useState<Set<number>>(new Set());

  // Image preview modal
  const [previewImage, setPreviewImage] = useState<any>(null);

  // Dropdown options
  const [actionSubmitterOptions, setActionSubmitterOptions] = useState<string[]>([]);
  const [reliefSubmitterOptions, setReliefSubmitterOptions] = useState<string[]>([]);

  // Load data on mount and when includeData changes
  useEffect(() => {
    loadAllData();
  }, [includeData]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // Load actions if actions included OR if media is included (to extract action images)
      if (includeData.actions || includeData.media) {
        const actions = await getAchievements();
        setAllActions(actions);
        const submitters = [...new Set(actions.map(a => a.company_name))].filter(Boolean).sort();
        setActionSubmitterOptions(submitters);
      }

      if (includeData.reliefRequests) {
        const requests = await getRequests();
        setAllRequests(requests);
        const originators = [...new Set(requests.map(r => r.originator))].filter(Boolean).sort();
        setReliefSubmitterOptions(originators);
        const helpTypes = [...new Set(requests.map(r => r.help_type))].filter(Boolean).sort();
        setReliefHelpTypes(helpTypes);
      }

      // Load documents if media is selected
      if (includeData.media) {
        try {
          const docs = await getIngdDocuments();
          setAllDocuments(docs);
        } catch (error) {
          console.error("Error loading documents:", error);
        }
      }
    } catch (error) {
      console.error("Error loading data for report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load documents and actions when media is selected (ensures fresh load)
  useEffect(() => {
    if (includeData.media) {
      const loadMediaFiles = async () => {
        try {
          // Load both actions (for action images) and documents
          const [actions, docs] = await Promise.all([
            getAchievements(),
            getIngdDocuments()
          ]);
          setAllActions(actions);
          setAllDocuments(docs);
          console.log("Loaded media files:", {
            actionCount: actions.length,
            actionsWithMedia: actions.filter(a => a.media).length,
            documentCount: docs.length,
          });
        } catch (error) {
          console.error("Error loading media files:", error);
        }
      };
      loadMediaFiles();
    }
  }, [includeData.media]);

  // Clear media selection when organization filter changes
  useEffect(() => {
    setSelectedMedia(new Set());
  }, [actionFilters.submitter]);

  const getFilteredActions = () => {
    let filtered = allActions;

    if (actionFilters.submitter) {
      filtered = filtered.filter(a => a.company_name === actionFilters.submitter);
    }
    if (actionFilters.category) {
      filtered = filtered.filter(a => a.category === actionFilters.category);
    }
    if (actionFilters.startDate) {
      filtered = filtered.filter(a => new Date(a.created_at || '') >= new Date(actionFilters.startDate));
    }
    if (actionFilters.endDate) {
      const endDate = new Date(actionFilters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(a => new Date(a.created_at || '') <= endDate);
    }

    return filtered;
  };

  const getFilteredReliefs = () => {
    let filtered = allRequests;

    if (!reliefFilters.includeINGD) {
      filtered = filtered.filter(r => r.originator !== "INGD");
    }
    if (reliefFilters.submitter) {
      filtered = filtered.filter(r => r.originator === reliefFilters.submitter);
    }
    if (reliefFilters.helpType) {
      filtered = filtered.filter(r => r.help_type === reliefFilters.helpType);
    }
    if (reliefFilters.startDate) {
      filtered = filtered.filter(r => new Date(r.created_at || '') >= new Date(reliefFilters.startDate));
    }
    if (reliefFilters.endDate) {
      const endDate = new Date(reliefFilters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => new Date(r.created_at || '') <= endDate);
    }

    return filtered;
  };

  const getFilteredGovPriorities = () => {
    // Return selected items as array of strings
    return Array.from(govPriorityFilters.selectedItems);
  };

  const getGovPriorityCount = () => {
    // Total count of selected items across all categories
    return govPriorityFilters.selectedItems.size;
  };

  const getImageFiles = () => {
    let mediaItems: any[] = [];

    // 1. Extract images from action.media field (base64 data stored as JSON array)
    const actionImages = allActions
      .filter(action => action.media)
      .filter(action => {
        // Filter by selected organization if one is chosen
        if (actionFilters.submitter) {
          return action.company_name === actionFilters.submitter;
        }
        return true;
      })
      .flatMap((action, actionIdx) => {
        try {
          const mediaArray = JSON.parse(action.media as string);
          if (Array.isArray(mediaArray) && mediaArray.length > 0) {
            return mediaArray.map((imageData: string, imgIdx: number) => ({
              id: `action-${action.id}-${imgIdx}`,
              file_name: `${action.type_action} - ${action.company_name}`,
              description: `Image from: ${action.type_action}`,
              file_type: 'image',
              data_url: imageData,
              source: 'action',
            }));
          }
        } catch (e) {
          // Fallback for single image stored as string
          if (action.media && typeof action.media === 'string' && action.media.startsWith('data:image')) {
            return [{
              id: `action-${action.id}-0`,
              file_name: `${action.type_action} - ${action.company_name}`,
              description: `Image from: ${action.type_action}`,
              file_type: 'image',
              data_url: action.media,
              source: 'action',
            }];
          }
        }
        return [];
      });

    mediaItems = [...actionImages];

    // 2. Also include images from IngdDocuments if available
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const documentImages = allDocuments.filter(d => {
      const fileName = d.file_name?.toLowerCase() || '';
      const fileType = d.file_type?.toLowerCase() || '';
      const hasByExtension = imageExtensions.some(ext => fileName.endsWith(ext));
      const hasByType = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].some(type => fileType.includes(type) || fileType === type);
      return hasByExtension || hasByType;
    }).map(d => ({
      ...d,
      source: 'document',
    }));

    mediaItems = [...mediaItems, ...documentImages];

    if (includeData.media && (allDocuments.length > 0 || allActions.length > 0)) {
      console.log(`Found ${actionImages.length} action images + ${documentImages.length} document images = ${mediaItems.length} total`, {
        actionImages,
        documentImages,
      });
    }

    return mediaItems;
  };

  const getSelectedMediaList = () => {
    return Array.from(selectedMedia)
      .map(id => getImageFiles().find(m => m.id === id))
      .filter(Boolean);
  };

  const handleGenerateReport = async () => {
    if (!includeData.actions && !includeData.reliefRequests && !includeData.governmentPriorities && !includeData.media) {
      alert("Please select at least one data type to include in the report");
      return;
    }

    // Check if date range is set for actions
    if (includeData.actions && (!actionFilters.startDate || !actionFilters.endDate)) {
      alert("Please set a reporting date range for Actions (Start Date and End Date are required)");
      return;
    }

    // Check if date range is set for relief requests
    if (includeData.reliefRequests && (!reliefFilters.startDate || !reliefFilters.endDate)) {
      alert("Please set a reporting date range for Relief Requests (Start Date and End Date are required)");
      return;
    }

    setIsGenerating(true);
    try {
      // Build report context with all selected data
      const reportContext: ReportContext = {
        actions: includeData.actions ? getFilteredActions() : [],
        reliefRequests: includeData.reliefRequests ? getFilteredReliefs() : [],
        governmentPriorities: includeData.governmentPriorities ? getFilteredGovPriorities().map(item => ({
          title: "Government Priority Item",
          item: item,
        })) : [],
        mediaFiles: includeData.media ? getSelectedMediaList() : [],
        filters: {
          actions: {
            submitter: actionFilters.submitter,
            category: actionFilters.category,
            startDate: actionFilters.startDate,
            endDate: actionFilters.endDate,
          },
          reliefRequests: {
            submitter: reliefFilters.submitter,
            helpType: reliefFilters.helpType,
            startDate: reliefFilters.startDate,
            endDate: reliefFilters.endDate,
            excludeINGD: !reliefFilters.includeINGD,
          },
          governmentPriorities: {
            itemsCount: govPriorityFilters.selectedItems.size,
          },
        },
        selectedOrganization: actionFilters.submitter || undefined,
      };

      // Generate and download PDF report
      await downloadReport(reportContext, {
        title: "SACBM Disaster Response Report",
        organizationName: "South African Chamber of Business in Mozambique",
        footer: `Generated on ${new Date().toLocaleDateString()}`,
        includeMetrics: true,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      alert(`Error generating report: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };


  const getTotalCount = () => {
    let count = 0;
    if (includeData.actions) count += getFilteredActions().length;
    if (includeData.reliefRequests) count += getFilteredReliefs().length;
    if (includeData.governmentPriorities) count += getGovPriorityCount();
    if (includeData.media) count += selectedMedia.size;
    return count;
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600 mt-2">
            Create custom reports by selecting data types and filtering each one independently
          </p>
        </div>

        {/* Customizable Report Form */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText size={24} className="text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Build Your Report</h2>
              <p className="text-sm text-slate-600 mt-1">Select data types and customize filters for each</p>
            </div>
          </div>

          {/* Step 1: Data Selection */}
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Step 1: Select Data Types</h3>
            <div className="space-y-3">
              {[
                { key: "actions", label: "Actions", description: "Include submitted actions" },
                { key: "reliefRequests", label: "Social Impact and Relief Requests", description: "Include social impact and relief requests" },
                { key: "governmentPriorities", label: "Government Priorities", description: "Include government priorities documents" },
                { key: "media", label: "Media", description: "Include specific media files from actions" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    const newInclude = { ...includeData, [item.key]: !includeData[item.key as keyof typeof includeData] };
                    setIncludeData(newInclude);
                    if (newInclude[item.key as keyof typeof includeData]) {
                      setExpandedFilters({ ...expandedFilters, [item.key]: true });
                    }
                  }}
                  className="flex items-center gap-3 w-full p-3 hover:bg-white rounded-lg transition-colors text-left"
                >
                  {includeData[item.key as keyof typeof includeData] ? (
                    <CheckCircle2 size={20} className="text-blue-600 flex-shrink-0" />
                  ) : (
                    <Circle size={20} className="text-slate-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-600">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Filter Each Data Type */}
          <div className="space-y-4 mb-6">
            <h3 className="font-bold text-slate-900 px-4">Step 2: Configure Filters</h3>

            {/* Actions Filters */}
            {includeData.actions && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFilters({ ...expandedFilters, actions: !expandedFilters.actions })}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Actions</span>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                      {getFilteredActions().length} of {allActions.length}
                    </span>
                  </div>
                  {expandedFilters.actions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedFilters.actions && (
                  <div className="p-4 space-y-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Organization</label>
                        <select
                          value={actionFilters.submitter}
                          onChange={(e) => setActionFilters({ ...actionFilters, submitter: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Organizations</option>
                          {actionSubmitterOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                        <select
                          value={actionFilters.category}
                          onChange={(e) => setActionFilters({ ...actionFilters, category: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Categories</option>
                          <option value="Food">Food</option>
                          <option value="Clothing">Clothing</option>
                          <option value="Materials">Materials</option>
                          <option value="Medical">Medical</option>
                          <option value="Shelter">Shelter</option>
                          <option value="Water">Water</option>
                          <option value="Evacuation">Evacuation</option>
                          <option value="Multiple">Multiple</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Start Date <span className="text-red-600">*</span></label>
                        <input
                          type="date"
                          required
                          value={actionFilters.startDate}
                          onChange={(e) => setActionFilters({ ...actionFilters, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">End Date <span className="text-red-600">*</span></label>
                        <input
                          type="date"
                          required
                          value={actionFilters.endDate}
                          onChange={(e) => setActionFilters({ ...actionFilters, endDate: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Relief Requests Filters */}
            {includeData.reliefRequests && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFilters({ ...expandedFilters, reliefRequests: !expandedFilters.reliefRequests })}
                  className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Relief Requests</span>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                      {getFilteredReliefs().length} of {allRequests.length}
                    </span>
                  </div>
                  {expandedFilters.reliefRequests ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedFilters.reliefRequests && (
                  <div className="p-4 space-y-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Originator</label>
                        <select
                          value={reliefFilters.submitter}
                          onChange={(e) => setReliefFilters({ ...reliefFilters, submitter: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">All Originators</option>
                          {reliefSubmitterOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Help Type</label>
                        <select
                          value={reliefFilters.helpType}
                          onChange={(e) => setReliefFilters({ ...reliefFilters, helpType: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">All Help Types</option>
                          {reliefHelpTypes.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Start Date <span className="text-red-600">*</span></label>
                        <input
                          type="date"
                          required
                          value={reliefFilters.startDate}
                          onChange={(e) => setReliefFilters({ ...reliefFilters, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">End Date <span className="text-red-600">*</span></label>
                        <input
                          type="date"
                          required
                          value={reliefFilters.endDate}
                          onChange={(e) => setReliefFilters({ ...reliefFilters, endDate: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer p-3 hover:bg-slate-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={reliefFilters.includeINGD}
                          onChange={(e) => setReliefFilters({ ...reliefFilters, includeINGD: e.target.checked })}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm font-medium text-slate-700">Include INGD relief requests</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Government Priorities Filters */}
            {includeData.governmentPriorities && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFilters({ ...expandedFilters, governmentPriorities: !expandedFilters.governmentPriorities })}
                  className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Government Priorities</span>
                    <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                      {getGovPriorityCount()} selected
                    </span>
                  </div>
                  {expandedFilters.governmentPriorities ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedFilters.governmentPriorities && (
                  <div className="p-4 bg-white space-y-3">
                    {/* Select All Button */}
                    <button
                      onClick={() => {
                        const allItems = PRIORITY_CATEGORIES.flatMap(cat => cat.items);
                        const allSelected = allItems.every(item => govPriorityFilters.selectedItems.has(item));

                        if (allSelected) {
                          // Deselect all
                          setGovPriorityFilters({
                            selectedCategories: new Set(),
                            selectedItems: new Set(),
                          });
                        } else {
                          // Select all
                          const newSelected = new Set(allItems);
                          const newCategories = new Set(PRIORITY_CATEGORIES.map((_, idx) => idx));
                          setGovPriorityFilters({
                            selectedCategories: newCategories,
                            selectedItems: newSelected,
                          });
                        }
                      }}
                      className="w-full px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-900 font-medium rounded-lg transition-colors text-sm"
                    >
                      {PRIORITY_CATEGORIES.flatMap(cat => cat.items).every(item => govPriorityFilters.selectedItems.has(item)) ? 'Deselect All' : 'Select All'}
                    </button>

                    {/* Categories List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {PRIORITY_CATEGORIES.map((category, catIdx) => (
                        <div key={catIdx} className="border border-slate-200 rounded-lg p-3">
                          <h4 className="font-semibold text-slate-900 mb-3 text-sm">{category.title}</h4>
                          <div className="space-y-2">
                            {category.items.map((item, itemIdx) => (
                              <label key={itemIdx} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors">
                                <input
                                  type="checkbox"
                                  checked={govPriorityFilters.selectedItems.has(item)}
                                  onChange={(e) => {
                                    const newSelected = new Set(govPriorityFilters.selectedItems);
                                    const newCategories = new Set(govPriorityFilters.selectedCategories);

                                    if (e.target.checked) {
                                      newSelected.add(item);
                                      newCategories.add(catIdx);
                                    } else {
                                      newSelected.delete(item);
                                      // Remove category if no items from it are selected
                                      const categoryHasSelection = category.items.some(i =>
                                        i !== item && newSelected.has(i)
                                      );
                                      if (!categoryHasSelection) {
                                        newCategories.delete(catIdx);
                                      }
                                    }

                                    setGovPriorityFilters({
                                      selectedCategories: newCategories,
                                      selectedItems: newSelected,
                                    });
                                  }}
                                  className="w-4 h-4 rounded cursor-pointer"
                                />
                                <span className="text-sm text-slate-700">{item}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Media Selection */}
            {includeData.media && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFilters({ ...expandedFilters, media: !expandedFilters.media })}
                  className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Media Files</span>
                    <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                      {selectedMedia.size} selected
                    </span>
                  </div>
                  {expandedFilters.media ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedFilters.media && (
                  <div className="p-4 bg-white">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader size={18} className="animate-spin text-blue-600 mr-2" />
                        <p className="text-sm text-slate-600">Loading image files...</p>
                      </div>
                    ) : allActions.length === 0 && allDocuments.length === 0 ? (
                      <div className="py-4">
                        <p className="text-sm text-slate-600 mb-2">No media files available</p>
                        <p className="text-xs text-slate-500 mb-3">Click "Refresh Data" to load images from actions and documents</p>
                        <p className="text-xs text-slate-500">Supported sources:</p>
                        <p className="text-xs text-slate-500">• Images uploaded with Actions</p>
                        <p className="text-xs text-slate-500">• Image documents (JPG, PNG, GIF, WebP, BMP, SVG)</p>
                      </div>
                    ) : getImageFiles().length === 0 ? (
                      <div className="py-4">
                        <p className="text-sm text-slate-600 mb-2">No image files found</p>
                        <p className="text-xs text-slate-500 mb-3">Loaded {allActions.length} action(s) and {allDocuments.length} document(s), but no images detected</p>
                        <p className="text-xs text-slate-500">Check if images were properly uploaded with your actions</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Select All Button */}
                        <button
                          onClick={() => {
                            const allFiles = getImageFiles();
                            const allSelected = allFiles.every(file => selectedMedia.has(file.id));

                            if (allSelected) {
                              // Deselect all
                              setSelectedMedia(new Set());
                            } else {
                              // Select all
                              const newSelected = new Set(allFiles.map(f => f.id));
                              setSelectedMedia(newSelected);
                            }
                          }}
                          className="w-full px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 font-medium rounded-lg transition-colors text-sm"
                        >
                          {getImageFiles().every(file => selectedMedia.has(file.id)) ? 'Deselect All' : 'Select All'}
                        </button>

                        {/* Files List */}
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {getImageFiles().map((doc) => (
                          <div key={doc.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-colors group">
                            <input
                              type="checkbox"
                              checked={selectedMedia.has(doc.id)}
                              onChange={(e) => {
                                const newSelected = new Set(selectedMedia);
                                if (e.target.checked) {
                                  newSelected.add(doc.id);
                                } else {
                                  newSelected.delete(doc.id);
                                }
                                setSelectedMedia(newSelected);
                              }}
                              className="w-4 h-4 rounded cursor-pointer"
                            />
                            {/* Image Thumbnail Preview - Clickable */}
                            {(doc.data_url || doc.source === 'document') && (
                              <button
                                onClick={() => setPreviewImage(doc)}
                                className="w-12 h-12 flex-shrink-0 rounded bg-slate-100 overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                                title="Click to preview"
                              >
                                <img
                                  src={doc.data_url || ''}
                                  alt={doc.file_name}
                                  className="w-full h-full object-cover cursor-pointer"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </button>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{doc.file_name}</p>
                              <p className="text-xs text-slate-600">{doc.description}</p>
                              {doc.source === 'action' && (
                                <p className="text-xs text-blue-600 font-medium">From Action</p>
                              )}
                            </div>
                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                              {doc.source === 'action' ? 'ACTION' : doc.file_type?.toUpperCase()}
                            </span>
                          </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          {!isLoading && getTotalCount() > 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900 font-medium">
                ✓ {getTotalCount()} total items selected for report
              </p>
              <div className="text-xs text-green-800 mt-2 space-y-1">
                {includeData.actions && <p>• {getFilteredActions().length} Actions</p>}
                {includeData.reliefRequests && <p>• {getFilteredReliefs().length} Relief Requests</p>}
                {includeData.governmentPriorities && <p>• {getGovPriorityCount()} Government Priorities</p>}
                {includeData.media && <p>• {selectedMedia.size} Media Files</p>}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
              <Loader size={18} className="animate-spin text-blue-600" />
              <p className="text-sm text-slate-600">Loading data...</p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && !includeData.actions && !includeData.reliefRequests && !includeData.governmentPriorities && !includeData.media && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">No data selected</p>
                <p className="text-xs text-yellow-700 mt-1">Select at least one data type above to generate a report</p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating || getTotalCount() === 0 || isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              {isGenerating ? "Generating..." : "Download Report"}
            </button>
            <button
              onClick={async () => {
                setIsLoading(true);
                try {
                  const [actions, docs] = await Promise.all([
                    getAchievements(),
                    getIngdDocuments()
                  ]);
                  setAllActions(actions);
                  setAllDocuments(docs);
                  console.log("Refreshed all data:", {
                    actions: actions.length,
                    documents: docs.length,
                  });
                } catch (error) {
                  console.error("Error refreshing data:", error);
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              {isLoading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">How to Use</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-medium">Step 1:</span> Check the data types you want to include (Actions, Relief Requests, Government Priorities, Media)
            </p>
            <p>
              <span className="font-medium">Step 2:</span> Each selected data type shows its own filters - customize organization, category, date range, etc.
            </p>
            <p>
              <span className="font-medium">Step 3:</span> For Relief Requests, you can exclude INGD requests and include only member requests
            </p>
            <p>
              <span className="font-medium">Step 4:</span> For Media, individually select which files to include in the report
            </p>
            <p>
              <span className="font-medium">Step 5:</span> Click "Download Report" to generate your custom report with exactly the data you selected
            </p>
          </div>
        </div>

        {/* Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-2xl max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 sticky top-0">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{previewImage.file_name}</h3>
                  <p className="text-xs text-slate-600 mt-1">{previewImage.description}</p>
                </div>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0"
                  title="Close preview"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              </div>

              {/* Modal Body - Image */}
              <div className="p-6 flex items-center justify-center bg-slate-50">
                <img
                  src={previewImage.data_url || ''}
                  alt={previewImage.file_name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                  }}
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
                <div className="flex gap-2">
                  {previewImage.source === 'action' && (
                    <span className="inline-block text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      From Action
                    </span>
                  )}
                  <span className="inline-block text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                    {previewImage.source === 'action' ? 'ACTION' : previewImage.file_type?.toUpperCase()}
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer p-3 hover:bg-white rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedMedia.has(previewImage.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedMedia);
                      if (e.target.checked) {
                        newSelected.add(previewImage.id);
                      } else {
                        newSelected.delete(previewImage.id);
                      }
                      setSelectedMedia(newSelected);
                    }}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {selectedMedia.has(previewImage.id) ? 'Included in Report' : 'Include in Report'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
