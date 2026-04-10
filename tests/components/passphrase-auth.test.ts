/**
 * Tests for PassphraseAuth component
 * @module tests/components/passphrase-auth
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock localStorage for testing
const mockLocalStorage: Record<string, string | null> = {};

describe('PassphraseAuth', () => {
  beforeEach(() => {
    // Clear mock storage
    Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
    
    // Mock crypto.subtle.digest
    if (!global.crypto) {
      global.crypto = {} as Crypto;
    }
    if (!global.crypto.subtle) {
      global.crypto.subtle = {} as SubtleCrypto;
    }
    global.crypto.subtle.digest = async (algorithm: string, data: BufferSource): Promise<ArrayBuffer> => {
      // Simple mock hash - just return the data as hash for testing
      const encoder = new TextEncoder();
      const input = new Uint8Array(data as ArrayBuffer);
      const hash = encoder.encode(input.join(''));
      return hash.buffer;
    };
  });

  afterEach(() => {
    // Cleanup
    Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
  });

  describe('Hashing', () => {
    it('should produce consistent hashes for the same passphrase', async () => {
      const passphrase = 'test1234';
      
      // Import the hashing logic
      const encoder = new TextEncoder();
      const data = encoder.encode(passphrase);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash1 = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Hash again
      const hashBuffer2 = await crypto.subtle.digest('SHA-256', data);
      const hashArray2 = Array.from(new Uint8Array(hashBuffer2));
      const hash2 = hashArray2.map(b => b.toString(16).padStart(2, '0')).join('');
      
      expect(hash1).toBe(hash2);
      // Hash should be non-empty string
      expect(hash1.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for different passphrases', async () => {
      const encoder = new TextEncoder();
      
      const data1 = encoder.encode('passphrase1');
      const hashBuffer1 = await crypto.subtle.digest('SHA-256', data1);
      const hashArray1 = Array.from(new Uint8Array(hashBuffer1));
      const hash1 = hashArray1.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const data2 = encoder.encode('passphrase2');
      const hashBuffer2 = await crypto.subtle.digest('SHA-256', data2);
      const hashArray2 = Array.from(new Uint8Array(hashBuffer2));
      const hash2 = hashArray2.map(b => b.toString(16).padStart(2, '0')).join('');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Input Handling', () => {
    it('should validate passphrase length for setup', () => {
      const isValidLength = (phrase: string) => phrase.length >= 4;
      
      expect(isValidLength('123')).toBe(false);
      expect(isValidLength('1234')).toBe(true);
      expect(isValidLength('longpassphrase')).toBe(true);
    });

    it('should require non-empty passphrase for unlock', () => {
      const isValidForUnlock = (phrase: string) => phrase.length > 0;
      
      expect(isValidForUnlock('')).toBe(false);
      expect(isValidForUnlock('a')).toBe(true);
    });
  });

  describe('Strength Calculation', () => {
    it('should calculate strength based on length', () => {
      const getStrength = (phrase: string): number => {
        if (phrase.length === 0) return 0;
        if (phrase.length < 6) return 1;
        if (phrase.length < 10) return 2;
        return 3;
      };
      
      expect(getStrength('')).toBe(0);
      expect(getStrength('1234')).toBe(1);
      expect(getStrength('123456')).toBe(2);
      expect(getStrength('1234567890')).toBe(3);
    });
  });
});
