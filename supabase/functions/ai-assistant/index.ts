import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), { status: 401, headers: corsHeaders });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Invalid or expired session' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Parse request
    const { mode, context, prompt }: AIRequest = await req.json();

    // Build system prompt based on mode
    const systemPrompt = getSystemPrompt(mode, context);

    // Call Groq API
    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (!groqKey) {
      console.error('Groq API key not configured');
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
          { role: 'user', content: prompt || `Analyze this project in ${mode} mode` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!groqResponse.ok) {
      const error = await groqResponse.text();
      console.error('Groq API Error:', error);
      throw new Error(`AI model error: ${error}`);
    }

    const aiResult = await groqResponse.json();
    const aiMessage = aiResult.choices[0]?.message?.content;

    // Format response based on mode
    const formattedResponse = formatResponse(mode, aiMessage, context);

    // Log the interaction using service role client
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (supabaseServiceKey) {
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
      await supabaseService.from('ai_logs').insert({
        user_id: user.id,
        project_id: context.project?.id,
        mode,
        prompt: prompt || `${mode} analysis`,
        response: formattedResponse,
        tokens_used: aiResult.usage?.total_tokens || 0,
      });
    }

    return new Response(
      JSON.stringify(formattedResponse),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('AI Assistant Error:', error);
    return new Response(
      JSON.stringify({
        error: true,
        message: error.message || 'AI service temporarily unavailable'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

function getSystemPrompt(mode: string, context: any): string {
  const baseContext = `
You are a helpful AI assistant for the DoneTogether project management platform.
Project: ${context.project?.name || 'Unknown'}
Goal: ${context.project?.goal || 'No goal set'}
Tasks: ${context.tasks?.total || 0} total
Team: ${context.project?.team_size || 0} members
`;

  switch (mode) {
    case 'task_assistant':
      return `${baseContext}
You are a task planning expert. Help break down projects into actionable tasks.
Provide specific, measurable task suggestions with priorities.
Consider dependencies and realistic timelines.`;

    case 'progress_analyst':
      return `${baseContext}
You are a project health analyst. Evaluate progress, identify risks, and provide recommendations.
Calculate completion rates, identify bottlenecks, and suggest corrective actions.
Be data-driven and actionable.`;

    case 'team_mentor':
      return `${baseContext}
You are a team workload optimizer. Analyze task distribution and team capacity.
Identify imbalances, suggest redistributions, and promote healthy work patterns.
Consider individual strengths and current workload.`;

    case 'reflection_coach':
      return `${baseContext}
You are a reflective coach for continuous improvement.
Ask insightful questions about what worked, what didn't, and what to improve.
Foster a growth mindset and actionable retrospectives.`;

    default:
      return baseContext;
  }
}

function formatResponse(mode: string, aiMessage: string, context: any): any {
  // Return consistent structure
  return {
    mode,
    response: aiMessage,
    rawResponse: aiMessage
  };
}
