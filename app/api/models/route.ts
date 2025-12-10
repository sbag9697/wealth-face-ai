import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function GET() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

    try {
        // There isn't a direct "listModels" on the instance in some SDK versions, 
        // but we can try to use the model manager if available or just hit the REST endpoint if SDK fails.
        // Actually the SDK *does* have it? 
        // No, usually it's via `genAI.getGenerativeModel`... 
        // Let's rely on a direct fetch to the API for listing models to be sure.

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "No API Key" });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
