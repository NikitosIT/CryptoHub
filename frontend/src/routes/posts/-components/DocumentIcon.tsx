import { File, FileArchive, FileSpreadsheet, FileText } from "lucide-react";

export function DocumentIcon({ mime }: { mime?: string }) {
  if (!mime) return <File className="w-6 h-6 text-gray-300" />;

  if (mime.includes("pdf"))
    return <FileText className="w-6 h-6 text-red-400" />;
  if (mime.includes("zip") || mime.includes("rar"))
    return <FileArchive className="w-6 h-6 text-yellow-400" />;
  if (mime.includes("spreadsheet") || mime.includes("excel"))
    return <FileSpreadsheet className="w-6 h-6 text-green-400" />;

  return <File className="w-6 h-6 text-blue-400" />;
}
