import { 
  AIModelRegistry, 
  AIModelFactory, 
  SearchOrchestrator, 
  SearchQueryBuilder,
  GPT4oStrategy 
} from '../index';

// Example usage of the AI Core with design patterns
export class AIUsageExample {
  private modelRegistry: AIModelRegistry;
  private modelFactory: AIModelFactory;
  private searchOrchestrator: SearchOrchestrator;

  constructor() {
    this.modelRegistry = new AIModelRegistry();
    this.modelFactory = new AIModelFactory();
    this.searchOrchestrator = new SearchOrchestrator(this.modelRegistry);
  }

  async initializeWithGPT4o(apiKey: string): Promise<void> {
    // Create GPT-4o model using Factory Pattern
    const gpt4oModel = new GPT4oStrategy(apiKey);
    
    // Register model in registry
    this.modelRegistry.registerModel(gpt4oModel);
    
    // Set as default model
    this.modelRegistry.setDefaultModel('gpt-4o');
    
    console.log('✅ GPT-4o model initialized and registered');
  }

  async performSimpleSearch(query: string): Promise<any> {
    // Use Builder Pattern to create search query
    const searchQuery = new SearchQueryBuilder()
      .setQuery(query)
      .forWebSearch()
      .withHighCreativity()
      .build();

    // Execute search using Strategy Pattern
    const result = await this.searchOrchestrator.search(searchQuery);
    
    return result;
  }

  async performReasoningSearch(query: string): Promise<any> {
    // Use Builder Pattern with different configuration
    const searchQuery = new SearchQueryBuilder()
      .setQuery(query)
      .withLowCreativity()
      .withLongResponse()
      .build();

    // Execute search with reasoning steps
    const result = await this.searchOrchestrator.searchWithReasoning(searchQuery);
    
    return result;
  }

  async performModelDebate(query: string, modelIds: string[]): Promise<any> {
    // Use static factory method for quick query creation
    const searchQuery = SearchQueryBuilder.createSimpleQuery(query);
    
    // Perform debate with multiple models
    const debateResult = await this.searchOrchestrator.debateWithModels(searchQuery, modelIds);
    
    return debateResult;
  }

  async checkSystemHealth(): Promise<any> {
    const health = await this.searchOrchestrator.checkHealth();
    return health;
  }

  // Example of using Factory Pattern to create different models
  async createModelWithFactory(provider: string, apiKey: string): Promise<void> {
    const modelConfig = {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: provider,
      version: '2024-05-13',
      apiKey: apiKey,
      capabilities: {
        maxTokens: 128000,
        supportsStreaming: true,
        supportsFunctionCalling: true,
        supportsVision: true,
        supportsCodeGeneration: true,
        supportsReasoning: true,
        modelType: 'multimodal'
      }
    };

    try {
      const model = await this.modelFactory.createModel(modelConfig);
      this.modelRegistry.registerModel(model);
      console.log(`✅ ${model.name} model created and registered`);
    } catch (error) {
      console.error('❌ Failed to create model:', error);
    }
  }
}

// Usage example
export async function demonstrateUsage(): Promise<void> {
  const example = new AIUsageExample();
  
  // Initialize with GPT-4o
  await example.initializeWithGPT4o('your-openai-api-key');
  
  // Perform different types of searches
  console.log('\n🔍 Performing simple search...');
  const simpleResult = await example.performSimpleSearch('What is artificial intelligence?');
  console.log('Simple search result:', simpleResult.answer);
  
  console.log('\n🧠 Performing reasoning search...');
  const reasoningResult = await example.performReasoningSearch('Why is climate change a concern?');
  console.log('Reasoning search result:', reasoningResult.answer);
  console.log('Reasoning steps:', reasoningResult.reasoningSteps?.length);
  
  console.log('\n🏥 Checking system health...');
  const health = await example.checkSystemHealth();
  console.log('System health:', health);
  
  console.log('\n✅ All examples completed successfully!');
} 