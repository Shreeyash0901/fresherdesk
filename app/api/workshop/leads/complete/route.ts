import { NextRequest, NextResponse } from "next/server";
import { completeWorkshopLeadAction } from "@/app/actions/workshop-leads";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, name, email, city, occupation, workshopId } = body;

    if (!leadId || !name || !email || !city) {
      return NextResponse.json(
        { success: false, error: "leadId, name, email, and city are required." },
        { status: 400 }
      );
    }

    const result = await completeWorkshopLeadAction({
      leadId,
      name,
      email,
      city,
      occupation,
      workshopId,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      leadId: result.leadId,
      status: "REGISTERED",
      message: result.message,
    });
  } catch (error: any) {
    console.error("API Error in /api/workshop/leads/complete:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
