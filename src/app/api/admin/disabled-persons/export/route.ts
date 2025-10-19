import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import DisabledPerson from "@/models/disabledPersonModel";
import { getAdminFromRequest } from "@/middleware/adminAuth";
import * as XLSX from "xlsx";

connect();

function formatDateForFilename(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

// GET /api/admin/disabled-persons/export?format=csv|xlsx
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "csv").toLowerCase();

  // Fetch all documents as lean objects

    if (format === "xlsx") {
      const allDocs = (await DisabledPerson.find({}).lean()) as Array<Record<string, unknown>>;
      const headers: string[] = allDocs[0] ? Object.keys(allDocs[0]) as string[] : ["_id", "fullName", "email"];
      const rows: string[][] = [headers];
      for (const doc of allDocs) {
        rows.push(
          headers.map((h) => {
            const v = doc[h] as unknown;
            if (v instanceof Date) return v.toISOString();
            if (typeof v === "object" && v !== null) return JSON.stringify(v);
            return v === undefined || v === null ? "" : String(v);
          })
        );
      }

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "DisabledPersons");
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

      const filename = `disabled-people-${formatDateForFilename()}.xlsx`;
      return new NextResponse(wbout, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // Default CSV generation (no external deps)
    const all = (await DisabledPerson.find({}).lean()) as Array<Record<string, unknown>>;
    const fields = all[0] ? Object.keys(all[0]) : ["_id", "fullName", "email"];

    const escapeCsv = (str: unknown) => {
      if (str === null || str === undefined) return "";
      const s = typeof str === "string" ? str : String(str);
      if (s.includes('"') || s.includes(',') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const headerLine = fields.map((f) => escapeCsv(f)).join(",");
    const bodyLines = all.map((doc: Record<string, unknown>) =>
      fields
        .map((f) => {
          const v = doc[f] as unknown;
          if (v instanceof Date) return escapeCsv(v.toISOString());
          if (typeof v === "object" && v !== null) return escapeCsv(JSON.stringify(v));
          return escapeCsv(v);
        })
        .join(",")
    );

    const csvContent = [headerLine, ...bodyLines].join("\n");
    const filename = `disabled-people-${formatDateForFilename()}.csv`;
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error("Export failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Export failed" }, { status: 500 });
  }
}
