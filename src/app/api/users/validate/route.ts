import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

await connect();

export async function POST(request: NextRequest){
    try {
        const reqBody = await request.json()
        const {email, username, phone} = reqBody

        const errors = [];

        // Check email if provided
        if (email) {
            const existingUserByEmail = await User.findOne({email});
            if (existingUserByEmail) {
                errors.push({field: 'email', message: 'Email already exists'});
            }
        }

        // Check username if provided
        if (username) {
            const existingUserByUsername = await User.findOne({username});
            if (existingUserByUsername) {
                errors.push({field: 'username', message: 'Username already exists'});
            }
        }

        // Check phone if provided
        if (phone) {
            const existingUserByPhone = await User.findOne({phone});
            if (existingUserByPhone) {
                errors.push({field: 'phone', message: 'Phone number already exists'});
            }
        }

        return NextResponse.json({
            isValid: errors.length === 0,
            errors: errors
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Validation failed';
        return NextResponse.json({error: errorMessage}, {status: 500})
    }
}
