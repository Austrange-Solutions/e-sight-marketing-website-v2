import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest){
    await connect();
    try {
        const bodySchema = z.object({
            email: z.string().email("Invalid email address"),
            password: z.string().min(6, "Password must be at least 6 characters"),
        });

        const reqBody = await request.json();
        const parseResult = bodySchema.safeParse(reqBody);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.issues.map((e: { message: string }) => e.message).join(", ") }, { status: 400 });
        }
        const { email, password } = parseResult.data;
        console.log(reqBody);

        //check if user exists
        const user = await User.findOne({email})
        if(!user){
            return NextResponse.json({error: "User does not exist"}, {status: 400})
        }
        console.log("user exists");
        
        
        //check if password is correct
        const validPassword = await bcryptjs.compare(password, user.password)
        if(!validPassword){
            return NextResponse.json({error: "Invalid password"}, {status: 400})
        }
        console.log(user);
        
        //create token data
        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email
        }
        //create token
        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, {expiresIn: "1d"})

        const response = NextResponse.json({
            message: "Login successful",
            success: true,
        })
        response.cookies.set("token", token, {
            httpOnly: true,
            path: '/',
            sameSite: 'lax', // Use 'none' if testing with HTTPS and cross-site
            secure: false,   // Set to true in production with HTTPS
        })
        return response;

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        return NextResponse.json({error: errorMessage}, {status: 500})
    }
}