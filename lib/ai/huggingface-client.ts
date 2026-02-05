// Hugging Face Inference API client

export interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

const HF_API_URL = 'https://api-inference.huggingface.co/models/';
const DEFAULT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';

export async function generateText(prompt: string, model: string = DEFAULT_MODEL): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY is not set');
  }

  try {
    const response = await fetch(`${HF_API_URL}${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hugging Face API error: ${error}`);
    }

    const data = await response.json();

    // Handle different response formats
    if (Array.isArray(data) && data.length > 0) {
      return data[0].generated_text || '';
    } else if (data.generated_text) {
      return data.generated_text;
    } else if (data.error) {
      throw new Error(`Hugging Face API error: ${data.error}`);
    }

    return '';
  } catch (error: any) {
    console.error('Hugging Face API error:', error);
    throw new Error(`Failed to generate text: ${error.message}`);
  }
}

export async function analyzeFinancialData(financialData: any): Promise<any> {
  const prompt = createAnalysisPrompt(financialData);
  const response = await generateText(prompt);

  // Parse the response to extract structured insights
  return parseAnalysisResponse(response, financialData);
}

function createAnalysisPrompt(data: any): string {
  return `You are a financial analyst. Analyze the following business financial data and provide insights:

Revenue: ₹${data.revenue.total.toLocaleString('en-IN')}
Expenses: ₹${data.expenses.total.toLocaleString('en-IN')}
Net Profit: ₹${(data.revenue.total - data.expenses.total).toLocaleString('en-IN')}
Profit Margin: ${((data.revenue.total - data.expenses.total) / data.revenue.total * 100).toFixed(2)}%
Cash Flow: ₹${data.cashFlow.net.toLocaleString('en-IN')}
Health Score: ${data.healthScore}/100
Risk Score: ${data.riskScore}/100

Provide a comprehensive analysis including:
1. Summary (2-3 sentences)
2. Key Strengths (3-4 points)
3. Key Weaknesses (3-4 points)
4. Opportunities for improvement (3-4 points)
5. Potential threats or risks (3-4 points)
6. Top 5 actionable recommendations with expected impact

Format your response clearly with these sections.`;
}

function parseAnalysisResponse(response: string, financialData: any): any {
  // Basic parsing - in production, you might want more sophisticated parsing
  const sections = {
    summary: '',
    strengths: [] as string[],
    weaknesses: [] as string[],
    opportunities: [] as string[],
    threats: [] as string[],
    recommendations: [] as any[],
  };

  // Simple section extraction
  const lines = response.split('\n').filter(line => line.trim());

  let currentSection = '';
  lines.forEach(line => {
    const lower = line.toLowerCase();
    if (lower.includes('summary')) {
      currentSection = 'summary';
    } else if (lower.includes('strength')) {
      currentSection = 'strengths';
    } else if (lower.includes('weakness')) {
      currentSection = 'weaknesses';
    } else if (lower.includes('opportunit')) {
      currentSection = 'opportunities';
    } else if (lower.includes('threat') || lower.includes('risk')) {
      currentSection = 'threats';
    } else if (lower.includes('recommendation')) {
      currentSection = 'recommendations';
    } else if (line.trim() && currentSection) {
      if (currentSection === 'summary') {
        sections.summary += line + ' ';
      } else if (currentSection === 'recommendations') {
        sections.recommendations.push({
          category: 'Financial Management',
          priority: 'high',
          title: line.replace(/^\d+\.\s*/, '').substring(0, 100),
          description: line,
          expectedImpact: 'Positive impact on financial health',
        });
      } else if (currentSection === 'strengths' || currentSection === 'weaknesses' || 
                 currentSection === 'opportunities' || currentSection === 'threats') {
        sections[currentSection].push(line.replace(/^[-•*]\s*/, ''));
      }
    }
  });

  return {
    insights: {
      summary: sections.summary.trim(),
      strengths: sections.strengths.slice(0, 4),
      weaknesses: sections.weaknesses.slice(0, 4),
      opportunities: sections.opportunities.slice(0, 4),
      threats: sections.threats.slice(0, 4),
    },
    recommendations: sections.recommendations.slice(0, 5),
    creditworthiness: calculateCreditworthiness(financialData),
  };
}

function calculateCreditworthiness(data: any): any {
  const score = Math.max(0, Math.min(850, 300 + (data.healthScore * 5.5) - (data.riskScore * 2)));

  let rating = 'Poor';
  if (score >= 750) rating = 'Excellent';
  else if (score >= 700) rating = 'Good';
  else if (score >= 650) rating = 'Fair';
  else if (score >= 600) rating = 'Below Average';

  const factors = [];
  if (data.ratios.profitMargin > 0.15) factors.push('Strong profit margins');
  if (data.ratios.currentRatio && data.ratios.currentRatio >= 1.5) factors.push('Good liquidity position');
  if (data.cashFlow.net > 0) factors.push('Positive cash flow');
  if (data.ratios.profitMargin < 0) factors.push('Negative profitability');
  if (data.riskScore > 60) factors.push('High financial risk');

  return { score: Math.round(score), rating, factors };
}
