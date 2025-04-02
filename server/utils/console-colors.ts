/**
 * Console Colors Utility
 * 
 * Utility functions to add colors to console output
 */

// ANSI color codes
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const UNDERLINE = '\x1b[4m';

// Foreground colors
const BLACK = '\x1b[30m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const CYAN = '\x1b[36m';
const WHITE = '\x1b[37m';

// Background colors
const BG_BLACK = '\x1b[40m';
const BG_RED = '\x1b[41m';
const BG_GREEN = '\x1b[42m';
const BG_YELLOW = '\x1b[43m';
const BG_BLUE = '\x1b[44m';
const BG_MAGENTA = '\x1b[45m';
const BG_CYAN = '\x1b[46m';
const BG_WHITE = '\x1b[47m';

/**
 * Applies a color or style to a string
 * @param color The ANSI color code
 * @param text The text to style
 * @returns The styled text
 */
const applyStyle = (color: string, text: string) => `${color}${text}${RESET}`;

// Text style functions
export const bold = (text: string) => applyStyle(BOLD, text);
export const dim = (text: string) => applyStyle(DIM, text);
export const underline = (text: string) => applyStyle(UNDERLINE, text);

// Foreground color functions
export const black = (text: string) => applyStyle(BLACK, text);
export const red = (text: string) => applyStyle(RED, text);
export const green = (text: string) => applyStyle(GREEN, text);
export const yellow = (text: string) => applyStyle(YELLOW, text);
export const blue = (text: string) => applyStyle(BLUE, text);
export const magenta = (text: string) => applyStyle(MAGENTA, text);
export const cyan = (text: string) => applyStyle(CYAN, text);
export const white = (text: string) => applyStyle(WHITE, text);

// Background color functions
export const bgBlack = (text: string) => applyStyle(BG_BLACK, text);
export const bgRed = (text: string) => applyStyle(BG_RED, text);
export const bgGreen = (text: string) => applyStyle(BG_GREEN, text);
export const bgYellow = (text: string) => applyStyle(BG_YELLOW, text);
export const bgBlue = (text: string) => applyStyle(BG_BLUE, text);
export const bgMagenta = (text: string) => applyStyle(BG_MAGENTA, text);
export const bgCyan = (text: string) => applyStyle(BG_CYAN, text);
export const bgWhite = (text: string) => applyStyle(BG_WHITE, text);

// Compound styles (combinations)
export const error = (text: string) => bold(red(text));
export const success = (text: string) => bold(green(text));
export const warning = (text: string) => bold(yellow(text));
export const info = (text: string) => bold(blue(text));

// Detect if colors are supported
export const supportsColor = (): boolean => {
  if (process.env.NO_COLOR) return false;
  
  return process.stdout.isTTY &&
    process.env.TERM !== 'dumb' &&
    !process.env.CI;
}; 