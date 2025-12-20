import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const sampleFiles = {
  "sample1": "financial-transactions.csv",
  "sample2": "network-traffic.csv",
  "sample3": "iot-sensor-data.csv",
  "sample4": "user-behavior.csv"
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sampleId = searchParams.get("id");
    const maxRows = parseInt(searchParams.get("rows") || "10");

    if (!sampleId || !sampleFiles[sampleId as keyof typeof sampleFiles]) {
      return NextResponse.json({ error: "Invalid sample ID" }, { status: 400 });
    }

    const fileName = sampleFiles[sampleId as keyof typeof sampleFiles];
    const filePath = path.join(process.cwd(), "public", "samples", fileName);
    
    // Read file
    const fileContent = await fs.readFile(filePath, "utf-8");
    const lines = fileContent.split("\n").filter(line => line.trim());
    
    // Parse CSV
    const headers = lines[0].split(",");
    const dataRows = lines.slice(1, maxRows + 1).map(line => {
      const values = line.split(",");
      const row: { [key: string]: string } = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      return row;
    });

    return NextResponse.json({
      fileName,
      headers,
      data: dataRows,
      totalRows: lines.length - 1,
      previewRows: dataRows.length
    });

  } catch (error) {
    console.error("Preview error:", error);
    return NextResponse.json(
      { error: "Failed to preview sample" },
      { status: 500 }
    );
  }
}
