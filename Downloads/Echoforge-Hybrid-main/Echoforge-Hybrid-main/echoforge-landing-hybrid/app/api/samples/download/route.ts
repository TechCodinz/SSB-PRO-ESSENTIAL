import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory download counter (in production, use database)
const downloadCounts: { [key: string]: number } = {
  "sample1": 3456,
  "sample2": 2134,
  "sample3": 1876,
  "sample4": 2945
};

const sampleFiles = {
  "sample1": {
    file: "financial-transactions.csv",
    name: "Financial_Transaction_Sample.csv"
  },
  "sample2": {
    file: "network-traffic.csv",
    name: "Network_Traffic_Sample.csv"
  },
  "sample3": {
    file: "iot-sensor-data.csv",
    name: "IoT_Sensor_Data_Sample.csv"
  },
  "sample4": {
    file: "user-behavior.csv",
    name: "User_Behavior_Sample.csv"
  }
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sampleId = searchParams.get("id");

    if (!sampleId || !sampleFiles[sampleId as keyof typeof sampleFiles]) {
      return NextResponse.json({ error: "Invalid sample ID" }, { status: 400 });
    }

    const sample = sampleFiles[sampleId as keyof typeof sampleFiles];
    
    // Increment download counter
    downloadCounts[sampleId] = (downloadCounts[sampleId] || 0) + 1;

    // Read the file
    const filePath = path.join(process.cwd(), "public", "samples", sample.file);
    const fileBuffer = await fs.readFile(filePath);

    // Return file with proper headers for download
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${sample.name}"`,
        "Content-Length": fileBuffer.length.toString(),
        "X-Download-Count": downloadCounts[sampleId].toString()
      }
    });

  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download sample" },
      { status: 500 }
    );
  }
}

// Get current download counts
export async function POST(_req: Request) {
  try {
    return NextResponse.json({
      counts: downloadCounts
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get download counts" },
      { status: 500 }
    );
  }
}
