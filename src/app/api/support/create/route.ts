import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import SupportTicket from "@/models/SupportTicket";
import { sendSupportTicketEmail } from "@/helpers/resendEmail";
import {
  validateAndSanitize,
  sanitizeEmail,
  sanitizePhone,
  validateAndSanitizeWithWordLimit,
} from "@/lib/validation/xss";

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

    // Validate and sanitize all user inputs to prevent XSS
    let sanitizedData;
    try {
      sanitizedData = {
        name: validateAndSanitize(name, {
          fieldName: "name",
          maxLength: 100,
          strict: true,
        }),
        email: sanitizeEmail(email),
        phone: sanitizePhone(phone),
        gender: validateAndSanitize(gender, {
          fieldName: "gender",
          maxLength: 20,
        }),
        userType: validateAndSanitize(userType, {
          fieldName: "userType",
          maxLength: 50,
        }),
        problemCategory: validateAndSanitize(problemCategory, {
          fieldName: "problemCategory",
          maxLength: 100,
        }),
        customProblem: customProblem
          ? validateAndSanitize(customProblem, {
              fieldName: "customProblem",
              maxLength: 200,
            })
          : undefined,
        description: validateAndSanitizeWithWordLimit(description, {
          fieldName: "description",
          maxWords: 150,
          strict: true,
        }),
        photos: photos || [],
      };
    } catch (validationError) {
      return NextResponse.json(
        {
          error:
            validationError instanceof Error
              ? validationError.message
              : "Invalid input detected",
        },
        { status: 400 }
      );
    }

    // Generate Ticket ID
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ticketId = `maceazy-${yyyy}${mm}${dd}-${random}`;

    const newTicket = new SupportTicket({
      ticketId,
      name: sanitizedData.name,
      email: sanitizedData.email,
      phone: sanitizedData.phone,
      gender: sanitizedData.gender,
      userType: sanitizedData.userType,
      problemCategory: sanitizedData.problemCategory,
      customProblem: sanitizedData.customProblem,
      description: sanitizedData.description,
      photos: sanitizedData.photos,
    });

    await newTicket.save();

    // Send email notification
    try {
      await sendSupportTicketEmail(
        sanitizedData.email,
        sanitizedData.name,
        ticketId,
        sanitizedData.problemCategory
      );
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
