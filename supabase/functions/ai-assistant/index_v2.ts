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
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Get authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Missing authorization header');
        }

        // Create Supabase client with the auth header
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        // Verify user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            console.error('Auth error:', userError);
            return new Response(
                JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log('User authenticated:', user.id);

        // Parse request
        const { mode, context, prompt }: AIRequest = await req.json();

        // Build system prompt based on mode
        const systemPrompt = getSystemPrompt(mode, context);

        // Call Groq API
        const groqKey = Deno.env.get('GROQ_API_KEY');
        if (!groqKey) {
            throw new Error('Groq API key not configured');
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
                    { role: 'user', content: prompt || `Analyze this project in ${mode} mode` }
                ],
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        if (!groqResponse.ok) {
            const error = await groqResponse.text();
            throw new Error(`Groq API error: ${error}`);
        }

        const aiResult = await groqResponse.json();
        const aiMessage = aiResult.choices[0]?.message?.content;

        // Format response
        const formattedResponse = formatResponse(mode, aiMessage, context);

        // Log the interaction (use service role for insert)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        await supabaseAdmin.from('ai_logs').insert({
            user_id: user.id,
            project_id: context.project?.id,
            mode,
            prompt: prompt || `${mode} analysis`,
            response: formattedResponse,
            tokens_used: aiResult.usage?.total_tokens || 0,
        });

        return new Response(
            JSON.stringify(formattedResponse),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

function getSystemPrompt(mode: string, context: any): string {
    const baseContext = `
Project: ${context.project?.name}
Goal: ${context.project?.goal}
Team Size: ${context.project?.team_size}
Tasks: ${context.tasks?.total} total, ${context.tasks?.done} done, ${context.tasks?.in_progress} in progress
`;

    switch (mode) {
        case 'task_assistant':
            return `You are a task breakdown expert. ${baseContext}
Break down complex goals into actionable tasks. Be specific and practical.`;

        case 'progress_analyst':
            return `You are a progress analyst. ${baseContext}
Analyze project progress, identify bottlenecks, and suggest improvements.`;

        case 'team_mentor':
            return `You are a team collaboration expert. ${baseContext}
Provide insights on team dynamics and collaboration improvements.`;

        case 'reflection_coach':
            return `You are a reflection coach. ${baseContext}
Help the team reflect on their work and identify lessons learned.`;

        default:
            return `You are a helpful AI assistant. ${baseContext}`;
    }
}

function formatResponse(mode: string, aiMessage: string, context: any): any {
    // Parse AI response and structure it
    const lines = aiMessage.split('\n').filter(l => l.trim());

    const insights: string[] = [];
    const recommendations: string[] = [];

    let currentSection = 'insights';

    for (const line of lines) {
        if (line.toLowerCase().includes('recommend') || line.toLowerCase().includes('suggest')) {
            currentSection = 'recommendations';
        }

        if (line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().match(/^\d+\./)) {
            const cleaned = line.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
            if (currentSection === 'recommendations') {
                recommendations.push(cleaned);
            } else {
                insights.push(cleaned);
            }
        }
    }

    return {
        mode,
        insights: insights.length > 0 ? insights : [aiMessage],
        recommendations: recommendations.length > 0 ? recommendations : [],
        summary: aiMessage.substring(0, 200),
    };
}
