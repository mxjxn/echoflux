import { Note, Sequence, SynthParams, EngineState } from './types';

/**
 * MusicEngine wraps SuperSonic and provides a high-level API for the sequencer
 *
 * Note: This is a simplified implementation for the prototype.
 * SuperSonic integration will be added once the package is properly installed.
 */
export class MusicEngine {
  private state: EngineState = 'uninitialized';
  private audioContext: AudioContext | null = null;
  private isPlaying = false;
  private currentStep = 0;
  private intervalId: number | null = null;
  private sequence: Sequence | null = null;
  private onStepCallback?: (step: number) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Initialize the audio engine
   */
  async init(): Promise<void> {
    try {
      this.state = 'initializing';

      // In a real implementation, we would initialize SuperSonic here:
      // const sonic = new SuperSonic({...});
      // await sonic.init();
      // await sonic.loadSynthDefs([...]);

      // For now, we'll use Web Audio API directly as a placeholder
      if (this.audioContext) {
        await this.audioContext.resume();
      }

      this.state = 'ready';
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      this.state = 'error';
      throw error;
    }
  }

  /**
   * Load a sequence for playback
   */
  loadSequence(sequence: Sequence): void {
    this.sequence = sequence;
    this.stop();
  }

  /**
   * Start playback
   */
  play(): void {
    if (!this.sequence || this.isPlaying) return;

    this.isPlaying = true;
    this.currentStep = 0;

    // Calculate step duration in ms
    const stepDuration = (60 / this.sequence.bpm) * 1000 / 4; // 16th notes

    this.intervalId = window.setInterval(() => {
      this.playStep(this.currentStep);
      this.currentStep = (this.currentStep + 1) % 16;

      if (this.onStepCallback) {
        this.onStepCallback(this.currentStep);
      }
    }, stepDuration);
  }

  /**
   * Stop playback
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPlaying = false;
    this.currentStep = 0;
  }

  /**
   * Play a specific step
   */
  private playStep(step: number): void {
    if (!this.sequence || !this.audioContext) return;

    const notesAtStep = this.sequence.notes.filter((note) => note.step === step);

    notesAtStep.forEach((note) => {
      this.playNote(note);
    });
  }

  /**
   * Play a single note using Web Audio API (placeholder for SuperSonic)
   */
  private playNote(note: Note): void {
    if (!this.audioContext) return;

    const frequency = this.midiToFrequency(note.pitch);
    const velocity = note.velocity / 127;
    const duration = (60 / (this.sequence?.bpm || 120)) * (note.duration / 4);

    // Create a simple oscillator (will be replaced with SuperSonic synths)
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(velocity * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * Convert MIDI note number to frequency
   */
  private midiToFrequency(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Update synth parameters
   */
  updateSynthParams(params: SynthParams): void {
    if (!this.sequence) return;
    this.sequence.synthParams = { ...this.sequence.synthParams, ...params };
  }

  /**
   * Register a callback for step changes
   */
  onStep(callback: (step: number) => void): void {
    this.onStepCallback = callback;
  }

  /**
   * Get current engine state
   */
  getState(): EngineState {
    return this.state;
  }

  /**
   * Check if currently playing
   */
  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get current sequence
   */
  getCurrentSequence(): Sequence | null {
    return this.sequence;
  }
}
