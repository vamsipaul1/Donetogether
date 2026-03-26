
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRequest {
    mode: string;
    context: any;
    prompt?: string;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            console.error('Missing Authorization header');
            return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401, headers: corsHeaders });
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('Supabase configuration missing in environment variables');
            return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers: corsHeaders });
        }

        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, { 
            global: { headers: { Authorization: authHeader } } 
        });

        // Verify user - this validates the JWT
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) {
            console.error('JWT Verification failed:', userError?.message || 'No user found');
            return new Response(
                JSON.stringify({ error: 'Invalid or expired session. Please sign in again.', details: userError?.message }), 
                { status: 401, headers: corsHeaders }
            );
        }

        const { mode, context, prompt }: AIRequest = await req.json();

        const systemPrompt = getSystemPrompt(mode, context);

        const groqKey = Deno.env.get('GROQ_API_KEY');
        if (!groqKey) {
            console.error('GROQ_API_KEY is not set');
            return new Response(JSON.stringify({ error: 'AI service configuration error' }), { status: 500, headers: corsHeaders });
        }

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt || `Analyze this project.` }
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }),
        });

        if (!groqResponse.ok) {
            const errorText = await groqResponse.text();
            console.error('Groq API Error:', errorText);
            throw new Error(`AI model error: ${errorText}`);
        }

        const aiResult = await groqResponse.json();
        const aiMessage = aiResult.choices[0]?.message?.content;

        // Return raw text wrapped in object
        const formattedResponse = {
            mode,
            response: aiMessage,
            usage: aiResult.usage
        };

        // Log interaction (using service role for bypass RLS if needed, or if ai_logs has strict RLS)
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        if (supabaseServiceKey) {
            const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
            await supabaseAdmin.from('ai_logs').insert({
                user_id: user.id,
                project_id: context.project?.id,
                mode,
                prompt: prompt || 'Auto-Analysis',
                response: aiMessage,
                tokens_used: aiResult.usage?.total_tokens || 0,
            });
        }

        return new Response(JSON.stringify(formattedResponse), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('Edge Function Catch:', error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});

function getSystemPrompt(mode: string, context: any): string {
    const tasksList = context.detailed_tasks || "No specific tasks listed.";

    // Core Data Context
    const projectInfo = `
    [CONTEXT DATA]
    PROJECT: ${context.project?.name}
    GOAL: ${context.project?.goal}
    TEAM SIZE: ${context.project?.team_size} members
    
    TASKS OVERVIEW:
    - Total: ${context.tasks?.total}
    - Done: ${context.tasks?.done}
    - In Progress: ${context.tasks?.in_progress}
    
    DETAILED TASK LIST:
    ${tasksList}
    `;

    // 🎯 THE CHATGPT STYLE MASTER PROMPT
    return `
    You are an advanced AI Project Strategist.
    
    **YOUR GOAL:**
    Provide a deeply insightful, structured, and intelligent response about the project.
    
    **FORMATTING RULES:**
    1. **NO JSON.** Output pure Markdown text.
    2. **Headings:** Use ## for major sections.
    3. **Lists:** Use bullet points (-) for insights.
    4. **Bold:** Use **bold** for emphasis.
    5. **Style:** Write like a premium consultant. Concise, sharp, and direct.
    6. **Structure:**
       - Start with a high-level summary.
       - Then provide specific insights under headings.
       - End with a motivating conclusion.
    
    **TONE:**
    - Professional, Motivating, Analytical.
    - Do NOT be robotic. Be conversational but authoritative.
    
    ${projectInfo}
    `;
}
