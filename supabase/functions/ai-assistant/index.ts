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
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase client with ANON key for JWT validation
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
      throw new Error('Unauthorized');
    }

    // Parse request
    const { mode, context, prompt }: AIRequest = await req.json();

    // Build system prompt based on mode
    const systemPrompt = getSystemPrompt(mode, context);

    // Call Groq API (faster and cheaper than OpenAI!)
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
        model: 'llama-3.3-70b-versatile', // Fast and capable model
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

    // Format response based on mode
    const formattedResponse = formatResponse(mode, aiMessage, context);

    // Log the interaction using service role client
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    await supabaseService.from('ai_logs').insert({
      user_id: user.id,
      project_id: context.project?.id,
      mode,
      prompt: prompt || `${mode} analysis`,
      response: formattedResponse,
      tokens_used: aiResult.usage?.total_tokens || 0,
    });


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
Tasks: ${context.tasks?.length || 0} total
Team: ${context.members?.length || 0} members
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
  // Parse AI response and structure it
  const base = {
    mode,
    rawResponse: aiMessage,
  };

  // Try to extract structured data from AI response
  // In production, you'd use function calling or structured outputs
  switch (mode) {
    case 'task_assistant':
      return {
        ...base,
        title: 'Suggested Task Breakdown',
        insights: extractInsights(aiMessage),
        actions: extractActions(aiMessage),
      };

    case 'progress_analyst':
      const completedTasks = context.tasks?.filter((t: any) => t.status === 'completed').length || 0;
      const totalTasks = context.tasks?.length || 1;
      const score = Math.round((completedTasks / totalTasks) * 100);

      return {
        ...base,
        title: 'Project Health Analysis',
        score,
        status: score > 80 ? 'On Track' : score > 50 ? 'At Risk' : 'Needs Attention',
        insights: extractInsights(aiMessage),
        recommendations: extractRecommendations(aiMessage),
      };

    case 'team_mentor':
      return {
        ...base,
        title: 'Team Workload Analysis',
        insights: extractInsights(aiMessage),
        actions: extractActions(aiMessage),
      };

    case 'reflection_coach':
      return {
        ...base,
        title: 'Weekly Reflection',
        questions: extractQuestions(aiMessage),
        insights: extractInsights(aiMessage),
      };

    default:
      return {
        ...base,
        title: 'AI Response',
        insights: [aiMessage],
      };
  }
}

function extractInsights(text: string): string[] {
  // Simple extraction - in production, use better parsing
  const lines = text.split('\n').filter(l => l.trim());
  return lines.slice(0, 4).map(l => l.replace(/^[-•*]\s*/, '').trim());
}

function extractActions(text: string): any[] {
  // Extract actionable items
  const actionKeywords = ['create', 'add', 'setup', 'design', 'implement', 'build'];
  const lines = text.split('\n').filter(l =>
    actionKeywords.some(kw => l.toLowerCase().includes(kw))
  );

  return lines.slice(0, 3).map((line, i) => ({
    type: 'create_task',
    label: line.replace(/^[-•*]\s*/, '').trim(),
    priority: i === 0 ? 'high' : 'medium',
  }));
}

function extractRecommendations(text: string): string[] {
  // Extract recommendation sentences
  const lines = text.split('\n').filter(l =>
    l.toLowerCase().includes('should') ||
    l.toLowerCase().includes('recommend') ||
    l.toLowerCase().includes('suggest')
  );

  return lines.slice(0, 3).map(l => l.replace(/^[-•*]\s*/, '').trim());
}

function extractQuestions(text: string): string[] {
  // Extract questions
  const lines = text.split('\n').filter(l => l.includes('?'));
  return lines.slice(0, 3).map(l => l.trim());
}
