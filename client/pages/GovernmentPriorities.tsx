import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { getIngdDocuments } from "@/services/supabaseService";
import type { IngdDocument } from "@/services/supabaseService";
import { Download, FileText } from "lucide-react";

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

export default function GovernmentPriorities() {
  const [documents, setDocuments] = useState<IngdDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        const allDocs = await getIngdDocuments();
        // Filter for government priority documents
        const priorityDocs = allDocs.filter(doc => 
          doc.description?.toLowerCase().includes("government") ||
          doc.description?.toLowerCase().includes("priority") ||
          doc.type === "government_priority"
        );
        setDocuments(priorityDocs);
      } catch (error) {
        console.error("Error loading documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const downloadDocument = (doc: IngdDocument) => {
    if (doc.file_url) {
      const link = document.createElement("a");
      link.href = doc.file_url;
      link.download = doc.file_name || "document";
      link.click();
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Government Priorities
          </h1>
          <p className="text-slate-600">
            Official humanitarian assistance priorities for disaster response and reconstruction
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <p className="text-slate-700 mb-3">
            In response to the current emergency situation resulting from the flooding and storms that have occurred since the beginning of January 2026, and with the approach of tropical cyclone GEZANI, the following priorities have been established for humanitarian assistance and post-disaster recovery and reconstruction:
          </p>
        </div>

        {/* Priority Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {PRIORITY_CATEGORIES.map((category, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                {category.title}
              </h2>
              <ul className="space-y-2">
                {category.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-3">
                    <span className="text-primary font-bold flex-shrink-0">➢</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Supporting Documents */}
        {documents.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Supporting Documents
            </h2>
            {isLoading ? (
              <div className="text-center py-8 text-slate-600">Loading documents...</div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">
                        <FileText size={32} className="text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {doc.file_name}
                        </h3>
                        {doc.description && (
                          <p className="text-sm text-slate-600 mt-1">
                            {doc.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          {doc.type?.toUpperCase() || "DOCUMENT"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadDocument(doc)}
                      className="ml-4 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center gap-2 flex-shrink-0"
                    >
                      <Download size={18} />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
