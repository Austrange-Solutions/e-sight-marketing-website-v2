import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/helpers/mailer";

connect()


export async function POST(request: NextRequest){
    try {
        const reqBody = await request.json()
        const {username, email, password} = reqBody

        console.log(reqBody);

        //check if user already exists
        const user = await User.findOne({email})

        if(user){
            return NextResponse.json({error: "User already exists"}, {status: 400})
        }

        //hash password
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        })

        const savedUser = await newUser.save()
        console.log(savedUser);

        //send verification email

        // generate a 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to user
        savedUser.verifyCode = code;
        savedUser.verifyCodeExpiry = Date.now() + 3600000; // 1 hour
        await savedUser.save();

        // Send email with code
        await sendEmail({
        email,
        code, // pass the code to your mailer
        });

        return NextResponse.json({
            message: "User created successfully",
            success: true,
            savedUser
        })
        
        


    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Signup failed';
        return NextResponse.json({error: errorMessage}, {status: 500})

    }
}