import React, { useState, useEffect } from 'react';
import { 
  FileCode2, 
  Folder, 
  FileText, 
  Database, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  Sparkles,
  Info
} from 'lucide-react';

interface ProjectFile {
  path: string;
  name: string;
  content: string;
  language: string;
}

export const PythonCodePage: React.FC = () => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch('/api/python-project-files');
        const json = await res.json();
        if (json.success && json.files) {
          setFiles(json.files);
          // Default to app.py
          const defaultFile = json.files.find((f: ProjectFile) => f.name === 'app.py') || json.files[0];
          setSelectedFile(defaultFile);
        }
      } catch (e) {
        console.error('Error fetching project files:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  const handleCopy = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!selectedFile) return;
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileCode2 className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Python / Flask / PyTorch Project Files
            </h2>
            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Folder: /climate-risk-project/
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete standalone Python backend, 1D CNN PyTorch model, Integrated Gradients, SQLite models, and dataset
          </p>
        </div>

        {/* Local Run Quick Command */}
        <div className="flex items-center gap-2 bg-slate-900 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
          <Terminal className="h-3.5 w-3.5 text-emerald-400" />
          <span>python app.py</span>
        </div>
      </div>

      {/* Information Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2 text-xs text-emerald-950">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Project Files in /climate-risk-project/:</strong> All Python files are organized in this folder. You can view, copy, or download any file below.
          </div>
        </div>

        <div className="p-3 bg-white/80 rounded-xl border border-emerald-300 text-slate-800 space-y-1.5">
          <p className="font-bold text-emerald-900 text-xs">
            💡 "127.0.0.1 refused to connect" error vasthundha?
          </p>
          <p className="text-[11px] leading-relaxed text-slate-600">
            <code>127.0.0.1</code> అనేది మీ ల్యాప్‌టాప్/కంప్యూటర్ యొక్క లోకల్ అడ్రస్. మీరు మీ సిస్టమ్‌లో పైథాన్ సర్వర్‌ను రన్ చేయకుండా బ్రౌజర్‌లో <code>127.0.0.1</code> ఓపెన్ చేస్తే "Connection Refused" వస్తుంది.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 font-sans">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <strong className="text-emerald-900 block">1. ఆన్‌లైన్‌లో నేరుగా చూడటానికి:</strong>
              <span className="text-slate-600">ఈ స్క్రీన్‌లోనే (AI Studio Preview) అన్ని ఫీచర్లు, 26 జిల్లాలు, మ్యాప్, 1D CNN ప్రెడిక్షన్ లైవ్‌గా పనిచేస్తున్నాయి!</span>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <strong className="text-blue-900 block">2. మీ ల్యాప్‌టాప్‌లో 127.0.0.1 రన్ చేయడానికి:</strong>
              <span className="text-slate-600">ఈ ఫైల్స్ డౌన్‌లోడ్ చేసుకుని మీ టెర్మినల్‌లో <code>pip install -r requirements.txt</code> తర్వాత <code>python app.py</code> రన్ చేయాలి.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main File Browser & Code Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Left: File Tree (4 cols) */}
        <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/50 p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-200">
            <Folder className="h-4 w-4 text-emerald-600" />
            <span>climate-risk-project /</span>
          </div>

          <div className="space-y-1 pt-1 max-h-[600px] overflow-y-auto">
            {loading ? (
              <p className="text-xs text-slate-400 p-2">Loading project files...</p>
            ) : (
              files.map((file) => {
                const isSelected = selectedFile?.path === file.path;
                const isPy = file.name.endsWith('.py');
                const isMd = file.name.endsWith('.md');
                const isCsv = file.name.endsWith('.csv');

                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer
                      ${isSelected 
                        ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                        : 'text-slate-700 hover:bg-slate-200/70'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isPy ? (
                        <FileCode2 className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                      ) : isCsv ? (
                        <Database className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                      ) : (
                        <FileText className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      )}
                      <span className="truncate">{file.path}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Code Viewer (8 cols) */}
        <div className="md:col-span-8 flex flex-col justify-between">
          {/* File Header */}
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs font-mono">{selectedFile?.path}</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md uppercase">
                {selectedFile?.language || 'python'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Code Textarea / Pre */}
          <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-auto max-h-[580px] leading-relaxed">
            <pre>
              <code>{selectedFile?.content || 'Select a file on the left to inspect its code.'}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
