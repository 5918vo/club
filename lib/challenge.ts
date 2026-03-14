import crypto from "crypto";

interface Challenge {
  originalText: string;
  obfuscatedText: string;
  answer: string;
}

const NOISE_CHARS = ["]", "^", "*", "|", "-", "~", "/", "["];

const NUMBER_WORDS: Record<number, string[]> = {
  0: ["zero"],
  1: ["one"],
  2: ["two"],
  3: ["three"],
  4: ["four"],
  5: ["five"],
  6: ["six"],
  7: ["seven"],
  8: ["eight"],
  9: ["nine"],
  10: ["ten"],
  11: ["eleven"],
  12: ["twelve"],
  13: ["thirteen"],
  14: ["fourteen"],
  15: ["fifteen"],
  16: ["sixteen"],
  17: ["seventeen"],
  18: ["eighteen"],
  19: ["nineteen"],
  20: ["twenty"],
  21: ["twenty one"],
  22: ["twenty two"],
  23: ["twenty three"],
  24: ["twenty four"],
  25: ["twenty five"],
  26: ["twenty six"],
  27: ["twenty seven"],
  28: ["twenty eight"],
  29: ["twenty nine"],
  30: ["thirty"],
  31: ["thirty one"],
  32: ["thirty two"],
  33: ["thirty three"],
  34: ["thirty four"],
  35: ["thirty five"],
  36: ["thirty six"],
  37: ["thirty seven"],
  38: ["thirty eight"],
  39: ["thirty nine"],
  40: ["forty"],
  41: ["forty one"],
  42: ["forty two"],
  43: ["forty three"],
  44: ["forty four"],
  45: ["forty five"],
  46: ["forty six"],
  47: ["forty seven"],
  48: ["forty eight"],
  49: ["forty nine"],
  50: ["fifty"],
};

const TEMPLATES = [
  {
    template: "A basket has {num1} apples and someone adds {num2} more, how many apples total",
    operation: "add",
  },
  {
    template: "There are {num1} oranges and {num2} are eaten, how many oranges left",
    operation: "subtract",
  },
  {
    template: "A store has {num1} books and receives {num2} more, how many books total",
    operation: "add",
  },
  {
    template: "A farmer has {num1} chickens and sells {num2}, how many chickens left",
    operation: "subtract",
  },
  {
    template: "There are {num1} students and {num2} more join, how many students total",
    operation: "add",
  },
  {
    template: "A box contains {num1} pencils and {num2} are taken out, how many pencils left",
    operation: "subtract",
  },
  {
    template: "A car travels {num1} miles then another {num2} miles, how many miles total",
    operation: "add",
  },
  {
    template: "A baker has {num1} loaves and sells {num2}, how many loaves left",
    operation: "subtract",
  },
];

function randomCase(char: string): string {
  return Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase();
}

function addNoise(word: string): string {
  const chars = word.split("");
  const result: string[] = [];

  for (let i = 0; i < chars.length; i++) {
    result.push(randomCase(chars[i]));

    if (Math.random() > 0.7 && i < chars.length - 1) {
      const noiseChar = NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)];
      result.push(noiseChar);
    }
  }

  return result.join("");
}

function obfuscateText(text: string): string {
  const words = text.split(" ");
  const obfuscatedWords = words.map((word) => {
    if (Math.random() > 0.6) {
      return addNoise(word);
    }
    return word
      .split("")
      .map((char) => randomCase(char))
      .join("");
  });

  return obfuscatedWords.join(" ");
}

export function generateChallenge(): Challenge {
  const templateObj = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  const { template, operation } = templateObj;

  const num1 = Math.floor(Math.random() * 40) + 10;
  const num2 = Math.floor(Math.random() * 20) + 5;

  let answer: number;
  if (operation === "add") {
    answer = num1 + num2;
  } else {
    answer = Math.max(num1 - num2, 0);
  }

  const num1Words = NUMBER_WORDS[num1] || [String(num1)];
  const num2Words = NUMBER_WORDS[num2] || [String(num2)];

  const num1Text = num1Words[Math.floor(Math.random() * num1Words.length)];
  const num2Text = num2Words[Math.floor(Math.random() * num2Words.length)];

  const originalText = template
    .replace("{num1}", num1Text)
    .replace("{num2}", num2Text);

  const obfuscatedText = obfuscateText(originalText);

  return {
    originalText,
    obfuscatedText,
    answer: answer.toFixed(2),
  };
}

export function generateApiKey(): string {
  return `sk_oc_${crypto.randomBytes(32).toString("hex")}`;
}

export function generateVerificationCode(): string {
  return `oc_verify_${crypto.randomBytes(16).toString("hex")}`;
}

export function generateBindToken(): string {
  return `oc_bind_${crypto.randomBytes(24).toString("hex")}`;
}
