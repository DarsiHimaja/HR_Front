// src/pages/SelectedPage.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import * as XLSX from "xlsx";
import { Download, User } from "lucide-react";

const SelectedPage = ({ selectedCandidates }) => {
  if (!selectedCandidates || selectedCandidates.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-10 bg-gradient-to-br from-gray-50 via-slate-50 to-emerald-50">
        <div className="w-24 h-24 mb-6 flex items-center justify-center rounded-full bg-slate-100 shadow-inner">
          <User className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          No Candidates Selected
        </h2>
        <p className="text-gray-500">
          Once you select candidates, they will appear here.
        </p>
      </div>
    );
  }

  // Export to Excel
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(selectedCandidates);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SelectedCandidates");
    XLSX.writeFile(workbook, "selected_candidates.xlsx");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-50 p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800">
              Selected Candidates
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {selectedCandidates.length} candidate
              {selectedCandidates.length > 1 ? "s" : ""} selected
            </p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 px-5 py-2 shadow-md transition-all transform hover:scale-105"
          >
            <Download className="w-4 h-4" /> Export to Excel
          </Button>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedCandidates.map((candidate, index) => (
            <Card
              key={index}
              className="shadow-md hover:shadow-xl transition-all transform hover:scale-[1.01] rounded-2xl overflow-hidden bg-white"
            >
              {/* Top strip */}
              <div className="h-2 bg-gradient-to-r from-indigo-500 to-teal-500"></div>

              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {candidate.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Selected for{" "}
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                    {candidate.role}
                  </span>
                </p>

                <div className="space-y-2 text-sm text-gray-700">
                  <p>📧 {candidate.email}</p>
                  {candidate.phone && <p>📞 {candidate.phone}</p>}
                  {candidate.education && <p>🎓 {candidate.education}</p>}
                  {candidate.skills?.length > 0 && (
                    <p>💼 {candidate.skills.join(", ")}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectedPage;
