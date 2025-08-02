import { AIModel, AIPrompt, AIResponse, AIModelCapabilities } from '../interfaces/ai-model.interface';

export class GPT4oStrategy implements AIModel {
  public readonly id = 'gpt-4o';
  public readonly name = 'GPT-4o';
  public readonly provider = 'OpenAI';
  public readonly version = '2024-05-13';
  
  public readonly capabilities: AIModelCapabilities = {
    maxTokens: 128000,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
    supportsCodeGeneration: true,
    supportsReasoning: true,
    modelType: 'multimodal'
  };

  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async generateResponse(prompt: AIPrompt): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: this.buildMessages(prompt),
          temperature: prompt.temperature || 0.7,
          max_tokens: prompt.maxTokens || 4000,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      return {
        content: data.choices[0].message.content,
        modelId: this.id,
        provider: this.provider,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        metadata: {
          finishReason: data.choices[0].finish_reason,
          latency,
        },
      };
    } catch (error) {
      console.error('GPT-4o generation error:', error);
      throw error;
    }
  }

  async *generateStreamingResponse(prompt: AIPrompt): AsyncGenerator<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: this.buildMessages(prompt),
          temperature: prompt.temperature || 0.7,
          max_tokens: prompt.maxTokens || 4000,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      let accumulatedContent = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              accumulatedContent += content;

              if (content) {
                yield {
                  content: accumulatedContent,
                  modelId: this.id,
                  provider: this.provider,
                };
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('GPT-4o streaming error:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  getCapabilities(): AIModelCapabilities {
    return this.capabilities;
  }

  async generateWithFunctions(prompt: AIPrompt, functions: any[]): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: this.buildMessages(prompt),
          functions,
          temperature: prompt.temperature || 0.7,
          max_tokens: prompt.maxTokens || 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      return {
        content: data.choices[0].message.content || '',
        modelId: this.id,
        provider: this.provider,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        metadata: {
          finishReason: data.choices[0].finish_reason,
          latency,
        },
      };
    } catch (error) {
      console.error('GPT-4o function calling error:', error);
      throw error;
    }
  }

  async generateWithVision(prompt: AIPrompt, images: string[]): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const messages = this.buildMessages(prompt);
      
      // Add images to the first message
      if (images.length > 0) {
        messages[0] = {
          ...messages[0],
          content: [
            { type: 'text', text: messages[0].content },
            ...images.map(image => ({
              type: 'image_url' as const,
              image_url: { url: image }
            }))
          ]
        };
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages,
          temperature: prompt.temperature || 0.7,
          max_tokens: prompt.maxTokens || 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      return {
        content: data.choices[0].message.content,
        modelId: this.id,
        provider: this.provider,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        metadata: {
          finishReason: data.choices[0].finish_reason,
          latency,
        },
      };
    } catch (error) {
      console.error('GPT-4o vision error:', error);
      throw error;
    }
  }

  private buildMessages(prompt: AIPrompt): any[] {
    const messages: any[] = [];
    
    if (prompt.systemPrompt) {
      messages.push({
        role: 'system',
        content: prompt.systemPrompt
      });
    }
    
    messages.push({
      role: 'user',
      content: prompt.context ? `${prompt.context}\n\n${prompt.content}` : prompt.content
    });
    
    return messages;
  }
} 