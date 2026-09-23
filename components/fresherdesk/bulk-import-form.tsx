"use client";

import { useState } from "react";
import { bulkImportOpportunitiesAction } from "@/app/actions/admin-opportunities";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw, FileText, ArrowRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useRouter, useSearchParams } from "next/navigation";
import * as xlsx from "xlsx";
import Link from "next/link";

export function BulkImportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = (searchParams.get("type") as "Job" | "Internship") || "Job";

  const [rawText, setRawText] = useState("");
  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    importedCount?: number;
    errorsCount?: number;
    message?: string;
    error?: string;
  } | null>(null);

  // Parse raw JSON or CSV text
  function handleParseText() {
    setParseError(null);
    setParsedItems([]);
    const text = rawText.trim();
    if (!text) return;

    // Try JSON parse first
    if (text.startsWith("[") || text.startsWith("{")) {
      try {
        const json = JSON.parse(text);
        const array = Array.isArray(json) ? json : [json];
        setParsedItems(array);
        return;
      } catch (err: any) {
        // Not valid JSON, fall through to CSV
      }
    }

    // Try CSV parse
    try {
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        setParseError("CSV format requires a header row and at least 1 data row.");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ""));
      const items = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
        if (row.length === 0) continue;

        const obj: any = {};
        headers.forEach((h, idx) => {
          if (h.includes("role") || h.includes("title")) obj.role = row[idx];
          else if (h.includes("company")) obj.company = row[idx];
          else if (h.includes("type")) obj.type = row[idx];
          else if (h.includes("location") || h.includes("city")) obj.location = row[idx];
          else if (h.includes("skill")) obj.skills = row[idx];
          else if (h.includes("exp")) obj.experience = row[idx];
          else if (h.includes("salary") || h.includes("ctc")) obj.salaryText = row[idx];
          else if (h.includes("stipend")) obj.stipendText = row[idx];
          else if (h.includes("url") || h.includes("link")) obj.activeApplicationUrl = row[idx];
          else if (h.includes("mode")) obj.mode = row[idx];
        });

        if (!obj.type) obj.type = defaultType;
        if (obj.role && obj.company) {
          items.push(obj);
        }
      }

      if (items.length === 0) {
        setParseError("Could not extract valid records. Ensure headers contain: Role, Company, Location, Type");
      } else {
        setParsedItems(items);
      }
    } catch (err: any) {
      setParseError("Error parsing input: " + err.message);
    }
  }

  // Handle Excel / CSV file upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setParsedItems([]);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = xlsx.read(buffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = xlsx.utils.sheet_to_json(firstSheet);

      const items = rawData.map((row: any) => {
        const getVal = (...keys: string[]) => {
          for (const k of Object.keys(row)) {
            const clean = k.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (keys.some((target) => clean.includes(target))) {
              return row[k];
            }
          }
          return undefined;
        };

        return {
          role: getVal("role", "title", "position") || "Software Developer",
          company: getVal("company", "organization", "employer") || "Tech Company",
          type: getVal("type") || defaultType,
          location: getVal("location", "city", "place") || "India",
          mode: getVal("mode") || "On-site",
          skills: getVal("skill", "skills") || "",
          experience: getVal("experience", "exp", "batch") || "0-1 Years",
          salaryText: getVal("salary", "ctc", "package") || null,
          stipendText: getVal("stipend") || null,
          activeApplicationUrl: getVal("url", "link", "apply") || null,
        };
      });

      setParsedItems(items);
    } catch (err: any) {
      setParseError("Failed to parse Excel file: " + err.message);
    }
  }

  async function handleCommitImport() {
    if (parsedItems.length === 0) return;
    setIsImporting(true);
    setResult(null);

    try {
      const res = await bulkImportOpportunitiesAction(parsedItems);
      setResult(res);
      if (res.success) {
        setTimeout(() => {
          router.push(defaultType === "Job" ? "/admin/jobs" : "/admin/internships");
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setResult({ error: "Import failed: " + err.message });
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Upload size={20} className="text-emerald-600" />
          Bulk Ingest Opportunities
        </h1>
        <p className="text-xs text-slate-500">
          Upload an Excel (.xlsx, .xls) spreadsheet, CSV file, or paste raw data to import dozens of opportunities at once.
        </p>

        {result?.success && (
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{result.message} Redirecting to pipeline...</span>
          </div>
        )}

        {result?.error && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{result.error}</span>
          </div>
        )}

        {/* File Upload Drop Area */}
        <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-6 text-center bg-slate-50/50 transition-colors">
          <FileSpreadsheet size={36} className="mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-800">
            Upload Excel or CSV File
          </p>
          <p className="text-xs text-slate-500 mb-3">
            Supports .xlsx, .xls, and .csv files
          </p>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 max-w-xs mx-auto cursor-pointer"
          />
        </div>

        {/* Text Paste Area */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Or Paste CSV / JSON Text
            </label>
            <button
              type="button"
              onClick={() => {
                setRawText(`Role,Company,Type,Location,Experience,Salary,Skills\nFrontend Developer,Razorpay,Job,Bengaluru,0-1 Years,"₹8-12 LPA","React, Next.js, TS"\nData Science Intern,Flipkart,Internship,Remote,Freshers,"₹30,000/mo","Python, SQL, Pandas"`);
              }}
              className="text-[11px] font-semibold text-emerald-600 hover:underline"
            >
              Fill Sample CSV Template
            </button>
          </div>
          <Textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={5}
            placeholder={`Role, Company, Type, Location, Experience, Salary, Skills...`}
            className="font-mono text-xs bg-slate-50"
          />
          <button
            type="button"
            onClick={handleParseText}
            className="button button-outline compact text-xs"
          >
            Parse Pasted Data
          </button>
        </div>

        {parseError && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{parseError}</span>
          </div>
        )}

        {/* Parsed Preview Table */}
        {parsedItems.length > 0 && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Ready to Import: {parsedItems.length} Records
              </span>
              <button
                type="button"
                onClick={handleCommitImport}
                disabled={isImporting}
                className="button button-green compact text-xs flex items-center gap-1.5"
              >
                {isImporting ? <RefreshCw className="animate-spin" size={13} /> : <CheckCircle2 size={14} />}
                <span>{isImporting ? "Importing to Database..." : `Confirm & Save ${parsedItems.length} Opportunities`}</span>
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">Company</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Location</th>
                    <th className="p-2.5">Comp / Package</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 text-slate-400">{idx + 1}</td>
                      <td className="p-2.5 font-semibold text-slate-900">{item.role}</td>
                      <td className="p-2.5 text-slate-700">{item.company}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {item.type || defaultType}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600">{item.location || "India"}</td>
                      <td className="p-2.5 font-medium text-emerald-700">
                        {item.salaryText || item.stipendText || "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
