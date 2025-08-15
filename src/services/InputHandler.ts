import { Logger } from './Logger';
import { UserInputService } from './UserInputService';

export class InputHandler {
  constructor(
    private logger: Logger,
    private userInputService: UserInputService
  ) {}

  setupInputHandling(): void {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    const handleKeyPress = async (key: string) => {
      const strKey = key.toString().trim();
      
      if (strKey === 'S' || strKey === 's') {
        await this.handleUserInputMode();
      } else if (key === '\u0003') {
        process.exit();
      }
    };

    process.stdin.on('data', handleKeyPress);
  }

  private async handleUserInputMode(): Promise<void> {
    this.userInputService.setupInteractiveMode();
  }
}
