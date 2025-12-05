import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import SupportTicket from "@/models/SupportTicket";
import { sendSupportTicketEmail } from "@/helpers/resendEmail";

export async function POST(request: Request) {
  try {
    await connect();
    const reqBody = await request.json();
    const {
      name,
      email,
      phone,
      gender,
      userType,
      problemCategory,
      customProblem,
      description,
      photos,
    } = reqBody;

    // Generate Ticket ID
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ticketId = `maceazy-${yyyy}${mm}${dd}-${random}`;

    const newTicket = new SupportTicket({
      ticketId,
      name,
      email,
      phone,
      gender,
      userType,
      problemCategory,
      customProblem,
      description,
      photos,
    });

    await newTicket.save();

    // Send email notification
    try {
      await sendSupportTicketEmail(email, name, ticketId, problemCategory);
    } catch (emailError) {
      console.error("Failed to send support email:", emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      message: "Ticket created successfully",
      success: true,
      ticketId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
