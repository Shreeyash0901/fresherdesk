import { NextRequest, NextResponse } from "next/server";
import { startWorkshopLeadAction } from "@/app/actions/workshop-leads";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, countryCode = "+91", workshopId } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    const result = await startWorkshopLeadAction(phone, countryCode, workshopId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      leadId: result.leadId,
      phone: result.phone,
      status: result.status,
      isExisting: result.isExisting,
      nextStep: "WORKSHOP_FORM",
      message: result.message,
    });
  } catch (error: any) {
    console.error("API Error in /api/workshop/leads/start:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
