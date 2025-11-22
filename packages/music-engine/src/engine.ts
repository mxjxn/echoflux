import { Note, Sequence, SynthParams, EngineState } from './types';

/**
 * MusicEngine wraps SuperSonic (SuperCollider scsynth WASM)
 * and provides a high-level API for music synthesis via OSC
 */
export class MusicEngine {
  private state: EngineState = 'uninitialized';
  private sonic: any = null; // SuperSonic instance
  private isPlaying = false;
  private currentStep = 0;
  private intervalId: number | null = null;
  private sequence: Sequence | null = null;
  private onStepCallback?: (step: number) => void;
  private nextNodeId: number = 1000; // Track synth node IDs

  constructor() {
    // SuperSonic will be initialized in init()
  }

  /**
   * Initialize the SuperSonic audio engine with OSC
   */
  async init(): Promise<void> {
    try {
      this.state = 'initializing';

      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.warn('SuperSonic requires browser environment');
        this.state = 'ready'; // Allow non-browser usage for testing
        return;
      }

      try {
        // Try to load SuperSonic dynamically
        const { SuperSonic } = await import('supersonic-scsynth');

        // Initialize SuperSonic with proper paths
        // Note: These paths need to be served with proper COOP/COEP headers
        this.sonic = new SuperSonic({
          workerBaseURL: '/supersonic/workers/',
          wasmBaseURL: '/supersonic/wasm/',
          synthdefBaseURL: '/supersonic/synthdefs/',
          sampleBaseURL: '/supersonic/samples/',
        });

        // Initialize the engine
        await this.sonic.init();

        // Load common Sonic Pi synthdefs via OSC
        const commonSynths = [
          'sonic-pi-beep',
          'sonic-pi-saw',
          'sonic-pi-pulse',
          'sonic-pi-tb303',
          'sonic-pi-prophet',
        ];

        await this.sonic.loadSynthDefs(commonSynths);

        // Enable OSC notifications
        this.sonic.send('/notify', 1);

        console.log('SuperSonic initialized with OSC support');
      } catch (err) {
        console.warn('SuperSonic not available, using fallback mode:', err);
        // Fallback: no audio but won't crash
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
    if (!this.sequence) return;

    const notesAtStep = this.sequence.notes.filter((note) => note.step === step);

    notesAtStep.forEach((note) => {
      this.playNote(note);
    });
  }

  /**
   * Play a single note using SuperSonic OSC messages
   */
  private playNote(note: Note): void {
    if (!this.sonic) {
      console.warn('SuperSonic not initialized');
      return;
    }

    const frequency = this.midiToFrequency(note.pitch);
    const amp = note.velocity / 127;
    const synthName = this.sequence?.synthName || 'sonic-pi-beep';

    // Get a unique node ID for this synth instance
    const nodeId = this.nextNodeId++;

    // Send OSC message to create synth: /s_new
    // Args: synthName, nodeId, addAction, targetId, ...params
    this.sonic.send(
      '/s_new',
      synthName,
      nodeId,
      0, // addAction: 0 = add to head
      0, // targetId: 0 = default group
      'note', note.pitch,
      'amp', amp,
      'pan', 0
    );

    // Auto-free the synth node after it finishes
    // Most Sonic Pi synths have envelope that auto-releases
  }

  /**
   * Trigger a synth with parameters via OSC
   */
  public triggerSynth(
    synthName: string,
    params: { [key: string]: number }
  ): number {
    if (!this.sonic) {
      console.warn('SuperSonic not initialized');
      return -1;
    }

    const nodeId = this.nextNodeId++;

    // Build OSC message arguments
    const args: any[] = [
      '/s_new',
      synthName,
      nodeId,
      0, // addAction
      0, // targetId
    ];

    // Add all parameters as key-value pairs
    for (const [key, value] of Object.entries(params)) {
      args.push(key, value);
    }

    // Send OSC message to scsynth
    this.sonic.send(...args);

    return nodeId;
  }

  /**
   * Free a synth node via OSC
   */
  public freeSynth(nodeId: number): void {
    if (!this.sonic) return;

    // Send OSC message to free the node
    this.sonic.send('/n_free', nodeId);
  }

  /**
   * Set parameters on a running synth via OSC
   */
  public setSynthParam(nodeId: number, param: string, value: number): void {
    if (!this.sonic) return;

    // Send OSC message to set node parameter
    this.sonic.send('/n_set', nodeId, param, value);
  }

  /**
   * Send raw OSC message to scsynth
   */
  public sendOSC(address: string, ...args: any[]): void {
    if (!this.sonic) {
      console.warn('SuperSonic not initialized');
      return;
    }

    this.sonic.send(address, ...args);
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
