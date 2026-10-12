export class GameRunner {
  private isCancelled = false;
  private maxSteps = 1000;
  private steps = 0;

  constructor(private workspace: any, private delayMs: number = 600) {}

  cancel() {
    this.isCancelled = true;
    if (this.workspace) {
      this.workspace.highlightBlock(null);
    }
  }

  async run(code: string, context: Record<string, any>) {
    this.isCancelled = false;
    this.steps = 0;

    const highlightBlock = async (id: string) => {
      if (this.isCancelled) throw new Error('EXECUTION_CANCELLED');
      this.steps++;
      if (this.steps > this.maxSteps) throw new Error('INFINITE_LOOP_DETECTED');
      
      if (this.workspace && id) {
        this.workspace.highlightBlock(id);
      }
      
      // Artificial delay so highlighting is visible (unless speed is 0)
      if (this.delayMs > 0) {
         await new Promise(r => setTimeout(r, this.delayMs));
      }
    };

    const enhancedContext = {
      ...context,
      highlightBlock,
    };

    // The AsyncFunction constructor allows us to build an async function from a string of code.
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    
    // We pass the keys of our enhancedContext as arguments to the function
    const fn = new AsyncFunction(...Object.keys(enhancedContext), code);
    
    try {
      await fn(...Object.values(enhancedContext));
    } catch (e: any) {
      if (e.message !== 'EXECUTION_CANCELLED') {
        throw e;
      }
    } finally {
      if (this.workspace) {
        this.workspace.highlightBlock(null);
      }
    }
  }
}
